import { describe, expect, it } from 'vitest';
import { parseItemsQuery, serializeItemsQuery, DEFAULT_ITEMS_QUERY } from '$lib/utils/url-state';

describe('parseItemsQuery', () => {
	it('returns all defaults for empty search params', () => {
		const result = parseItemsQuery(new URLSearchParams());
		expect(result).toEqual(DEFAULT_ITEMS_QUERY);
	});

	it('parses valid params into their typed equivalents', () => {
		const result = parseItemsQuery(
			new URLSearchParams(
				'page=3&perPage=25&sort=budget&dir=asc&q=launch&status=active&channel=email'
			)
		);
		expect(result).toEqual({
			page: 3,
			perPage: 25,
			sort: 'budget',
			dir: 'asc',
			q: 'launch',
			status: 'active',
			channel: 'email'
		});
	});

	it('falls back to defaults for invalid enum values instead of throwing', () => {
		const result = parseItemsQuery(new URLSearchParams('sort=not-a-real-column&status=bogus'));
		expect(result.sort).toBe(DEFAULT_ITEMS_QUERY.sort);
		expect(result.status).toBe(DEFAULT_ITEMS_QUERY.status);
	});

	it('falls back to defaults for non-numeric page/perPage', () => {
		const result = parseItemsQuery(new URLSearchParams('page=abc&perPage=-5'));
		expect(result.page).toBe(DEFAULT_ITEMS_QUERY.page);
		expect(result.perPage).toBe(DEFAULT_ITEMS_QUERY.perPage);
	});
});

describe('serializeItemsQuery', () => {
	it('produces an empty string for the all-defaults query', () => {
		const params = serializeItemsQuery(DEFAULT_ITEMS_QUERY);
		expect(params.toString()).toBe('');
	});

	it('only includes fields that differ from the default', () => {
		const params = serializeItemsQuery({ ...DEFAULT_ITEMS_QUERY, status: 'active', page: 2 });
		expect(params.get('status')).toBe('active');
		expect(params.get('page')).toBe('2');
		expect(params.has('sort')).toBe(false);
		expect(params.has('dir')).toBe(false);
	});

	it('round-trips through parse -> serialize -> parse without loss', () => {
		const original = parseItemsQuery(
			new URLSearchParams('page=4&sort=ctr&dir=asc&q=beta&channel=push')
		);
		const roundTripped = parseItemsQuery(serializeItemsQuery(original));
		expect(roundTripped).toEqual(original);
	});
});
