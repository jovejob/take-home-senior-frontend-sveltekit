import { z } from 'zod';
import { ITEM_SORT_FIELDS, ItemChannelSchema, ItemStatusSchema } from '$lib/schemas/item';
import type { ItemsQuery } from '$lib/server/data/query-items';

const DEFAULT_QUERY: ItemsQuery = {
	page: 1,
	perPage: 10,
	sort: 'updatedAt',
	dir: 'desc',
	q: '',
	status: 'all',
	channel: 'all'
};

// Coercing, defaulting schema — every field falls back safely rather than
// throwing, since this reads directly from user-editable URL params.
const ItemsQueryParamsSchema = z.object({
	page: z.coerce.number().int().positive().catch(DEFAULT_QUERY.page),
	perPage: z.coerce.number().int().positive().max(100).catch(DEFAULT_QUERY.perPage),
	sort: z.enum(ITEM_SORT_FIELDS).catch(DEFAULT_QUERY.sort),
	dir: z.enum(['asc', 'desc']).catch(DEFAULT_QUERY.dir),
	q: z.string().catch(DEFAULT_QUERY.q),
	status: z.union([ItemStatusSchema, z.literal('all')]).catch(DEFAULT_QUERY.status),
	channel: z.union([ItemChannelSchema, z.literal('all')]).catch(DEFAULT_QUERY.channel)
});

/** URLSearchParams -> typed, defaulted ItemsQuery. Never throws. */
export function parseItemsQuery(searchParams: URLSearchParams): ItemsQuery {
	return ItemsQueryParamsSchema.parse({
		page: searchParams.get('page') ?? undefined,
		perPage: searchParams.get('perPage') ?? undefined,
		sort: searchParams.get('sort') ?? undefined,
		dir: searchParams.get('dir') ?? undefined,
		q: searchParams.get('q') ?? undefined,
		status: searchParams.get('status') ?? undefined,
		channel: searchParams.get('channel') ?? undefined
	});
}

/**
 * Typed ItemsQuery -> URLSearchParams, omitting anything that's already the
 * default so the URL stays clean (e.g. `?status=active` not
 * `?page=1&perPage=10&sort=updatedAt&dir=desc&q=&status=active&channel=all`).
 */
export function serializeItemsQuery(query: ItemsQuery): URLSearchParams {
	const params = new URLSearchParams();
	if (query.page !== DEFAULT_QUERY.page) params.set('page', String(query.page));
	if (query.perPage !== DEFAULT_QUERY.perPage) params.set('perPage', String(query.perPage));
	if (query.sort !== DEFAULT_QUERY.sort) params.set('sort', query.sort);
	if (query.dir !== DEFAULT_QUERY.dir) params.set('dir', query.dir);
	if (query.q !== DEFAULT_QUERY.q) params.set('q', query.q);
	if (query.status !== DEFAULT_QUERY.status) params.set('status', query.status);
	if (query.channel !== DEFAULT_QUERY.channel) params.set('channel', query.channel);
	return params;
}

export { DEFAULT_QUERY as DEFAULT_ITEMS_QUERY };
