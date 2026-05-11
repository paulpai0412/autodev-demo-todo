import { expect, test } from '@playwright/test';

test.describe('Todo demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
    });
    await page.reload();
  });

  test('adds todos, marks one complete, and keeps state after reload', async ({ page }) => {
    const input = page.getByLabel('Todo title');

    await input.fill('Add Playwright verification');
    await page.getByRole('button', { name: 'Add todo' }).click();

    await expect(page.getByText('Add Playwright verification')).toBeVisible();
    await expect(page.getByText('1 item · 0 complete')).toBeVisible();

    const todoToggle = page.getByRole('checkbox', { name: 'Add Playwright verification' });
    await todoToggle.check();

    await expect(todoToggle).toBeChecked();
    await expect(page.getByText('1 item · 1 complete')).toBeVisible();

    await page.reload();

    await expect(page.getByText('Add Playwright verification')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Add Playwright verification' })).toBeChecked();
    await expect(page.getByText('1 item · 1 complete')).toBeVisible();
  });
});
