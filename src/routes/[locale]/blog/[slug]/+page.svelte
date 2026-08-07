<script lang="ts">
	import { marked } from 'marked';
	import { page } from '$app/state';
	import { t } from '$lib/i18n/t';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const translation = $derived(data.post.translations[data.locale]);
	// Body content is our own trusted mock data (mocks/posts.json), not
	// user-submitted input — rendering it unescaped is safe here. A CMS
	// accepting untrusted content would sanitize (e.g. DOMPurify) first.
	const bodyHtml = $derived(marked.parse(translation.body) as string);

	const dateFormatter = $derived(
		new Intl.DateTimeFormat(data.locale === 'de' ? 'de-DE' : 'en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	const otherLocale = $derived(data.locale === 'en' ? 'de' : 'en');
	const canonicalUrl = $derived(`${page.url.origin}/${data.locale}/blog/${data.post.slug}`);
	const alternateUrl = $derived(`${page.url.origin}/${otherLocale}/blog/${data.post.slug}`);
	const ogImageUrl = $derived(`${canonicalUrl}/og`);

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: translation.title,
		description: translation.excerpt,
		datePublished: data.post.publishedAt,
		author: { '@type': 'Person', name: data.post.author.name },
		breadcrumb: {
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: t(data.messages, 'nav.home'),
					item: `${page.url.origin}/${data.locale}`
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: t(data.messages, 'nav.blog'),
					item: `${page.url.origin}/${data.locale}/blog`
				},
				{ '@type': 'ListItem', position: 3, name: translation.title, item: canonicalUrl }
			]
		}
	});
	// Guards against a literal '<' in content prematurely closing the
	// injected script tag. Uses String.fromCharCode to avoid writing a raw
	// '<' character in this file's source, which the Svelte parser
	// misreads as the start of markup even inside a script block.
	const LESS_THAN = String.fromCharCode(60);
	const jsonLdString = $derived(JSON.stringify(jsonLd).split(LESS_THAN).join('\\u003c'));
</script>

<svelte:head>
	<title>{translation.title}</title>
	<meta name="description" content={translation.excerpt} />
	<link rel="canonical" href={canonicalUrl} />
	<link rel="alternate" hreflang={data.locale} href={canonicalUrl} />
	<link rel="alternate" hreflang={otherLocale} href={alternateUrl} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={translation.title} />
	<meta property="og:description" content={translation.excerpt} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={translation.title} />
	<meta name="twitter:description" content={translation.excerpt} />
	<meta name="twitter:image" content={ogImageUrl} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLdString}</scri` + `pt>`}
</svelte:head>

<article class="mx-auto max-w-2xl px-6 py-16">
	<a href="/{data.locale}/blog" class="text-sm text-accent">← {t(data.messages, 'blog.title')}</a>
	<h1 class="mt-4 text-3xl font-bold text-fg">{translation.title}</h1>
	<p class="mt-2 text-sm text-fg-muted">
		{data.post.author.name} · {dateFormatter.format(new Date(data.post.publishedAt))} ·
		{t(data.messages, 'blog.readingTime', { minutes: data.post.readingTimeMinutes })}
	</p>
	<div class="markdown-body mt-8 text-fg-muted">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html bodyHtml}
	</div>
</article>

<style>
	.markdown-body :global(p) {
		margin-top: 1rem;
		line-height: 1.7;
	}
	.markdown-body :global(p:first-child) {
		margin-top: 0;
	}
	.markdown-body :global(h2) {
		margin-top: 2rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: rgb(var(--color-fg));
	}
	.markdown-body :global(a) {
		color: rgb(var(--color-accent));
		text-decoration: underline;
	}
</style>
