import rawItems from './mocks/items.json';
import { ItemsSchema, type Item, type ItemStatus } from '$lib/server/schemas/item';
import { queryItems, type ItemsQuery, type ItemsQueryResult } from './query-items';

// Validated once at module load (server-only module — never bundled to the
// client). If the mock data ever drifts from the schema, this throws at
// startup rather than silently serving malformed data.
const ITEMS = ItemsSchema.parse(rawItems);

export function getItems(query: ItemsQuery): ItemsQueryResult {
	return queryItems(ITEMS, query);
}

export function getItemById(id: string) {
	return ITEMS.find((item) => item.id === id) ?? null;
}

/**
 * Mutates the in-memory mock data — there's no real database behind this
 * take-home, so this stands in for a write to persistent storage. On
 * Vercel's serverless runtime this won't persist across cold starts/
 * invocations, which is an acceptable, explicitly-scoped tradeoff for a
 * demo; a real deployment would swap this for an actual DB write with no
 * changes needed above this function.
 */
export function updateItemStatus(id: string, status: ItemStatus): Item | null {
	const item = ITEMS.find((i) => i.id === id);
	if (!item) return null;
	item.status = status;
	item.updatedAt = new Date().toISOString();
	return item;
}
