<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		id: string;
		value?: string;
	}

	let { label, error, id, class: className = '', value = $bindable(''), ...rest }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	{#if label}
		<label for={id} class="text-sm text-fg-muted">{label}</label>
	{/if}
	<input
		{id}
		{...rest}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
		class="rounded-lg border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent {error
			? 'border-danger'
			: 'border-border'} {className}"
	/>
	{#if error}
		<p id="{id}-error" role="alert" class="text-xs text-danger">{error}</p>
	{/if}
</div>
