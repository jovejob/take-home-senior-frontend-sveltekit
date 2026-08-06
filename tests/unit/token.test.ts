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
	it('round-trips a valid payload', () => {
		const payload = futurePayload();
		const token = signSession(payload, SECRET);
		expect(verifySessionToken(token, SECRET)).toEqual(payload);
	});

	it('rejects a token signed with a different secret', () => {
		const token = signSession(futurePayload(), SECRET);
		expect(verifySessionToken(token, 'wrong-secret')).toBeNull();
	});

	it('rejects a tampered payload even with a matching-looking signature', () => {
		const token = signSession(futurePayload({ role: 'viewer' }), SECRET);
		const [, signature] = token.split('.');
		const tamperedPayload = Buffer.from(JSON.stringify(futurePayload({ role: 'admin' }))).toString(
			'base64url'
		);

		const tamperedToken = `${tamperedPayload}.${signature}`;
		expect(tamperedToken).not.toBe(token);
		expect(verifySessionToken(tamperedToken, SECRET)).toBeNull();
	});

	it('rejects an expired token', () => {
		const expired = futurePayload({ exp: Math.floor(Date.now() / 1000) - 10 });
		const token = signSession(expired, SECRET);
		expect(verifySessionToken(token, SECRET)).toBeNull();
	});

	it('rejects a malformed token', () => {
		expect(verifySessionToken('not-a-real-token', SECRET)).toBeNull();
		expect(verifySessionToken('', SECRET)).toBeNull();
	});
});
