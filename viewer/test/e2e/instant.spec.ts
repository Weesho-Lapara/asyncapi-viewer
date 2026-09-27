import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { viewersReady } from './helpers.js';

// Material's navigation.instant swaps page content without a full load (ROADMAP chunk 3.1).
// test/e2e/mkdocs/build.py builds the fixture site; it is not committed, so the test is skipped
// until it exists. CI builds it.
const sitePath = fileURLToPath(new URL('./mkdocs/site/index.html', import.meta.url));
test.skip(!existsSync(sitePath), 'run `python viewer/test/e2e/mkdocs/build.py` first');

const base = '/viewer/test/e2e/mkdocs/site/';

test('viewers render on every page reached through instant navigation, and after going back', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(base);
  await viewersReady(page);
  await expect(page.locator('asyncapi-viewer .op')).toHaveCount(2);
  await expect(page.locator('asyncapi-viewer .header')).toContainText('Orders service');
  // A marker that survives only if the document is never reloaded.
  await page.evaluate(() => {
    (window as unknown as { __instant: number }).__instant = 1;
  });

  // Material's instant navigation is active when clicking a nav link keeps the marker.
  await page.getByRole('link', { name: 'Accounts', exact: true }).first().click();
  await page.waitForURL(`**${base}accounts/`);
  await viewersReady(page);
  expect(await page.evaluate(() => (window as unknown as { __instant?: number }).__instant)).toBe(1);
  await expect(page.locator('asyncapi-viewer .header')).toContainText('Accounts service');
  await expect(page.locator('asyncapi-viewer .op')).toHaveCount(2);

  // Through a page without a viewer and on to one with, then back through history.
  await page.getByRole('link', { name: 'Plain', exact: true }).first().click();
  await page.waitForURL(`**${base}plain/`);
  await expect(page.locator('asyncapi-viewer')).toHaveCount(0);
  await page.getByRole('link', { name: 'Orders', exact: true }).first().click();
  await page.waitForURL(`**${base}`);
  await viewersReady(page);
  await expect(page.locator('asyncapi-viewer .header')).toContainText('Orders service');
  // In a docs column the viewer is narrower than 1100px, so the sidebar attribute shows as the drawer's menu button.
  await expect(page.locator('asyncapi-viewer .menu')).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __instant?: number }).__instant)).toBe(1);

  await page.goBack();
  await page.waitForURL(`**${base}plain/`);
  await page.goBack();
  await page.waitForURL(`**${base}accounts/`);
  await viewersReady(page);
  await expect(page.locator('asyncapi-viewer .header')).toContainText('Accounts service');

  // The element was defined once: a second module tag must not throw.
  expect(errors, errors.join('\n')).toEqual([]);
});
