import { expect, test, type Page } from '@playwright/test';
import { viewersReady } from './helpers.js';

// The resizable sidebar (amendment 19): drag, keyboard, clamping, reset, and absence in the drawer.
const doc = '../../docs/examples/orders-v3.yaml';

async function sideWidth(page: Page): Promise<number> {
  return page.locator('asyncapi-viewer').locator('.side').evaluate((el) => Math.round(el.getBoundingClientRect().width));
}

test('the sidebar resizes by dragging its edge, by keyboard, clamps, and resets on double-click', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/viewer/demo/?doc=${encodeURIComponent(doc)}`);
  await viewersReady(page);
  await page.locator('asyncapi-viewer').evaluate((el) => el.setAttribute('sidebar', ''));
  await page.waitForTimeout(200);
  expect(await sideWidth(page)).toBe(292);

  const handle = page.locator('asyncapi-viewer').locator('.side__resize');
  await expect(handle).toHaveAttribute('aria-valuenow', '292');
  const box = (await handle.boundingBox())!;
  const y = box.y + 200;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, y, { steps: 5 });
  await page.mouse.up();
  expect(await sideWidth(page)).toBe(372);
  await expect(handle).toHaveAttribute('aria-valuenow', '372');

  // Clamped: the main column keeps at least 600px, the sidebar at least 220px.
  await handle.focus();
  await page.keyboard.press('End');
  const max = await sideWidth(page);
  expect(max).toBeLessThanOrEqual(560);
  const viewer = await page.locator('asyncapi-viewer').evaluate((el) => Math.floor(el.getBoundingClientRect().width));
  expect(viewer - max).toBeGreaterThanOrEqual(600);
  await page.keyboard.press('Home');
  expect(await sideWidth(page)).toBe(220);
  await page.keyboard.press('ArrowRight');
  expect(await sideWidth(page)).toBe(236);

  await handle.dblclick();
  expect(await sideWidth(page)).toBe(292);

  // Below 1100px the drawer takes over and the handle is gone.
  await page.setViewportSize({ width: 820, height: 900 });
  await page.waitForTimeout(200);
  await expect(handle).toBeHidden();
  await expect(page.locator('asyncapi-viewer').locator('.menu')).toBeVisible();
});
