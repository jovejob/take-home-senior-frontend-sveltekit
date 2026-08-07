<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n/t';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	function localeSwitchHref(target: 'en' | 'de'): string {
		// Deliberately drops the query string — page.url.search can't be read
		// on prerendered routes (no live request to read it from at build
		// time), and this layout wraps prerendered pages too. Switching
		// locale while filtering /search or /blog resets any active filter;
		// an acceptable, explicit tradeoff.
		const rest = page.url.pathname.replace(/^\/(en|de)/, '');
		return `/${target}${rest}`;
	}
</script>

<header class="border-b border-border">
	<nav class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 text-sm">
		<a href="/{data.locale}" class="font-semibold text-fg">{t(data.messages, 'nav.home')}</a>
		<div class="flex items-center gap-4">
			<a href="/{data.locale}/blog" class="text-fg-muted hover:text-fg"
				>{t(data.messages, 'nav.blog')}</a
			>
			<a href="/{data.locale}/search" class="text-fg-muted hover:text-fg"
				>{t(data.messages, 'nav.search')}</a
			>
			<a href="/{data.locale}/login" class="text-fg-muted hover:text-fg"
				>{t(data.messages, 'nav.login')}</a
			>
			<span class="flex items-center gap-1 border-l border-border pl-4">
				<a
					href={localeSwitchHref('en')}
					class="text-xs {data.locale === 'en' ? 'font-semibold text-fg' : 'text-fg-muted'}">EN</a
				>
				<a
					href={localeSwitchHref('de')}
					class="text-xs {data.locale === 'de' ? 'font-semibold text-fg' : 'text-fg-muted'}">DE</a
				>
			</span>
		</div>
	</nav>
</header>

{@render children()}
