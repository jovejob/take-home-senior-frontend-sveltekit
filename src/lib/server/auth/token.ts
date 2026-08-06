import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SessionPayload {
	sub: string; // user id
	role: string;
	exp: number; // unix seconds
}

function base64url(input: Buffer | string): string {
	return Buffer.from(input).toString('base64url');
}

function sign(data: string, secret: string): string {
	return base64url(createHmac('sha256', secret).update(data).digest());
}

/** Produces a compact `<payload>.<signature>` token. Pure — no cookies, no env. */
export function signSession(payload: SessionPayload, secret: string): string {
	const encodedPayload = base64url(JSON.stringify(payload));
	const signature = sign(encodedPayload, secret);
	return `${encodedPayload}.${signature}`;
}

/**
 * Verifies signature and expiry. Returns the payload if valid, otherwise
 * null — never throws, since this runs on every request against
 * user-controlled cookie input.
 */
export function verifySessionToken(token: string, secret: string): SessionPayload | null {
	const parts = token.split('.');
	if (parts.length !== 2) return null;

	const [encodedPayload, signature] = parts;
	if (!encodedPayload || !signature) return null;

	const expectedSignature = sign(encodedPayload, secret);
	const actual = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
		return null;
	}

	let payload: SessionPayload;
	try {
		payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
	} catch {
		return null;
	}

	if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
		return null;
	}

	return payload;
}
