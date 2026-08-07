<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const VARIANT_CLASSES: Record<Variant, string> = {
		primary: 'bg-accent text-white hover:opacity-90',
		secondary: 'border border-border bg-surface text-fg hover:border-border-strong',
		ghost: 'text-fg hover:bg-surface-soft',
		danger: 'bg-danger text-white hover:opacity-90'
	};

	const SIZE_CLASSES: Record<Size, string> = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};
</script>

<button
	{...rest}
	disabled={disabled || loading}
	class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 {VARIANT_CLASSES[
		variant
	]} {SIZE_CLASSES[size]} {className}"
>
	{#if loading}
		<span
			class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
</button>
