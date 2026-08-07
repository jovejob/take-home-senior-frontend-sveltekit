<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { serializeItemsQuery } from '$lib/utils/url-state';
	import { ITEM_STATUSES, ITEM_CHANNELS, ITEM_SORT_FIELDS } from '$lib/schemas/item';
	import type { ItemSortField, ItemStatus } from '$lib/schemas/item';
	import type { Item } from '$lib/server/schemas/item';
	import type { ItemsQuery } from '$lib/server/data/query-items';
	import { t } from '$lib/i18n/t';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Heading from '$lib/components/primitives/Heading.svelte';
	import Input from '$lib/components/primitives/Input.svelte';
	import Select from '$lib/components/primitives/Select.svelte';
	import Badge from '$lib/components/primitives/Badge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchInput = $state('');
	let searchDebounceHandle: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		searchInput = data.query.q;
	});

	// Optimistic overrides for in-flight/failed status edits, keyed by item
	// id. Falls back to the item's real status when there's no pending edit.
	let pendingEdits = $state<Record<string, ItemStatus>>({});
	let editErrors = $state<Record<string, string>>({});

	function effectiveStatus(item: Item): ItemStatus {
		return pendingEdits[item.id] ?? item.status;
	}

	function updateQuery(partial: Partial<ItemsQuery>) {
		const next: ItemsQuery = {
			...data.query,
			...partial,
			page: partial.page ?? 1
		};
		const params = serializeItemsQuery(next);
		goto(params.toString() ? `?${params}` : '?', {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	function onSearchInput(value: string) {
		searchInput = value;
		clearTimeout(searchDebounceHandle);
		searchDebounceHandle = setTimeout(() => updateQuery({ q: value }), 300);
	}

	function toggleSort(field: ItemSortField) {
		if (data.query.sort === field) {
			updateQuery({ sort: field, dir: data.query.dir === 'asc' ? 'desc' : 'asc' });
		} else {
			updateQuery({ sort: field, dir: 'asc' });
		}
	}

	function sortIndicator(field: ItemSortField) {
		if (data.query.sort !== field) return '';
		return data.query.dir === 'asc' ? '▴' : '▾';
	}

	const COLUMN_LABEL_KEYS: Record<ItemSortField, string> = {
		name: 'dashboard.items.column.name',
		status: 'dashboard.items.column.status',
		channel: 'dashboard.items.column.channel',
		owner: 'dashboard.items.column.owner',
		budget: 'dashboard.items.column.budget',
		spent: 'dashboard.items.column.spent',
		ctr: 'dashboard.items.column.ctr',
		updatedAt: 'dashboard.items.column.updated'
	};

	const currencyFormatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
	const percentFormatter = new Intl.NumberFormat('en-US', {
		style: 'percent',
		minimumFractionDigits: 2
	});
	const dateFormatter = new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
</script>

<svelte:head>
	<title>{t(data.messages, 'dashboard.items.title')} — Dashboard</title>
</svelte:head>

<Heading level={1}>{t(data.messages, 'dashboard.items.title')}</Heading>

<div class="mt-4 flex flex-wrap items-end gap-3">
	<Input
		id="items-search"
		type="text"
		placeholder="Filter by name…"
		value={searchInput}
		oninput={(e: Event) => onSearchInput((e.currentTarget as HTMLInputElement).value)}
		class="min-w-[220px]"
	/>

	<Select
		id="items-status-filter"
		label={t(data.messages, 'dashboard.items.column.status')}
		value={data.query.status}
		onchange={(e: Event) =>
			updateQuery({ status: (e.currentTarget as HTMLSelectElement).value as ItemsQuery['status'] })}
	>
		<option value="all">All statuses</option>
		{#each ITEM_STATUSES as status (status)}
			<option value={status}>{status}</option>
		{/each}
	</Select>

	<Select
		id="items-channel-filter"
		label={t(data.messages, 'dashboard.items.column.channel')}
		value={data.query.channel}
		onchange={(e: Event) =>
			updateQuery({
				channel: (e.currentTarget as HTMLSelectElement).value as ItemsQuery['channel']
			})}
	>
		<option value="all">All channels</option>
		{#each ITEM_CHANNELS as channel (channel)}
			<option value={channel}>{channel}</option>
		{/each}
	</Select>
</div>

<div class="mt-4 overflow-hidden rounded-lg border border-border">
	{#await data.itemsResult}
		<table class="w-full text-sm">
			<tbody>
				{#each Array(data.query.perPage) as _, i (i)}
					<tr class="border-b border-border last:border-0">
						<td class="p-3"><div class="h-4 w-48 animate-pulse rounded bg-surface-soft"></div></td>
						<td class="p-3"><div class="h-4 w-16 animate-pulse rounded bg-surface-soft"></div></td>
						<td class="p-3"><div class="h-4 w-16 animate-pulse rounded bg-surface-soft"></div></td>
						<td class="p-3"><div class="h-4 w-24 animate-pulse rounded bg-surface-soft"></div></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:then result}
		{#if result.rows.length === 0}
			<div class="p-8 text-center text-fg-muted">{t(data.messages, 'dashboard.items.empty')}</div>
		{:else}
			<table class="w-full text-sm">
				<thead class="bg-surface-soft text-xs uppercase tracking-wide text-fg-muted">
					<tr>
						{#each ITEM_SORT_FIELDS as field (field)}
							<th
								class="cursor-pointer select-none p-3 text-left"
								onclick={() => toggleSort(field)}
							>
								{t(data.messages, COLUMN_LABEL_KEYS[field])}
								<span class="text-accent">{sortIndicator(field)}</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each result.rows as item (item.id)}
						<tr class="border-t border-border hover:bg-surface-soft">
							<td class="p-3 font-medium text-fg">{item.name}</td>
							<td class="p-3">
								<form
									method="POST"
									action="?/updateStatus"
									use:enhance={({ formData }) => {
										const newStatus = formData.get('status') as ItemStatus;
										const previous = effectiveStatus(item);
										pendingEdits[item.id] = newStatus;
										delete editErrors[item.id];

										return async ({ result }) => {
											if (result.type === 'success') {
												delete pendingEdits[item.id];
												await invalidate('app:items');
												toastStore.push('success', `${item.name} updated to ${newStatus}.`);
											} else {
												pendingEdits[item.id] = previous;
												const message =
													result.type === 'failure' &&
													result.data &&
													typeof result.data === 'object' &&
													'error' in result.data
														? String(result.data.error)
														: 'Update failed.';
												editErrors[item.id] = message;
												toastStore.push('error', message);
											}
										};
									}}
								>
									<input type="hidden" name="id" value={item.id} />
									<select
										name="status"
										aria-label="Status for {item.name}"
										value={effectiveStatus(item)}
										onchange={(e) => e.currentTarget.form?.requestSubmit()}
										class="rounded border border-border bg-surface px-2 py-1 text-xs capitalize outline-none focus:border-accent"
									>
										{#each ITEM_STATUSES as status (status)}
											<option value={status}>{status}</option>
										{/each}
									</select>
								</form>
								{#if editErrors[item.id]}
									<p role="alert" class="mt-1 text-xs text-danger">{editErrors[item.id]}</p>
								{/if}
							</td>
							<td class="p-3"><Badge tone="neutral">{item.channel}</Badge></td>
							<td class="p-3 text-fg-muted">{item.owner.name}</td>
							<td class="p-3 text-right tabular-nums text-fg-muted"
								>{currencyFormatter.format(item.budget)}</td
							>
							<td class="p-3 text-right tabular-nums text-fg-muted"
								>{currencyFormatter.format(item.spent)}</td
							>
							<td class="p-3 text-right tabular-nums text-fg-muted"
								>{percentFormatter.format(item.ctr)}</td
							>
							<td class="p-3 text-fg-muted">{dateFormatter.format(new Date(item.updatedAt))}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<div
				class="flex items-center justify-between border-t border-border bg-surface-soft px-3 py-2 text-xs text-fg-muted"
			>
				<span>{result.total} campaign{result.total === 1 ? '' : 's'} total</span>
				<div class="flex items-center gap-2">
					<button
						disabled={result.page <= 1}
						onclick={() => updateQuery({ page: result.page - 1 })}
						class="rounded border border-border px-2 py-1 disabled:opacity-40"
					>
						Prev
					</button>
					<span>Page {result.page} of {result.pageCount}</span>
					<button
						disabled={result.page >= result.pageCount}
						onclick={() => updateQuery({ page: result.page + 1 })}
						class="rounded border border-border px-2 py-1 disabled:opacity-40"
					>
						Next
					</button>
				</div>
			</div>
		{/if}
	{:catch}
		<div class="p-8 text-center">
			<p class="text-danger">Something went wrong loading campaigns.</p>
			<button
				onclick={() => goto(page.url.pathname + page.url.search, { invalidateAll: true })}
				class="mt-2 rounded-lg border border-border px-3 py-1.5 text-sm text-fg"
			>
				Try again
			</button>
		</div>
	{/await}
</div>
