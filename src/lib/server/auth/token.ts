export interface SessionPayload {
	sub: string; // user id
	role: string;
	exp: number; // unix seconds
}

// Web Crypto API only (crypto.subtle, atob/btoa) — deliberately avoids
// node:crypto and Buffer, since this module is imported by hooks.server.ts,
// which runs before every request including edge routes, where Node
// built-ins aren't available.

function base64url(bytes: ArrayBuffer | Uint8Array): string {
	let binary = '';
	for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBytes(value: string): Uint8Array {
	const padLength = (4 - (value.length % 4)) % 4;
	const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret) as BufferSource,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

/** Produces a compact `<payload>.<signature>` token. */
export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
	const key = await importKey(secret);
	const encodedPayload = base64url(new TextEncoder().encode(JSON.stringify(payload)));
	const signatureBytes = await crypto.subtle.sign(
		'HMAC',
		key,
		new TextEncoder().encode(encodedPayload) as BufferSource
	);
	return `${encodedPayload}.${base64url(signatureBytes)}`;
}

/**
 * Verifies signature and expiry. Returns the payload if valid, otherwise
 * null — never throws, since this runs on every request against
 * user-controlled cookie input. `crypto.subtle.verify` does the
 * signature comparison in constant time internally.
 */
export async function verifySessionToken(
	token: string,
	secret: string
): Promise<SessionPayload | null> {
	const parts = token.split('.');
	if (parts.length !== 2) return null;
	const [encodedPayload, signature] = parts;
	if (!encodedPayload || !signature) return null;

	const key = await importKey(secret);
	const valid = await crypto.subtle.verify(
		'HMAC',
		key,
		base64urlToBytes(signature) as BufferSource,
		new TextEncoder().encode(encodedPayload) as BufferSource
	);
	if (!valid) return null;

	let payload: SessionPayload;
	try {
		payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(encodedPayload)));
	} catch {
		return null;
	}

	if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
		return null;
	}

	return payload;
}
