<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { serializeItemsQuery } from '$lib/utils/url-state';
	import { ITEM_STATUSES, ITEM_CHANNELS, ITEM_SORT_FIELDS } from '$lib/schemas/item';
	import type { ItemSortField, ItemStatus } from '$lib/schemas/item';
	import type { Item } from '$lib/server/schemas/item';
	import type { ItemsQuery } from '$lib/server/data/query-items';
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
			// any filter/sort change resets pagination, except an explicit page change
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
	<title>Campaigns — Dashboard</title>
</svelte:head>

<h1 class="text-xl font-semibold text-fg">Campaigns</h1>

<div class="mt-4 flex flex-wrap items-center gap-3">
	<input
		type="text"
		placeholder="Filter by name…"
		value={searchInput}
		oninput={(e) => onSearchInput(e.currentTarget.value)}
		class="min-w-[220px] rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
	/>

	<select
		value={data.query.status}
		onchange={(e) => updateQuery({ status: e.currentTarget.value as ItemsQuery['status'] })}
		class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-fg"
	>
		<option value="all">All statuses</option>
		{#each ITEM_STATUSES as status (status)}
			<option value={status}>{status}</option>
		{/each}
	</select>

	<select
		value={data.query.channel}
		onchange={(e) => updateQuery({ channel: e.currentTarget.value as ItemsQuery['channel'] })}
		class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-fg"
	>
		<option value="all">All channels</option>
		{#each ITEM_CHANNELS as channel (channel)}
			<option value={channel}>{channel}</option>
		{/each}
	</select>
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
			<div class="p-8 text-center text-fg-muted">No campaigns match your filters.</div>
		{:else}
			<table class="w-full text-sm">
				<thead class="bg-surface-soft text-xs uppercase tracking-wide text-fg-muted">
					<tr>
						{#each ITEM_SORT_FIELDS as field (field)}
							<th
								class="cursor-pointer select-none p-3 text-left"
								onclick={() => toggleSort(field)}
							>
								{field}
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
											}
										};
									}}
								>
									<input type="hidden" name="id" value={item.id} />
									<select
										name="status"
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
									<p class="mt-1 text-xs text-danger">{editErrors[item.id]}</p>
								{/if}
							</td>
							<td class="p-3 capitalize text-fg-muted">{item.channel}</td>
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
