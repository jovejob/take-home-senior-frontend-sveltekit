<script lang="ts">
	import { navigating } from '$app/state';
	import { t } from '$lib/i18n/t';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let formEl: HTMLFormElement | undefined = $state();
	let pageValue = $state('1');
	let debounceHandle: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		pageValue = String(data.postsResult.page);
	});

	function submitNow() {
		formEl?.requestSubmit();
	}

	function onQueryInput() {
		pageValue = '1';
		clearTimeout(debounceHandle);
		debounceHandle = setTimeout(submitNow, 300);
	}

	function onFilterChange() {
		pageValue = '1';
		submitNow();
	}

	function goToPage(page: number) {
		pageValue = String(page);
		submitNow();
	}
</script>

<svelte:head>
	<title>{t(data.messages, 'nav.search')}</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<h1 class="text-2xl font-semibold text-fg">{t(data.messages, 'nav.search')}</h1>

	<form method="GET" bind:this={formEl} class="mt-6 flex flex-wrap items-center gap-3">
		<input type="hidden" name="page" value={pageValue} />
		<input
			type="search"
			name="q"
			placeholder={t(data.messages, 'search.placeholder')}
			value={data.q}
			oninput={onQueryInput}
			class="min-w-[240px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent"
		/>
		<select
			name="tag"
			value={data.tag}
			onchange={onFilterChange}
			class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
		>
			<option value="all">All tags</option>
			{#each data.tags as tagItem (tagItem.slug)}
				<option value={tagItem.slug}>{tagItem.label[data.locale]}</option>
			{/each}
		</select>
		<select
			name="sort"
			value={data.sort}
			onchange={onFilterChange}
			class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
		>
			<option value="newest">Newest first</option>
			<option value="oldest">Oldest first</option>
		</select>
		<button type="submit" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
			{t(data.messages, 'nav.search')}
		</button>
	</form>

	{#if data.q && data.postsResult.total > 0}
		<p class="mt-4 text-sm text-fg-muted">
			{t(data.messages, 'search.results', { count: data.postsResult.total, query: data.q })}
		</p>
	{/if}

	{#if navigating.to}
		<p class="mt-8 text-sm text-fg-muted">{t(data.messages, 'common.loading')}</p>
	{:else if data.postsResult.rows.length === 0}
		<p class="mt-8 text-fg-muted">{t(data.messages, 'search.noResults')}</p>
	{:else}
		<ul class="mt-6 flex flex-col gap-6">
			{#each data.postsResult.rows as post (post.id)}
				<li class="rounded-lg border border-border p-4">
					<a
						href="/{data.locale}/blog/{post.slug}"
						class="text-lg font-medium text-fg hover:text-accent"
						>{post.translations[data.locale].title}</a
					>
					<p class="mt-1 text-sm text-fg-muted">{post.translations[data.locale].excerpt}</p>
				</li>
			{/each}
		</ul>

		<div class="mt-8 flex items-center justify-between text-sm text-fg-muted">
			<button
				type="button"
				disabled={data.postsResult.page <= 1}
				onclick={() => goToPage(data.postsResult.page - 1)}
				class="rounded border border-border px-3 py-1 disabled:opacity-40"
			>
				Prev
			</button>
			<span>Page {data.postsResult.page} of {data.postsResult.pageCount}</span>
			<button
				type="button"
				disabled={data.postsResult.page >= data.postsResult.pageCount}
				onclick={() => goToPage(data.postsResult.page + 1)}
				class="rounded border border-border px-3 py-1 disabled:opacity-40"
			>
				Next
			</button>
		</div>
	{/if}
</main>
