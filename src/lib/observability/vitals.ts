import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { sendBeacon } from './beacon';

function report(metric: Metric) {
	sendBeacon({
		type: 'vital',
		name: metric.name,
		value: metric.value,
		id: metric.id,
		rating: metric.rating
	});
}

export function initWebVitals() {
	onCLS(report);
	onFCP(report);
	onINP(report);
	onLCP(report);
	onTTFB(report);
}
