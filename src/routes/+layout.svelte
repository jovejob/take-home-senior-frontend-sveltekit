<script lang="ts">
	import '../app.css';
	import ToastViewport from '$lib/components/primitives/ToastViewport.svelte';
	import { initWebVitals } from '$lib/observability/vitals';
	import { initErrorReporting } from '$lib/observability/errors';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => {
		initWebVitals();
		initErrorReporting();
	});
</script>

{@render children()}
<ToastViewport />
