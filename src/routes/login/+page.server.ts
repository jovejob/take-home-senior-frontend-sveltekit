import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { LoginSchema } from '$lib/schemas/auth';
import { findUserByEmail } from '$lib/server/data/users';
import { verifyPassword } from '$lib/server/auth/password';
import {
	createSessionToken,
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE_SECONDS
} from '$lib/server/auth/session';
import { toSafeUser } from '$lib/server/schemas/user';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(303, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = LoginSchema.safeParse(formData);

		if (!parsed.success) {
			return fail(400, {
				error: 'Invalid email or password.',
				email: typeof formData.email === 'string' ? formData.email : ''
			});
		}

		const user = findUserByEmail(parsed.data.email);
		if (!user || !verifyPassword(parsed.data.password, user.password)) {
			return fail(400, {
				error: 'Invalid email or password.',
				email: parsed.data.email
			});
		}

		const token = createSessionToken(toSafeUser(user));
		cookies.set(SESSION_COOKIE_NAME, token, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: SESSION_MAX_AGE_SECONDS
		});

		throw redirect(303, '/dashboard');
	}
};
