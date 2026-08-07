<script lang="ts">
	import { t } from '$lib/i18n/t';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dateFormatter = $derived(
		new Intl.DateTimeFormat(data.locale === 'de' ? 'de-DE' : 'en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	);

	function pageHref(page: number): string {
		const params = new URLSearchParams();
		if (page > 1) params.set('page', String(page));
		if (data.tag !== 'all') params.set('tag', data.tag);
		const qs = params.toString();
		return qs ? `?${qs}` : '?';
	}

	function tagHref(tag: string): string {
		return tag === 'all' ? '?' : `?tag=${tag}`;
	}
</script>

<svelte:head>
	<title>{t(data.messages, 'blog.title')}</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16">
	<h1 class="text-2xl font-semibold text-fg">{t(data.messages, 'blog.title')}</h1>

	<nav class="mt-4 flex flex-wrap gap-2" aria-label="Filter by tag">
		<a
			href={tagHref('all')}
			class="rounded-full border px-3 py-1 text-xs {data.tag === 'all'
				? 'border-accent text-accent'
				: 'border-border text-fg-muted'}">All</a
		>
		{#each data.tags as tagItem (tagItem.slug)}
			<a
				href={tagHref(tagItem.slug)}
				class="rounded-full border px-3 py-1 text-xs {data.tag === tagItem.slug
					? 'border-accent text-accent'
					: 'border-border text-fg-muted'}">{tagItem.label[data.locale]}</a
			>
		{/each}
	</nav>

	{#if data.postsResult.rows.length === 0}
		<p class="mt-8 text-fg-muted">{t(data.messages, 'blog.empty')}</p>
	{:else}
		<ul class="mt-8 flex flex-col gap-6">
			{#each data.postsResult.rows as post (post.id)}
				<li class="rounded-lg border border-border p-4">
					<a
						href="/{data.locale}/blog/{post.slug}"
						class="text-lg font-medium text-fg hover:text-accent"
						>{post.translations[data.locale].title}</a
					>
					<p class="mt-1 text-sm text-fg-muted">{post.translations[data.locale].excerpt}</p>
					<p class="mt-2 text-xs text-fg-muted">
						{post.author.name} · {dateFormatter.format(new Date(post.publishedAt))} ·
						{t(data.messages, 'blog.readingTime', { minutes: post.readingTimeMinutes })}
					</p>
				</li>
			{/each}
		</ul>

		<nav
			class="mt-8 flex items-center justify-between text-sm text-fg-muted"
			aria-label="Pagination"
		>
			{#if data.postsResult.page > 1}
				<a href={pageHref(data.postsResult.page - 1)} class="rounded border border-border px-3 py-1"
					>Prev</a
				>
			{:else}
				<span></span>
			{/if}
			<span>Page {data.postsResult.page} of {data.postsResult.pageCount}</span>
			{#if data.postsResult.page < data.postsResult.pageCount}
				<a href={pageHref(data.postsResult.page + 1)} class="rounded border border-border px-3 py-1"
					>Next</a
				>
			{:else}
				<span></span>
			{/if}
		</nav>
	{/if}
</main>
