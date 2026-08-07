import { describe, expect, it } from 'vitest';
import { queryPosts, type PostsQuery } from '$lib/server/data/query-posts';
import type { Post } from '$lib/server/schemas/post';

function makePost(overrides: Partial<Post>): Post {
	return {
		id: 'post_001',
		slug: 'test-post',
		translations: {
			en: { title: 'Test post', excerpt: 'A test excerpt', body: 'Body' },
			de: { title: 'Testbeitrag', excerpt: 'Ein Test-Exzerpt', body: 'Text' }
		},
		tags: [],
		author: { id: 'u1', name: 'Author', avatarColor: '#000000' },
		publishedAt: '2026-01-01T00:00:00Z',
		readingTimeMinutes: 3,
		coverColor: '#111111',
		...overrides
	};
}

const FIXTURE: Post[] = [
	makePost({
		id: '1',
		slug: 'first',
		tags: ['engineering'],
		publishedAt: '2026-01-01T00:00:00Z',
		translations: {
			en: { title: 'First post', excerpt: 'about performance', body: 'x' },
			de: { title: 'Erster Beitrag', excerpt: 'über Leistung', body: 'x' }
		}
	}),
	makePost({
		id: '2',
		slug: 'second',
		tags: ['design'],
		publishedAt: '2026-02-01T00:00:00Z',
		translations: {
			en: { title: 'Second post', excerpt: 'about tokens', body: 'x' },
			de: { title: 'Zweiter Beitrag', excerpt: 'über Tokens', body: 'x' }
		}
	}),
	makePost({
		id: '3',
		slug: 'third',
		tags: ['engineering', 'performance'],
		publishedAt: '2026-03-01T00:00:00Z',
		translations: {
			en: { title: 'Third post', excerpt: 'about caching', body: 'x' },
			de: { title: 'Dritter Beitrag', excerpt: 'über Caching', body: 'x' }
		}
	})
];

const BASE_QUERY: PostsQuery = {
	locale: 'en',
	q: '',
	tag: 'all',
	sort: 'newest',
	page: 1,
	perPage: 10
};

describe('queryPosts', () => {
	it('sorts newest first by default', () => {
		const result = queryPosts(FIXTURE, BASE_QUERY);
		expect(result.rows.map((p) => p.id)).toEqual(['3', '2', '1']);
	});

	it('sorts oldest first when requested', () => {
		const result = queryPosts(FIXTURE, { ...BASE_QUERY, sort: 'oldest' });
		expect(result.rows.map((p) => p.id)).toEqual(['1', '2', '3']);
	});

	it('filters by tag', () => {
		const result = queryPosts(FIXTURE, { ...BASE_QUERY, tag: 'engineering' });
		expect(result.rows.map((p) => p.id).sort()).toEqual(['1', '3']);
	});

	it('searches title and excerpt in the requested locale', () => {
		const result = queryPosts(FIXTURE, { ...BASE_QUERY, q: 'caching' });
		expect(result.rows.map((p) => p.id)).toEqual(['3']);
	});

	it('searches against German translations when locale is de', () => {
		const result = queryPosts(FIXTURE, { ...BASE_QUERY, locale: 'de', q: 'Caching' });
		expect(result.rows.map((p) => p.id)).toEqual(['3']);
	});

	it('paginates and reports total/pageCount', () => {
		const result = queryPosts(FIXTURE, { ...BASE_QUERY, perPage: 2, page: 1 });
		expect(result.rows).toHaveLength(2);
		expect(result.total).toBe(3);
		expect(result.pageCount).toBe(2);

		const page2 = queryPosts(FIXTURE, { ...BASE_QUERY, perPage: 2, page: 2 });
		expect(page2.rows).toHaveLength(1);
	});

	it('clamps an out-of-range page to the last valid page', () => {
		const result = queryPosts(FIXTURE, { ...BASE_QUERY, perPage: 2, page: 99 });
		expect(result.page).toBe(2);
	});
});
