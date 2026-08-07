<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n/t';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<!-- /404 - catches e.g. an unknown blog slug while keeping the site nav and i18n -->
<main
	class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
>
	<h1 class="text-4xl font-bold text-fg">{page.status}</h1>
	<p class="text-fg-muted">{page.error?.message ?? t(data.messages, 'common.error')}</p>
	<a href="/{data.locale}" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
		{t(data.messages, 'nav.home')}
	</a>
</main>
