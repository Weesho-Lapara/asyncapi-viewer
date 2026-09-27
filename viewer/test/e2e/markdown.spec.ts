import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { viewersReady } from './helpers.js';

// A page produced by plain Python-Markdown (ROADMAP chunk 2.4). test/e2e/markdown/render.py
// writes it; it is not committed, so the test is skipped until it exists.
const pagePath = fileURLToPath(new URL('./markdown/index.html', import.meta.url));

test.skip(!existsSync(pagePath), 'run `python viewer/test/e2e/markdown/render.py` first');

test('a plain Python-Markdown page renders both example documents and drops the search fallback', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    // The missing document's 404 is expected; Chromium's message carries the URL only in the location.
    if (m.type() === 'error' && !m.location().url.includes('nope.yaml')) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));

  // What the build produced: a module script, the theme, and a hidden index list per local document.
  const raw = await (await page.request.get('/viewer/test/e2e/markdown/')).text();
  expect(raw).toContain('<script type="module" src="/viewer/dist/asyncapi-viewer.js"></script>');
  expect(raw).toContain('<link rel="stylesheet" href="/viewer/theme/asyncapi-theme.css">');
  expect(raw.match(/<ul data-asyncapi-fallback hidden>/g)).toHaveLength(2);
  expect(raw).toContain('<li>emitOrderPlaced <span>orders.placed</span> <span>OrderPlaced</span></li>');
  expect(raw).toContain('<li>onUserSignedUp <span>user/signedup</span> <span>UserSignedUp</span></li>');
  expect(raw).not.toContain('nope.yaml"><ul'); // the missing document got no list

  await page.goto('/viewer/test/e2e/markdown/');
  await viewersReady(page);
  await expect(page.locator('asyncapi-viewer')).toHaveCount(3);

  const orders = page.locator('#asyncapi-viewer-1');
  await expect(orders.locator('.header')).toContainText('Orders service');
  await expect(orders.locator('.op')).toHaveCount(2);
  // The bare `sidebar` attribute reached the element: the sidebar (inline at this width) has its search box.
  await expect(orders.locator('.side__search')).toBeVisible();

  const accounts = page.locator('#asyncapi-viewer-2');
  await expect(accounts.locator('.header')).toContainText('Accounts');
  await expect(accounts.locator('.op')).toHaveCount(2);
  await expect(accounts.locator('.side__search')).toHaveCount(0); // no sidebar attribute
  await expect(accounts.locator('.ex')).toHaveCount(0); // message-examples="false" from the fence

  await expect(page.locator('#asyncapi-viewer-3 .alert')).toContainText('Could not load');

  // The viewer removed the fallback lists once it rendered.
  await expect(page.locator('asyncapi-viewer > [data-asyncapi-fallback]')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});
