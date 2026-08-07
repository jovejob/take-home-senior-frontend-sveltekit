import type { LayoutServerLoad } from './$types';

// Auth guard itself lives in hooks.server.ts (redirects unauthenticated
// requests before this ever runs) — this load just passes the already-
// verified session through to the page/layout component.
export const load: LayoutServerLoad = async ({ locals }) => {
	return { user: locals.session };
};
