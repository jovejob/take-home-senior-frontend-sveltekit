<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';

	const TONE_CLASSES = {
		success: 'border-success/40 bg-success/10 text-success',
		error: 'border-danger/40 bg-danger/10 text-danger',
		info: 'border-accent/40 bg-accent-soft text-accent-ink'
	} as const;
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
	{#each toastStore.messages as message (message.id)}
		<div
			role="status"
			class="rounded-lg border px-4 py-2 text-sm shadow-md {TONE_CLASSES[message.tone]}"
		>
			{message.text}
		</div>
	{/each}
</div>
