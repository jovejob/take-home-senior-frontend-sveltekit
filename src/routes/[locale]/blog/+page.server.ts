import { getPosts } from '$lib/server/data/posts';
import { getTags } from '$lib/server/data/tags';
import type { Locale } from '$lib/schemas/locale';
import type { PageServerLoad } from './$types';

const PER_PAGE = 6;

export const load: PageServerLoad = ({ url, params }) => {
	// The [locale] layout above this already validated params.locale — safe
	// to narrow here rather than re-check.
	const locale = params.locale as Locale;
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const tag = url.searchParams.get('tag') ?? 'all';

	const postsResult = getPosts({ locale, q: '', tag, sort: 'newest', page, perPage: PER_PAGE });
	const tags = getTags();

	return { postsResult, tags, tag };
};
