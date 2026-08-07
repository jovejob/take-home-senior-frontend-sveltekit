import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { dev } from '$app/environment';
import { getItems, updateItemStatus } from '$lib/server/data/items';
import { ItemStatusSchema } from '$lib/server/schemas/item';
import { parseItemsQuery } from '$lib/utils/url-state';
import type { Actions, PageServerLoad } from './$types';

async function fetchItems(query: ReturnType<typeof parseItemsQuery>) {
	// Stands in for real network/DB latency so the streamed-skeleton behavior
	// is actually visible in dev. The mock data itself is synchronous
	// in-memory array work — a real backend wouldn't need this, and it's
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

const UpdateStatusSchema = z.object({
	id: z.string().min(1),
	status: ItemStatusSchema
});

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = UpdateStatusSchema.safeParse(formData);
		if (!parsed.success) {
			return fail(400, { error: 'Invalid update.' });
		}

		// Simulated latency + occasional failure — stands in for a real API/DB
		// write, since the mock data has no persistence layer. Playwright
		// tests the rollback path deterministically by intercepting this
		// request rather than relying on this random chance.
		await new Promise((resolve) => setTimeout(resolve, 500));
		if (Math.random() < 0.2) {
			return fail(500, { error: 'Failed to update campaign. Please try again.' });
		}

		const updated = updateItemStatus(parsed.data.id, parsed.data.status);
		if (!updated) {
			return fail(404, { error: 'Campaign not found.' });
		}

		return { success: true };
	}
};
