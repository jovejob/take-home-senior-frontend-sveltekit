<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Padding = 'sm' | 'md' | 'lg';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		padding?: Padding;
		children: Snippet;
	}

	let { padding = 'md', class: className = '', children, ...rest }: Props = $props();

	const PADDING_CLASSES: Record<Padding, string> = {
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};
</script>

<div
	{...rest}
	class="rounded-lg border border-border bg-surface {PADDING_CLASSES[padding]} {className}"
>
	{@render children()}
</div>
