export type BeaconPayload =
	| { type: 'vital'; name: string; value: number; id: string; rating?: string }
	| { type: 'error'; message: string; stack?: string; url: string };

const SAMPLE_RATE = 0.2; // 20% of sessions send RUM/error data

let sampledIn: boolean | null = null;

export function isSampledIn(): boolean {
	if (sampledIn === null) {
		sampledIn = Math.random() < SAMPLE_RATE;
	}
	return sampledIn;
}

export function sendBeacon(payload: BeaconPayload) {
	if (!isSampledIn()) return;
	const body = JSON.stringify(payload);
	if (navigator.sendBeacon) {
		navigator.sendBeacon('/api/beacon', body);
	} else {
		fetch('/api/beacon', { method: 'POST', body, keepalive: true }).catch(() => {});
	}
}
