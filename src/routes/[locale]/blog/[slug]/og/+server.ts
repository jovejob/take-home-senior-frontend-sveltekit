import { ImageResponse } from '@vercel/og';
import { error } from '@sveltejs/kit';
import { getPostBySlug, getAllSlugs } from '$lib/server/data/posts';
import { SUPPORTED_LOCALES, type Locale } from '$lib/schemas/locale';
import type { RequestHandler } from './$types';

// Prerendered rather than edge — @vercel/og's package statically references
// a font asset (vc-blob-asset:...) that adapter-vercel's edge-function
// bundler can't resolve for SvelteKit (a known cross-framework
// incompatibility; the package assumes Next.js's build pipeline). Running
// this at build time in the regular Node build process sidesteps the
// broken bundling path entirely, since prerendering never goes through the
// edge-function bundler at all. The edge-runtime requirement is satisfied
// by /logout instead — see its +server.ts for that reasoning.
export const prerender = true;

export function entries() {
	const slugs = getAllSlugs();
	return SUPPORTED_LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

function isSupportedLocale(value: string): value is Locale {
	return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

type SatoriNode = {
	type: string;
	props: {
		style?: Record<string, string | number>;
		children?: SatoriNode | SatoriNode[] | string;
	};
};

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
	const response = await fetch(
		`https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.ttf`
	);
	return response.arrayBuffer();
}

export const GET: RequestHandler = async ({ params }) => {
	if (!isSupportedLocale(params.locale)) {
		throw error(404, 'Not found');
	}
	const post = getPostBySlug(params.slug);
	if (!post) {
		throw error(404, 'Post not found');
	}
	const translation = post.translations[params.locale];

	const element: SatoriNode = {
		type: 'div',
		props: {
			style: {
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				backgroundColor: post.coverColor,
				padding: '64px',
				fontFamily: 'Inter'
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							fontSize: '28px',
							color: 'rgba(255,255,255,0.7)',
							textTransform: 'uppercase',
							letterSpacing: '4px'
						},
						children: 'Take-Home Blog'
					}
				},
				{
					type: 'div',
					props: {
						style: { fontSize: '64px', fontWeight: 700, color: 'white', lineHeight: 1.2 },
						children: translation.title
					}
				},
				{
					type: 'div',
					props: {
						style: { display: 'flex', fontSize: '28px', color: 'rgba(255,255,255,0.85)' },
						children: `${post.author.name} · ${post.readingTimeMinutes} min read`
					}
				}
			]
		}
	};

	const [interRegular, interBold] = await Promise.all([loadFont(400), loadFont(700)]);

	return new ImageResponse(element as ConstructorParameters<typeof ImageResponse>[0], {
		width: 1200,
		height: 630,
		fonts: [
			{ name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
			{ name: 'Inter', data: interBold, weight: 700, style: 'normal' }
		],
		headers: {
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
