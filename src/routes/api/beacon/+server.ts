import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();
		// Stands in for a real telemetry sink (Sentry, Datadog, etc.) — the
		// wiring (client -> beacon -> here) is real; a production build would
		// forward this to an actual provider instead of logging it.
		console.log('[beacon]', payload);
	} catch {
		// Malformed beacon payloads are non-critical — never fail the request.
	}
	return json({ ok: true });
};
