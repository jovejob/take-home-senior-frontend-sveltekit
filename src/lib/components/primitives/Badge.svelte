<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

	interface Props {
		tone?: Tone;
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();

	const TONE_CLASSES: Record<Tone, string> = {
		neutral: 'bg-surface-soft text-fg-muted',
		accent: 'bg-accent-soft text-accent-ink',
		success: 'bg-success/15 text-success',
		warning: 'bg-warning/15 text-warning',
		danger: 'bg-danger/15 text-danger'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {TONE_CLASSES[
		tone
	]}"
>
	{@render children()}
</span>
