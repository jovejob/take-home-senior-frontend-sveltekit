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
