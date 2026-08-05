import rawItems from './mocks/items.json';
import { ItemsSchema } from '$lib/server/schemas/item';
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
