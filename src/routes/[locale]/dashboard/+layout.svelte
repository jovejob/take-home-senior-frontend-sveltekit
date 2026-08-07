<script lang="ts">
	import Dialog from '$lib/components/composite/Dialog.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let confirmOpen = $state(false);
	let logoutForm: HTMLFormElement | undefined = $state();
</script>

<div class="min-h-screen bg-bg">
	<header class="flex items-center justify-between border-b border-border px-6 py-4">
		<span class="text-sm text-fg-muted">
			Signed in as <strong class="text-fg">{data.user?.name}</strong> ({data.user?.role})
		</span>
		<Button variant="secondary" size="sm" onclick={() => (confirmOpen = true)}>Sign out</Button>
	</header>
	<main class="p-6">
		{@render children()}
	</main>
</div>

<form bind:this={logoutForm} method="POST" action="/{data.locale}/logout" class="hidden"></form>

<Dialog
	open={confirmOpen}
	onClose={() => (confirmOpen = false)}
	titleId="signout-confirm-title"
	title="Sign out?"
>
	<p class="text-sm text-fg-muted">You'll need to sign in again to access the dashboard.</p>
	<div class="mt-6 flex justify-end gap-2">
		<Button variant="ghost" onclick={() => (confirmOpen = false)}>Cancel</Button>
		<Button variant="danger" onclick={() => logoutForm?.requestSubmit()}>Sign out</Button>
	</div>
</Dialog>
