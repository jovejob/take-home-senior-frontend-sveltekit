import { SUPPORTED_LOCALES } from '$lib/schemas/locale';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const disallowLines = SUPPORTED_LOCALES.flatMap((locale) => [
		`Disallow: /${locale}/dashboard`,
		`Disallow: /${locale}/login`
	]).join('\n');

	const body = `User-agent: *
Allow: /
${disallowLines}

Sitemap: ${url.origin}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};
