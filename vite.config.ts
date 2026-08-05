import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vitest/config';

// Hashed build assets under /_app/immutable/ are safe to cache forever — the
// filename changes on every change. `vite preview` sends no cache headers by
// default (unlike a real CDN/Vercel edge would), which dings Lighthouse's
// "efficient cache policy" audit when run locally/in CI against `preview`.
// Everything else (HTML) stays uncached so content updates are always fresh.
function previewCacheHeaders(): Plugin {
	return {
		name: 'preview-cache-headers',
		configurePreviewServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith('/_app/immutable/')) {
					res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
				} else {
					res.setHeader('Cache-Control', 'no-cache');
				}
				next();
			});
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), previewCacheHeaders()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/unit/setup.ts'],
		include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/lib/**']
		}
	}
});
