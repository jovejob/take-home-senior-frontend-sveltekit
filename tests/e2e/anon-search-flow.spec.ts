import { expect, test } from '@playwright/test';

test('anonymous flow: search finds a post and navigates to it', async ({ page }) => {
	await page.goto('/en/search');

	const searchInput = page.getByPlaceholder(/search posts/i);
	await searchInput.fill('streaming');
	await searchInput.press('Enter');

	await expect(page).toHaveURL(/\/en\/search\?.*q=streaming/);

	const resultLink = page.getByRole('link', { name: /streaming ssr/i });
	await expect(resultLink).toBeVisible();
	await resultLink.click();

	await expect(page).toHaveURL(/\/en\/blog\/streaming-ssr-in-plain-english/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(/streaming ssr/i);
});
