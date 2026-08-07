import { expect, test } from '@playwright/test';

test('authenticated flow: dashboard status edit rolls back on failure', async ({ page }) => {
	await page.goto('/en/login');
	await page.getByLabel(/email/i).fill('admin@demo.test');
	await page.getByLabel(/password/i).fill('demo1234');
	await page.getByRole('button', { name: /sign in/i }).click();
	await expect(page).toHaveURL(/\/en\/dashboard$/);

	await page.goto('/en/dashboard/items');

	const firstRow = page.locator('tbody tr').first();
	const select = firstRow.locator('select[name="status"]');
	const originalValue = await select.inputValue();
	const newValue = originalValue === 'active' ? 'paused' : 'active';

	// Force the update to fail deterministically — a real network abort,
	// rather than relying on the ~20% random failure baked into the mock
	// action (which SvelteKit's use:enhance surfaces as result.type ===
	// 'error', handled by the same rollback branch as a server-side fail()).
	await page.route(/\/dashboard\/items\?\/updateStatus/, (route) => route.abort());

	await select.selectOption(newValue);

	// Optimistic update applies immediately, before the request resolves.
	await expect(select).toHaveValue(newValue);

	// Rollback happens once the aborted request resolves.
	await expect(select).toHaveValue(originalValue, { timeout: 5000 });
	await expect(firstRow.getByRole('alert')).toBeVisible();
});
