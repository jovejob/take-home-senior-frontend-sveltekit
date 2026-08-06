import { z } from 'zod';
import { ItemStatusSchema, ItemChannelSchema } from '$lib/schemas/item';

export {
	ITEM_STATUSES,
	ItemStatusSchema,
	ITEM_CHANNELS,
	ItemChannelSchema,
	ITEM_SORT_FIELDS
} from '$lib/schemas/item';
export type { ItemStatus, ItemChannel, ItemSortField } from '$lib/schemas/item';

const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');

export const ItemSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	status: ItemStatusSchema,
	channel: ItemChannelSchema,
	owner: z.object({
		id: z.string().min(1),
		name: z.string().min(1)
	}),
	budget: z.number().nonnegative(),
	spent: z.number().nonnegative(),
	impressions: z.number().int().nonnegative(),
	clicks: z.number().int().nonnegative(),
	ctr: z.number().min(0).max(1),
	startDate: DateOnlySchema,
	endDate: DateOnlySchema,
	updatedAt: z.string().datetime(),
	tags: z.array(z.string())
});

export type Item = z.infer<typeof ItemSchema>;
export const ItemsSchema = z.array(ItemSchema);
