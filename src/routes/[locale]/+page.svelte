<script lang="ts">
	import { t } from '$lib/i18n/t';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{t(data.messages, 'home.hero.title')}</title>
	<meta name="description" content={t(data.messages, 'home.hero.subtitle')} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-24 text-center">
	<h1 class="text-4xl font-bold tracking-tight text-fg">{t(data.messages, 'home.hero.title')}</h1>
	<p class="mt-4 text-lg text-fg-muted">{t(data.messages, 'home.hero.subtitle')}</p>

	<a
		href="/{data.locale}/blog"
		class="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
	>
		{t(data.messages, 'home.hero.cta')}
	</a>

	<section class="mt-24 text-left">
		<h2 class="text-xl font-semibold text-fg">{t(data.messages, 'home.features.title')}</h2>
		<ul class="mt-4 grid gap-4 sm:grid-cols-3">
			<li class="rounded-lg border border-border bg-surface p-4">
				<p class="font-medium text-fg">Fast by default</p>
				<p class="mt-1 text-sm text-fg-muted">
					Deliberate rendering choices per route, budgets enforced in CI.
				</p>
			</li>
			<li class="rounded-lg border border-border bg-surface p-4">
				<p class="font-medium text-fg">Type-safe data</p>
				<p class="mt-1 text-sm text-fg-muted">
					Zod schemas as the single source of truth, validated at the boundary.
				</p>
			</li>
			<li class="rounded-lg border border-border bg-surface p-4">
				<p class="font-medium text-fg">Accessible</p>
				<p class="mt-1 text-sm text-fg-muted">Keyboard-operable end to end, axe-checked in CI.</p>
			</li>
		</ul>
	</section>
</main>
