import { describe, expect, it } from 'vitest';
import { queryItems, type ItemsQuery } from '$lib/server/data/query-items';
import type { Item } from '$lib/server/schemas/item';

function makeItem(overrides: Partial<Item>): Item {
	return {
		id: 'cmp_0001',
		name: 'Test campaign',
		status: 'active',
		channel: 'email',
		owner: { id: 'u_1', name: 'Zoe Adams' },
		budget: 1000,
		spent: 500,
		impressions: 1000,
		clicks: 50,
		ctr: 0.05,
		startDate: '2026-01-01',
		endDate: '2026-02-01',
		updatedAt: '2026-01-15T00:00:00Z',
		tags: [],
		...overrides
	};
}

const FIXTURE: Item[] = [
	makeItem({
		id: '1',
		name: 'Autumn launch',
		status: 'active',
		channel: 'email',
		budget: 5000,
		owner: { id: 'u1', name: 'Bea' },
		updatedAt: '2026-03-01T00:00:00Z'
	}),
	makeItem({
		id: '2',
		name: 'Winter push',
		status: 'draft',
		channel: 'sms',
		budget: 1000,
		owner: { id: 'u2', name: 'Amir' },
		updatedAt: '2026-01-01T00:00:00Z'
	}),
	makeItem({
		id: '3',
		name: 'Spring rollout',
		status: 'active',
		channel: 'web',
		budget: 9000,
		owner: { id: 'u3', name: 'Cy' },
		updatedAt: '2026-02-01T00:00:00Z'
	})
];

const BASE_QUERY: ItemsQuery = {
	page: 1,
	perPage: 10,
	sort: 'updatedAt',
	dir: 'desc',
	q: '',
	status: 'all',
	channel: 'all'
};

describe('queryItems', () => {
	it('filters by case-insensitive name substring', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, q: 'AUTUMN' });
		expect(result.rows.map((r) => r.id)).toEqual(['1']);
	});

	it('filters by status', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, status: 'draft' });
		expect(result.rows.map((r) => r.id)).toEqual(['2']);
	});

	it('filters by channel', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, channel: 'web' });
		expect(result.rows.map((r) => r.id)).toEqual(['3']);
	});

	it('combines multiple filters', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, status: 'active', channel: 'web' });
		expect(result.rows.map((r) => r.id)).toEqual(['3']);
	});

	it('sorts numerically by budget ascending', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, sort: 'budget', dir: 'asc' });
		expect(result.rows.map((r) => r.id)).toEqual(['2', '1', '3']);
	});

	it('sorts by nested owner.name', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, sort: 'owner', dir: 'asc' });
		expect(result.rows.map((r) => r.id)).toEqual(['2', '1', '3']); // Amir, Bea, Cy
	});

	it('paginates correctly and reports total/pageCount', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, perPage: 2, page: 2 });
		expect(result.rows).toHaveLength(1);
		expect(result.total).toBe(3);
		expect(result.pageCount).toBe(2);
		expect(result.page).toBe(2);
	});

	it('clamps an out-of-range page to the last valid page', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, perPage: 2, page: 99 });
		expect(result.page).toBe(2);
		expect(result.rows).toHaveLength(1);
	});

	it('returns an empty result set for a query matching nothing, without throwing', () => {
		const result = queryItems(FIXTURE, { ...BASE_QUERY, q: 'no such campaign exists' });
		expect(result.rows).toEqual([]);
		expect(result.total).toBe(0);
		expect(result.pageCount).toBe(1);
	});
});
