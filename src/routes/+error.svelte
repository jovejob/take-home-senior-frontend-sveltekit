<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<main
	class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
>
	<h1 class="text-4xl font-bold text-fg">{page.status}</h1>
	<p class="text-fg-muted">{page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">Go home</a>
</main>
