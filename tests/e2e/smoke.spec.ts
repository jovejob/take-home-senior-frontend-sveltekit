import { expect, test } from '@playwright/test';

test('home page redirects to default locale and renders hero content', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/en$/);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
});
