<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="min-h-screen bg-bg">
	<header class="flex items-center justify-between border-b border-border px-6 py-4">
		<span class="text-sm text-fg-muted">
			Signed in as <strong class="text-fg">{data.user?.name}</strong> ({data.user?.role})
		</span>
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="rounded-lg border border-border px-3 py-1.5 text-sm text-fg transition hover:border-border-strong"
			>
				Sign out
			</button>
		</form>
	</header>
	<main class="p-6">
		{@render children()}
	</main>
</div>
