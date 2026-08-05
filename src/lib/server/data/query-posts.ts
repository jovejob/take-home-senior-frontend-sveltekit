import type { Post } from '$lib/server/schemas/post';
import type { Locale } from '$lib/server/schemas/tag';

export interface PostsQuery {
	locale: Locale;
	q: string;
	tag: string | 'all';
	sort: 'newest' | 'oldest';
}

/** Filters and sorts posts against the requested locale's translation text. */
export function queryPosts(posts: Post[], query: PostsQuery): Post[] {
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
	return [...rows].sort(
		(a, b) =>
			(new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * dirMultiplier
	);
}
