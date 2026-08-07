<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type MaxWidth = 'sm' | 'md' | 'lg';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		maxWidth?: MaxWidth;
		children: Snippet;
	}

	let { maxWidth = 'md', class: className = '', children, ...rest }: Props = $props();

	const WIDTH_CLASSES: Record<MaxWidth, string> = {
		sm: 'max-w-sm',
		md: 'max-w-3xl',
		lg: 'max-w-5xl'
	};
</script>

<div {...rest} class="mx-auto w-full px-6 {WIDTH_CLASSES[maxWidth]} {className}">
	{@render children()}
</div>
