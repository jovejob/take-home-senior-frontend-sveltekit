import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Placeholder target (home page). Will be re-pointed at /dashboard/items once
// the dashboard route exists — the brief requires axe assertions there specifically.
test('home page has no serious or critical axe violations', async ({ page }) => {
	await page.goto('/');
	const results = await new AxeBuilder({ page }).analyze();
	const blocking = results.violations.filter(
		(v) => v.impact === 'serious' || v.impact === 'critical'
	);
	expect(blocking).toEqual([]);
});
