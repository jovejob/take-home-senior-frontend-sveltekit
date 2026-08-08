import { ImageResponse } from '@vercel/og';
import { error } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';
import { getPostBySlug } from '$lib/server/data/posts';
import { SUPPORTED_LOCALES, type Locale } from '$lib/schemas/locale';
import type { RequestHandler } from './$types';

// Deliberately NOT prerendered — this is the app's edge-runtime
// demonstration route. Prerendering would turn it into a static asset with
// no edge function ever actually executing, which would undermine the
// point of having it. Aggressively cached instead (see headers below),
// which is the correct real-world pattern for OG images anyway: dynamic at
// the edge, but effectively static content once generated.
export const config: Config = { runtime: 'edge' };

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

// @vercel/og's implicit default font relies on a bundled asset that this
// adapter (adapter-vercel for SvelteKit, not Next.js's own adapter) fails
// to resolve at deploy time. Fetching a font explicitly at request time
// sidesteps that broken asset-bundling path entirely — the documented
// workaround for this exact cross-framework incompatibility.
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

	// No JSX here — this project has no React/JSX tooling configured, so we
	// build the same plain-object element tree satori/@vercel/og accept
	// (JSX is just sugar for this shape at build time).
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
