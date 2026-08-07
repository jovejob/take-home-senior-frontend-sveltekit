import { getPosts } from '$lib/server/data/posts';
import { getTags } from '$lib/server/data/tags';
import type { Locale } from '$lib/schemas/locale';
import type { PageServerLoad } from './$types';

const PER_PAGE = 8;

export const load: PageServerLoad = ({ url, params }) => {
	const locale = params.locale as Locale;
	const q = url.searchParams.get('q') ?? '';
	const tag = url.searchParams.get('tag') ?? 'all';
	const sort = url.searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	const postsResult = getPosts({ locale, q, tag, sort, page, perPage: PER_PAGE });
	const tags = getTags();

	return { postsResult, tags, q, tag, sort };
};
