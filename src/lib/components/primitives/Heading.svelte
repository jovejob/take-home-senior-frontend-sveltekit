<script lang="ts">
	import type { Snippet } from 'svelte';

	type Level = 1 | 2 | 3;

	interface Props {
		level?: Level;
		children: Snippet;
	}

	let { level = 1, children }: Props = $props();
</script>

{#if level === 1}
	<h1 class="text-3xl font-bold tracking-tight text-fg">{@render children()}</h1>
{:else if level === 2}
	<h2 class="text-xl font-semibold text-fg">{@render children()}</h2>
{:else}
	<h3 class="text-lg font-semibold text-fg">{@render children()}</h3>
{/if}
