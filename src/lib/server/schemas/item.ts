import { z } from 'zod';

export const ITEM_STATUSES = [
	'draft',
	'scheduled',
	'active',
	'paused',
	'completed',
	'archived'
] as const;
export const ItemStatusSchema = z.enum(ITEM_STATUSES);
export type ItemStatus = z.infer<typeof ItemStatusSchema>;

export const ITEM_CHANNELS = ['email', 'sms', 'web', 'social', 'push'] as const;
export const ItemChannelSchema = z.enum(ITEM_CHANNELS);
export type ItemChannel = z.infer<typeof ItemChannelSchema>;

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

// Sortable columns for the dashboard table — kept in sync with the query
// codec in $lib/utils/url-state.ts.
export const ITEM_SORT_FIELDS = [
	'name',
	'status',
	'channel',
	'owner',
	'budget',
	'spent',
	'ctr',
	'updatedAt'
] as const;
export type ItemSortField = (typeof ITEM_SORT_FIELDS)[number];
