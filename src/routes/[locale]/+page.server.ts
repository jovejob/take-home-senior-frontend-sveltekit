// deliberate SSG choice — home is fully static per locale, so we prerender it at build time rather than render it per-request
import { SUPPORTED_LOCALES } from '$lib/schemas/locale';
import type { PageServerLoad } from './$types';

export const prerender = true;

export function entries() {
	return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export const load: PageServerLoad = () => {
	return {};
};
