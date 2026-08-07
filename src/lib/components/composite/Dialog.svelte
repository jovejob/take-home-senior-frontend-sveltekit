<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		titleId: string;
		title: string;
		children: Snippet;
	}

	let { open, onClose, titleId, title, children }: Props = $props();

	let dialogEl: HTMLDivElement | undefined = $state();
	let previouslyFocused: HTMLElement | null = null;

	function getFocusable(): HTMLElement[] {
		if (!dialogEl) return [];
		return Array.from(
			dialogEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}
		if (event.key !== 'Tab') return;

		const focusable = getFocusable();
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (!first || !last) return;

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (open) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			queueMicrotask(() => {
				const focusable = getFocusable();
				(focusable[0] ?? dialogEl)?.focus();
			});
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			previouslyFocused?.focus();
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/50"
			aria-label="Close dialog"
			onclick={onClose}
		></button>
		<div
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			tabindex="-1"
			onkeydown={handleKeydown}
			class="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg"
		>
			<h2 id={titleId} class="text-lg font-semibold text-fg">{title}</h2>
			<div class="mt-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
