import { dev } from '$app/environment';
import { getItems } from '$lib/server/data/items';
import { parseItemsQuery } from '$lib/utils/url-state';
import type { PageServerLoad } from './$types';

async function fetchItems(query: ReturnType<typeof parseItemsQuery>) {
	// Stands in for real network/DB latency so the streamed-skeleton behavior
	// is actually visible in dev. The mock data itself is synchronous
	// in-memory array work - a real backend wouldn't need this, and it's
	// intentionally left out of production builds.
	if (dev) await new Promise((resolve) => setTimeout(resolve, 400));
	return getItems(query);
}

export const load: PageServerLoad = ({ url, depends }) => {
	// Lets the edit action re-trigger just this load via invalidate('app:items')
	// instead of invalidating the whole route tree.
	depends('app:items');

	const query = parseItemsQuery(url.searchParams);

	return {
		query,
		// Deliberately not awaited — SvelteKit streams this promise to the
		// client, rendering the rest of the page (and a skeleton) immediately.
		itemsResult: fetchItems(query)
	};
};
