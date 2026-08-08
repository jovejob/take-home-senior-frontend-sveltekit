import { getAllSlugs } from '$lib/server/data/posts';
import { SUPPORTED_LOCALES } from '$lib/schemas/locale';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const origin = url.origin;
	const slugs = getAllSlugs();
	const staticPaths = ['', '/blog', '/search'];

	const urls: string[] = [];
	for (const locale of SUPPORTED_LOCALES) {
		for (const path of staticPaths) {
			urls.push(`${origin}/${locale}${path}`);
		}
		for (const slug of slugs) {
			urls.push(`${origin}/${locale}/blog/${slug}`);
		}
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `\t<url>\n\t\t<loc>${loc}</loc>\n\t</url>`).join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
};
