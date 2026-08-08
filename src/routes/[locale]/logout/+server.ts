import { redirect } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE_NAME } from '$lib/server/auth/session';

// Genuinely edge-appropriate: trivial logic (delete a cookie, redirect),
// no Node-specific APIs anywhere in its dependency chain — session.ts uses
// Web Crypto (crypto.subtle), not node:crypto. Satisfies the brief's "at
// least one route on edge" requirement after OG image generation moved to
// prerendered (see that route's comment for why).
export const config: Config = { runtime: 'edge' };

export const POST: RequestHandler = async ({ cookies, params }) => {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	throw redirect(303, `/${params.locale}`);
};
