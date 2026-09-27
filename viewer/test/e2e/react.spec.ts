import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { viewersReady } from './helpers.js';

// A React 19 app that installed the packed npm package (test/e2e/react/, built by build.mjs into
// an ignored dist/). It is skipped until built; CI builds it.
const appPath = fileURLToPath(new URL('./react/dist/index.html', import.meta.url));
test.skip(!existsSync(appPath), 'run `node viewer/test/e2e/react/build.mjs` first');

const base = '/viewer/test/e2e/react/dist/';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    // The missing document's 404 is expected; Chromium's message carries the URL only in the location.
    if (m.type() === 'error' && !m.location().url.includes('nope.yaml')) errors.push(m.text());
  });
  return errors;
}

async function open(page: Page): Promise<Locator> {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(base);
  await viewersReady(page);
  return page.locator('#react-playground');
}

test('JSX props reach the element as attributes and every viewer renders', async ({ page }) => {
  const errors = collectErrors(page);
  const viewer = await open(page);
  await expect(page.locator('asyncapi-viewer')).toHaveCount(3);

  // React 19: true is a bare attribute, className is class, strings pass through.
  await expect(viewer).toHaveAttribute('sidebar', '');
  await expect(viewer).toHaveAttribute('class', 'viewer');
  await expect(viewer).toHaveAttribute('theme', 'auto');
  await expect(viewer.locator('.header')).toContainText('Orders service');
  await expect(viewer.locator('.op')).toHaveCount(2);
  await expect(viewer.locator('.side__search')).toBeVisible();

  await expect(page.locator('#react-object .header')).toContainText('Built in React');
  await expect(page.locator('#react-missing .alert')).toContainText('Could not load');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('changing src from React state loads the new document', async ({ page }) => {
  const errors = collectErrors(page);
  const viewer = await open(page);

  await page.getByTestId('document').selectOption('accounts-v2.json');
  await expect(viewer.locator('.header')).toContainText('Accounts');
  await expect(viewer.locator('.pill--outline')).toContainText('AsyncAPI 2');

  await page.getByTestId('document').selectOption('streetlights-kafka-asyncapi.yml');
  await expect(viewer.locator('.header')).toContainText('Streetlights');
  await expect(viewer.locator('.op').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('boolean, enum and string props update the rendered viewer', async ({ page }) => {
  const errors = collectErrors(page);
  const viewer = await open(page);

  // false removes the attribute: the sidebar goes away.
  await page.getByTestId('sidebar').uncheck();
  await expect(viewer).not.toHaveAttribute('sidebar');
  await expect(viewer.locator('.side__search')).toHaveCount(0);
  await page.getByTestId('sidebar').check();
  await expect(viewer.locator('.side__search')).toBeVisible();

  await page.getByTestId('theme').selectOption('dark');
  await expect(viewer).toHaveAttribute('resolved-theme', 'dark');
  await page.getByTestId('theme').selectOption('light');
  await expect(viewer).toHaveAttribute('resolved-theme', 'light');

  await page.getByTestId('message-examples').uncheck();
  await expect(viewer).toHaveAttribute('message-examples', 'false');

  // Badge labels are part of the model; a label changed after load must still show.
  await page.getByTestId('send-label').fill('PUBLISH');
  await expect(viewer.locator('.badge--send').first()).toHaveText('PUBLISH');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('unmounting and remounting the element renders it again', async ({ page }) => {
  const errors = collectErrors(page);
  await open(page);

  for (let i = 0; i < 3; i++) {
    await page.getByTestId('mounted').uncheck();
    await expect(page.locator('#react-playground')).toHaveCount(0);
    await page.getByTestId('mounted').check();
    await viewersReady(page);
    await expect(page.locator('#react-playground .header')).toContainText('Orders service');
  }
  expect(errors, errors.join('\n')).toEqual([]);
});

test('a document held in React state renders through a Blob URL and follows edits', async ({ page }) => {
  const errors = collectErrors(page);
  await open(page);
  const viewer = page.locator('#react-object');

  await expect(viewer.locator('.op')).toHaveCount(1);
  await page.getByTestId('add-event').click();
  await expect(viewer.locator('.op')).toHaveCount(2);
  await expect(viewer.locator('.pill--tint')).toHaveText('v2.0.0');
  await page.getByTestId('add-event').click();
  await expect(viewer.locator('.op')).toHaveCount(3);
  await expect(viewer.locator('.op').last()).toContainText('things.deleted');
  expect(errors, errors.join('\n')).toEqual([]);
});
