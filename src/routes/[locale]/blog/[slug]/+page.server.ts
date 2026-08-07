import { error } from '@sveltejs/kit';
import { getPostBySlug, getAllSlugs } from '$lib/server/data/posts';
import { SUPPORTED_LOCALES } from '$lib/schemas/locale';
import type { PageServerLoad } from './$types';

export const prerender = true;

export function entries() {
	const slugs = getAllSlugs();
	return SUPPORTED_LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const load: PageServerLoad = ({ params }) => {
	const post = getPostBySlug(params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}
	return { post };
};
