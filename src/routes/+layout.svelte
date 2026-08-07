<script lang="ts">
	import '../app.css';
	import ToastViewport from '$lib/components/primitives/ToastViewport.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

{@render children()}
<ToastViewport />
