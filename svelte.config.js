import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Default runtime is Node (nodejs20.x on Vercel). Individual routes opt into
		// the edge runtime via `export const config = { runtime: 'edge' }` in their
		// +server.ts / +page.server.ts — see src/routes/[locale]/blog/[slug]/og/+server.ts
		// for the edge-runtime OG image route once it's built.
		adapter: adapter({
			runtime: 'nodejs20.x'
		}),
		alias: {
			$lib: './src/lib'
		},
		prerender: {
			// TEMPORARY while the public surface is still under construction —
			// the home page links to /blog, which doesn't exist yet, so the
			// prerender crawler's link check would otherwise fail the build.
			// Tighten back to the default ('fail') once /blog, /blog/[slug],
			// and /search all exist — tracked before final submission.
			handleHttpError: 'warn',
			// Prerendered pages have no live request to read an origin from,
			// so absolute URLs (canonical, OG, hreflang) need this set
			// explicitly. UPDATE to the real Vercel deployment URL once known.
			origin: 'https://take-home-senior-frontend-sveltekit.vercel.app'
		}
	}
};

export default config;
