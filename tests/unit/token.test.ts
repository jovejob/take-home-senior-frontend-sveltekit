import { describe, expect, it } from 'vitest';
import { signSession, verifySessionToken, type SessionPayload } from '$lib/server/auth/token';

const SECRET = 'test-secret-do-not-use-in-prod';

function futurePayload(overrides: Partial<SessionPayload> = {}): SessionPayload {
	return {
		sub: 'demo_admin',
		role: 'admin',
		exp: Math.floor(Date.now() / 1000) + 3600,
		...overrides
	};
}

describe('signSession / verifySessionToken', () => {
	it('round-trips a valid payload', async () => {
		const payload = futurePayload();
		const token = await signSession(payload, SECRET);
		expect(await verifySessionToken(token, SECRET)).toEqual(payload);
	});

	it('rejects a token signed with a different secret', async () => {
		const token = await signSession(futurePayload(), SECRET);
		expect(await verifySessionToken(token, 'wrong-secret')).toBeNull();
	});

	it('rejects a tampered payload even with a matching-looking signature', async () => {
		const token = await signSession(futurePayload({ role: 'viewer' }), SECRET);
		const [, signature] = token.split('.');
		const tamperedToken = `${btoa(JSON.stringify(futurePayload({ role: 'admin' })))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '')}.${signature}`;
		expect(tamperedToken).not.toBe(token);
		expect(await verifySessionToken(tamperedToken, SECRET)).toBeNull();
	});

	it('rejects an expired token', async () => {
		const expired = futurePayload({ exp: Math.floor(Date.now() / 1000) - 10 });
		const token = await signSession(expired, SECRET);
		expect(await verifySessionToken(token, SECRET)).toBeNull();
	});

	it('rejects a malformed token', async () => {
		expect(await verifySessionToken('not-a-real-token', SECRET)).toBeNull();
		expect(await verifySessionToken('', SECRET)).toBeNull();
	});
});
