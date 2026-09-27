/**
 * Screenshots for the documentation site, written to docs/assets/screenshots/ (committed). Each
 * shot comes in a light and a dark variant; pages pick one with Material's #only-light and
 * #only-dark image suffixes. Re-run after visible viewer changes, with the viewer built:
 *
 *   npm run build && npx tsx scripts/docs-screenshots.ts
 *
 * Starts the e2e static server itself and loads the design fonts from Google Fonts, as the docs
 * site does, so the shots match what readers see there.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';

const port = 8767;
const base = `http://127.0.0.1:${port}`;
const out = fileURLToPath(new URL('../../docs/assets/screenshots/', import.meta.url));
const fonts = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Titillium+Web:wght@600&family=Source+Code+Pro:wght@400;500&display=swap';

interface Shot {
  name: string;
  src: string;
  width: number;
  height: number;
  attributes: Record<string, string>;
  /** Extra page CSS, e.g. the demo's customised accents. */
  css?: string;
  /** Anchor suffix inside the viewer to scroll to, e.g. "operations--emitOrderPlaced". */
  anchor?: string;
}

const shots: Shot[] = [
  // Info and Servers are hidden so the header and the first operation share the frame.
  // Overview: the full layout with the inline sidebar and the example panel beside the payload.
  { name: 'viewer', src: '/docs/examples/orders-v3.yaml', width: 1600, height: 900, attributes: { sidebar: '', 'theme-toggle': '', info: 'false', servers: 'false' } },
  // Overview: the same viewer in a phone-width column, with the sidebar as a drawer.
  { name: 'narrow', src: '/docs/examples/orders-v3.yaml', width: 400, height: 780, attributes: { sidebar: '', info: 'false', servers: 'false' } },
  // Customising: the demo page's three lines of CSS.
  {
    name: 'customised',
    src: '/docs/examples/orders-v3.yaml',
    width: 1280,
    height: 820,
    attributes: { 'theme-toggle': '', info: 'false', servers: 'false' },
    css: 'asyncapi-viewer { --asyncapi-primary: #0F766E; --asyncapi-secondary: #9F1239; --asyncapi-radius: 4px; }',
  },
];

async function capture(page: Page, shot: Shot, theme: 'light' | 'dark'): Promise<void> {
  await page.setViewportSize({ width: shot.width, height: shot.height });
  await page.goto(`${base}/viewer/test/e2e/blank.html`);
  await page.evaluate(
    ({ shot, theme, fonts }) => {
      document.documentElement.dataset['theme'] = theme;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fonts;
      document.head.appendChild(link);
      const style = document.createElement('style');
      // No page padding: the shot is the viewer edge to edge.
      style.textContent = `body { padding: 0 !important; } ${shot.css ?? ''}`;
      document.head.appendChild(style);
      const el = document.createElement('asyncapi-viewer');
      el.id = 'shot';
      el.setAttribute('src', shot.src);
      for (const [k, v] of Object.entries(shot.attributes)) el.setAttribute(k, v);
      document.body.appendChild(el);
    },
    { shot, theme, fonts },
  );
  await page.waitForFunction(() => (document.querySelector('asyncapi-viewer') as HTMLElement & { model?: unknown }).model !== undefined);
  await page.evaluate(() => document.fonts.ready);
  if (shot.anchor) {
    await page.evaluate((id) => {
      location.hash = id;
    }, `shot--${shot.anchor}`);
  }
  await page.waitForTimeout(400);
  const file = `${out}${shot.name}-${theme}.png`;
  await page.screenshot({ path: file });
  console.log(`wrote docs/assets/screenshots/${shot.name}-${theme}.png`);
}

const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
try {
  await new Promise((resolve) => setTimeout(resolve, 500));
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const shot of shots) {
    for (const theme of ['light', 'dark'] as const) await capture(page, shot, theme);
  }
  await browser.close();
} finally {
  server.kill();
}
