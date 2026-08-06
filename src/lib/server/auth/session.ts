import { SESSION_SECRET } from '$env/static/private';
import { signSession, verifySessionToken, type SessionPayload } from './token';
import type { SafeUser } from '$lib/server/schemas/user';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function createSessionToken(user: SafeUser): string {
	const payload: SessionPayload = {
		sub: user.id,
		role: user.role,
		exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
	};
	return signSession(payload, SESSION_SECRET);
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
	if (!token) return null;
	return verifySessionToken(token, SESSION_SECRET);
}
