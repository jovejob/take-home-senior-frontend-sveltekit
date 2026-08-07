<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		label?: string;
		id: string;
		children: Snippet;
	}

	let { label, id, class: className = '', children, ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	{#if label}
		<label for={id} class="text-sm text-fg-muted">{label}</label>
	{/if}
	<select
		{id}
		{...rest}
		class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent {className}"
	>
		{@render children()}
	</select>
</div>
