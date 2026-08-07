<script lang="ts">
	import { enhance } from '$app/forms';
	import { LoginSchema } from '$lib/schemas/auth';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let email = $state('');
	let password = $state('');
	let clientError = $state<string | null>(null);
	let submitting = $state(false);

	$effect(() => {
		if (form?.email) email = form.email;
	});

	function validateBeforeSubmit(event: SubmitEvent) {
		const result = LoginSchema.safeParse({ email, password });
		if (!result.success) {
			event.preventDefault();
			clientError = result.error.issues[0]?.message ?? 'Please check your details.';
			return;
		}
		clientError = null;
	}
</script>

<svelte:head>
	<title>Sign in</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-8">
	<h1 class="text-xl font-semibold text-fg">Sign in</h1>

	<form
		method="POST"
		onsubmit={validateBeforeSubmit}
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<label class="flex flex-col gap-1 text-sm text-fg-muted">
			Email
			<input
				name="email"
				type="email"
				autocomplete="email"
				bind:value={email}
				class="rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-accent"
			/>
		</label>

		<label class="flex flex-col gap-1 text-sm text-fg-muted">
			Password
			<input
				name="password"
				type="password"
				autocomplete="current-password"
				bind:value={password}
				class="rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none focus:border-accent"
			/>
		</label>

		{#if clientError || form?.error}
			<p role="alert" class="text-sm text-danger">{clientError ?? form?.error}</p>
		{/if}

		<button
			type="submit"
			disabled={submitting}
			class="rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
		>
			{submitting ? 'Signing in…' : 'Sign in'}
		</button>
	</form>

	<p class="text-xs text-fg-muted">
		Demo: admin@demo.test / editor@demo.test / viewer@demo.test — password <code>demo1234</code>
	</p>
</main>
