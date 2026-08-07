import { redirect, type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, readSessionToken } from '$lib/server/auth/session';
import { findUserById } from '$lib/server/data/users';
import { toSafeUser } from '$lib/server/schemas/user';
import { SUPPORTED_LOCALES } from '$lib/schemas/locale';

const DEFAULT_LOCALE = 'en';
const DASHBOARD_PATTERN = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})/dashboard(/|$)`);
const LOCALE_PREFIX_PATTERN = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(/|$)`);

export const handle: Handle = async ({ event, resolve }) => {
	// Bare root (no locale segment) redirects to a default locale. A real
	// implementation might negotiate this from Accept-Language; defaulting
	// to `en` is a deliberate, simple, defensible choice for this scope.
	if (event.url.pathname === '/') {
		throw redirect(307, `/${DEFAULT_LOCALE}`);
	}

	const localeMatch = event.url.pathname.match(LOCALE_PREFIX_PATTERN);
	const locale = localeMatch?.[1] ?? DEFAULT_LOCALE;

	const token = event.cookies.get(SESSION_COOKIE_NAME);
	const payload = await readSessionToken(token);
	const user = payload ? findUserById(payload.sub) : null;
	event.locals.session = user ? toSafeUser(user) : null;

	if (DASHBOARD_PATTERN.test(event.url.pathname) && !event.locals.session) {
		const redirectTo = event.url.pathname + event.url.search;
		throw redirect(303, `/${locale}/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});
};
