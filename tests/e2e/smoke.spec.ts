import { expect, test } from '@playwright/test';

// Placeholder — will be replaced by the two required E2E flows:
// 1. anonymous: search -> click -> post
// 2. authenticated: login -> dashboard -> edit row (optimistic) -> assert rollback path
test('scaffold renders and is interactive', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Scaffold is live' })).toBeVisible();
	await page.getByRole('button', { name: /clicked/i }).click();
	await expect(page.getByRole('button', { name: 'Clicked 1 times' })).toBeVisible();
});
