import { sendBeacon } from './beacon';

export function initErrorReporting() {
	window.addEventListener('error', (event) => {
		sendBeacon({
			type: 'error',
			message: event.message,
			stack: event.error?.stack,
			url: window.location.href
		});
	});

	window.addEventListener('unhandledrejection', (event) => {
		const reason = event.reason;
		sendBeacon({
			type: 'error',
			message: reason instanceof Error ? reason.message : String(reason),
			stack: reason instanceof Error ? reason.stack : undefined,
			url: window.location.href
		});
	});
}
