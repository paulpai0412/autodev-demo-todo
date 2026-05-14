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
    await expect(page.getByText('0% complete')).toBeVisible();
    await expect(page.getByText('0 total todos')).toBeVisible();
    await expect(page.getByText('0 active todos')).toBeVisible();
    await expect(page.getByText('0 completed todos')).toBeVisible();

    const input = page.getByLabel('Todo title');

    await input.fill('Add Playwright verification');
    await page.getByRole('button', { name: 'Add todo' }).click();

    await expect(page.getByText('Add Playwright verification')).toBeVisible();
    await expect(page.getByText('1 item · 0 complete')).toBeVisible();
    await expect(page.getByText('0% complete')).toBeVisible();
    await expect(page.getByText('1 total todo')).toBeVisible();
    await expect(page.getByText('1 active todo')).toBeVisible();
    await expect(page.getByText('0 completed todos')).toBeVisible();

    const todoToggle = page.getByRole('checkbox', { name: 'Add Playwright verification' });
    await todoToggle.check();

    await expect(todoToggle).toBeChecked();
    await expect(page.getByText('1 item · 1 complete')).toBeVisible();
    await expect(page.getByText('100% complete')).toBeVisible();
    await expect(page.getByText('0 active todos')).toBeVisible();
    await expect(page.getByText('1 completed todo')).toBeVisible();

    await page.reload();

    await expect(page.getByText('Add Playwright verification')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Add Playwright verification' })).toBeChecked();
    await expect(page.getByText('1 item · 1 complete')).toBeVisible();
    await expect(page.getByText('100% complete')).toBeVisible();
  });

  test('full flow: add, complete, filter, remove, clear-completed, reload persists', async ({ page }) => {
    const input = page.getByLabel('Todo title');
    const addBtn = page.getByRole('button', { name: 'Add todo' });

    // Add three todos
    await input.fill('Buy groceries');
    await addBtn.click();
    await input.fill('Write tests');
    await addBtn.click();
    await input.fill('Deploy app');
    await addBtn.click();

    await expect(page.getByText('3 items · 0 complete')).toBeVisible();
    await expect(page.getByText('0% complete')).toBeVisible();
    await expect(page.getByText('3 total todos')).toBeVisible();
    await expect(page.getByText('3 active todos')).toBeVisible();
    await expect(page.getByText('0 completed todos')).toBeVisible();

    // Complete one todo
    await page.getByRole('checkbox', { name: 'Write tests' }).check();
    await expect(page.getByText('3 items · 1 complete')).toBeVisible();
    await expect(page.getByText('33% complete')).toBeVisible();
    await expect(page.getByText('2 active todos')).toBeVisible();
    await expect(page.getByText('1 completed todo')).toBeVisible();

    // Filter: Active — should show 2 active todos, hide the completed one
    await page.getByRole('radio', { name: 'Active' }).check();
    await expect(page.getByText('2 items active')).toBeVisible();
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('Deploy app')).toBeVisible();
    await expect(page.getByText('Write tests')).not.toBeVisible();

    // Filter: Completed — should show only the completed todo
    await page.getByRole('radio', { name: 'Completed' }).check();
    await expect(page.getByText('1 item completed')).toBeVisible();
    await expect(page.getByText('Write tests')).toBeVisible();
    await expect(page.getByText('Buy groceries')).not.toBeVisible();

    // Filter: All — restore full view
    await page.getByRole('radio', { name: 'All' }).check();
    await expect(page.getByText('3 items · 1 complete')).toBeVisible();

    // Remove one active todo
    await page.getByRole('button', { name: 'Remove todo: Deploy app' }).click();
    await expect(page.getByText('Deploy app')).not.toBeVisible();
    await expect(page.getByText('2 items · 1 complete')).toBeVisible();
    await expect(page.getByText('50% complete')).toBeVisible();
    await expect(page.getByText('2 total todos')).toBeVisible();
    await expect(page.getByText('1 active todo')).toBeVisible();

    // Clear completed — removes "Write tests", leaves "Buy groceries"
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(page.getByText('Write tests')).not.toBeVisible();
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByText('1 item · 0 complete')).toBeVisible();
    await expect(page.getByText('0% complete')).toBeVisible();
    await expect(page.getByText('1 total todo')).toBeVisible();
    await expect(page.getByText('1 active todo')).toBeVisible();
    await expect(page.getByText('0 completed todos')).toBeVisible();

    // Reload confirms persisted state: only "Buy groceries" remains, active
    await page.reload();
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Buy groceries' })).not.toBeChecked();
    await expect(page.getByText('1 item · 0 complete')).toBeVisible();
    await expect(page.getByText('0% complete')).toBeVisible();
    await expect(page.getByText('Write tests')).not.toBeVisible();
    await expect(page.getByText('Deploy app')).not.toBeVisible();
  });

  test('bulk toggle updates only the visible todos in each filter mode', async ({ page }) => {
    const input = page.getByLabel('Todo title');
    const addButton = page.getByRole('button', { name: 'Add todo' });

    await expect(page.getByRole('button', { name: 'Mark visible todos complete' })).toBeDisabled();

    await input.fill('Alpha');
    await addButton.click();
    await input.fill('Beta');
    await addButton.click();
    await input.fill('Gamma');
    await addButton.click();

    await page.getByRole('button', { name: 'Mark visible todos complete' }).click();

    await expect(page.getByRole('checkbox', { name: 'Alpha' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Beta' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Gamma' })).toBeChecked();
    await expect(page.getByText('3 items · 3 complete')).toBeVisible();

    await page.getByRole('radio', { name: 'Completed' }).check();
    await page.getByRole('button', { name: 'Mark visible todos active' }).click();

    await expect(page.getByText('No completed todos found.')).toBeVisible();
    await expect(page.getByText('3 active todos')).toBeVisible();

    await page.getByRole('radio', { name: 'All' }).check();
    await page.getByRole('checkbox', { name: 'Alpha' }).check();
    await page.getByRole('radio', { name: 'Active' }).check();
    await page.getByRole('button', { name: 'Mark visible todos complete' }).click();

    await expect(page.getByText('No active todos found.')).toBeVisible();
    await expect(page.getByText('3 completed todos')).toBeVisible();

    await page.reload();

    await expect(page.getByRole('checkbox', { name: 'Alpha' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Beta' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Gamma' })).toBeChecked();
  });
});
