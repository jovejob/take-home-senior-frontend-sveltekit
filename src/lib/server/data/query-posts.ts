import type { Post } from '$lib/server/schemas/post';
import type { Locale } from '$lib/schemas/locale';

export interface PostsQuery {
	locale: Locale;
	q: string;
	tag: string | 'all';
	sort: 'newest' | 'oldest';
	page: number;
	perPage: number;
}

export interface PostsQueryResult {
	rows: Post[];
	total: number;
	page: number;
	perPage: number;
	pageCount: number;
}

/**
 * Filters, sorts, and paginates posts against the requested locale's
 * translation text — same shape as queryItems, for the same reason: pure
 * and I/O-free so it's directly unit-testable with fixtures.
 */
export function queryPosts(posts: Post[], query: PostsQuery): PostsQueryResult {
	let rows = posts;

	if (query.q.trim()) {
		const needle = query.q.trim().toLowerCase();
		rows = rows.filter((post) => {
			const t = post.translations[query.locale];
			return t.title.toLowerCase().includes(needle) || t.excerpt.toLowerCase().includes(needle);
		});
	}
	if (query.tag !== 'all') {
		rows = rows.filter((post) => post.tags.includes(query.tag));
	}

	const dirMultiplier = query.sort === 'oldest' ? 1 : -1;
	rows = [...rows].sort(
		(a, b) =>
			(new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * dirMultiplier
	);

	const total = rows.length;
	const pageCount = Math.max(1, Math.ceil(total / query.perPage));
	const page = Math.min(Math.max(1, query.page), pageCount);
	const start = (page - 1) * query.perPage;

	return {
		rows: rows.slice(start, start + query.perPage),
		total,
		page,
		perPage: query.perPage,
		pageCount
	};
}
