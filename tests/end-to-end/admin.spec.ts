import { test, expect } from '@playwright/test';
import { runPlayground } from '../playground';
import { login } from '@wp-playground/blueprints';
import { RunCLIServer } from '@wp-playground/cli';
import { PHPRequestHandler, PHP } from '@php-wasm/universal';


test.describe('Admin page', () => {
  let playground: RunCLIServer;
  let handler: PHPRequestHandler;
  let php: PHP;
  let url: URL;

  test.beforeAll(async () => {
    playground = await runPlayground();
    handler = playground.requestHandler;
    php = await handler.getPrimaryPhp();
    url = new URL(
      '/wp-admin/admin.php?page=workshop-tests',
      handler.absoluteUrl
    );
    await login(php, {
      username: 'admin',
    });
  });
  test.afterAll(async () => {
    await playground.server.close();
  });

  test('Check if admin page loads', async ({ page }) => {
    await page.goto(url.toString());
    await expect(page).toHaveTitle(/Workshop Tests/);
  });

  test('Check if message is displayed after submitting the form', async ({ page }) => {
    await page.goto(url.toString());
    await page.getByPlaceholder('Enter a message').fill('Hello, world!');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('User says: Hello, world!')).toBeVisible();

    await page.reload();
    await expect(page.getByText('User says: Hello, world!')).toBeVisible();
  });
});