import { redirect, type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, readSessionToken } from '$lib/server/auth/session';
import { findUserById } from '$lib/server/data/users';
import { toSafeUser } from '$lib/server/schemas/user';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE_NAME);
	const payload = readSessionToken(token);
	const user = payload ? findUserById(payload.sub) : null;

	event.locals.session = user ? toSafeUser(user) : null;

	if (event.url.pathname.startsWith('/dashboard') && !event.locals.session) {
		const redirectTo = event.url.pathname + event.url.search;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return resolve(event);
};
