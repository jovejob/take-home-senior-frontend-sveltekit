import type { HandleClientError } from '@sveltejs/kit';
import { sendBeacon } from '$lib/observability/beacon';

interface HttpErrorLike {
	body: { message: string };
}

function isHttpErrorLike(value: unknown): value is HttpErrorLike {
	return (
		typeof value === 'object' &&
		value !== null &&
		'body' in value &&
		typeof (value as { body: unknown }).body === 'object' &&
		(value as { body: unknown }).body !== null &&
		'message' in (value as { body: object }).body
	);
}

function extractMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (isHttpErrorLike(error)) return error.body.message;
	return String(error);
}

export const handleError: HandleClientError = ({ error, event }) => {
	sendBeacon({
		type: 'error',
		message: extractMessage(error),
		stack: error instanceof Error ? error.stack : undefined,
		url: event.url.href
	});

	return {
		message: 'An unexpected error occurred.'
	};
};
