import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home page has no serious or critical axe violations', async ({ page }) => {
	await page.goto('/');
	const results = await new AxeBuilder({ page }).analyze();
	const blocking = results.violations.filter(
		(v) => v.impact === 'serious' || v.impact === 'critical'
	);
	expect(blocking).toEqual([]);
});

test('dashboard items table has no serious or critical axe violations', async ({ page }) => {
	await page.goto('/en/login');
	await page.getByLabel(/email/i).fill('admin@demo.test');
	await page.getByLabel(/password/i).fill('demo1234');
	await page.getByRole('button', { name: /sign in/i }).click();
	await expect(page).toHaveURL(/\/en\/dashboard$/);

	await page.goto('/en/dashboard/items');
	await page.waitForSelector('table');

	const results = await new AxeBuilder({ page }).analyze();
	const blocking = results.violations.filter(
		(v) => v.impact === 'serious' || v.impact === 'critical'
	);
	expect(blocking).toEqual([]);
});
