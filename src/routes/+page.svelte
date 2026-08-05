<script lang="ts">
	let count = $state(0);
</script>

<svelte:head>
	<title>Take-home — scaffold</title>
	<meta
		name="description"
		content="Senior Frontend Engineer take-home: a SvelteKit public marketing surface and authenticated dashboard."
	/>
	<meta name="robots" content="index, follow" />
</svelte:head>

<main
	class="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-8 text-center"
>
	<h1 class="text-2xl font-semibold text-fg">Scaffold is live</h1>
	<p class="text-fg-muted">
		Runes work, Tailwind tokens work, TypeScript works. Real routes land next.
	</p>
	<button
		class="rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90"
		onclick={() => (count += 1)}
	>
		Clicked {count} times
	</button>
</main>
