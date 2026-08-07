<script lang="ts">
	import { enhance } from '$app/forms';
	import { LoginSchema } from '$lib/schemas/auth';
	import { t } from '$lib/i18n/t';
	import Input from '$lib/components/primitives/Input.svelte';
	import Button from '$lib/components/primitives/Button.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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
	<title>{t(data.messages, 'login.title')}</title>
</svelte:head>

<main class="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-6 py-8">
	<h1 class="text-xl font-semibold text-fg">{t(data.messages, 'login.title')}</h1>

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
		<Input
			id="email"
			name="email"
			type="email"
			autocomplete="email"
			label={t(data.messages, 'login.email')}
			bind:value={email}
		/>

		<Input
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			label={t(data.messages, 'login.password')}
			bind:value={password}
		/>

		{#if clientError || form?.error}
			<p role="alert" class="text-sm text-danger">{clientError ?? form?.error}</p>
		{/if}

		<Button type="submit" disabled={submitting} loading={submitting}>
			{submitting ? '' : t(data.messages, 'login.submit')}
		</Button>
	</form>

	<p class="text-xs text-fg-muted">
		Demo: admin@demo.test / editor@demo.test / viewer@demo.test — password <code>demo1234</code>
	</p>
</main>
