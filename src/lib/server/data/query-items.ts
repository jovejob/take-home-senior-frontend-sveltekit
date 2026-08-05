import type { Item, ItemSortField, ItemStatus, ItemChannel } from '$lib/server/schemas/item';

export interface ItemsQuery {
	page: number;
	perPage: number;
	sort: ItemSortField;
	dir: 'asc' | 'desc';
	q: string;
	status: ItemStatus | 'all';
	channel: ItemChannel | 'all';
}

export interface ItemsQueryResult {
	rows: Item[];
	total: number;
	page: number;
	perPage: number;
	pageCount: number;
}

function sortValue(item: Item, field: ItemSortField): string | number {
	if (field === 'owner') return item.owner.name;
	return item[field];
}

/**
 * Filters, sorts, and paginates a full Item collection in-memory — this is
 * the same shape of work a real API's query endpoint would do server-side
 * against a database. Treat this function's contract as the thing standing
 * in for `items.json` being a real paginated/filterable/sortable API.
 */
export function queryItems(items: Item[], query: ItemsQuery): ItemsQueryResult {
	let rows = items;

	if (query.q.trim()) {
		const needle = query.q.trim().toLowerCase();
		rows = rows.filter((item) => item.name.toLowerCase().includes(needle));
	}
	if (query.status !== 'all') {
		rows = rows.filter((item) => item.status === query.status);
	}
	if (query.channel !== 'all') {
		rows = rows.filter((item) => item.channel === query.channel);
	}

	const dirMultiplier = query.dir === 'asc' ? 1 : -1;
	rows = [...rows].sort((a, b) => {
		const av = sortValue(a, query.sort);
		const bv = sortValue(b, query.sort);
		if (typeof av === 'string' && typeof bv === 'string') {
			return av.localeCompare(bv) * dirMultiplier;
		}
		if (av < bv) return -1 * dirMultiplier;
		if (av > bv) return 1 * dirMultiplier;
		return 0;
	});

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
