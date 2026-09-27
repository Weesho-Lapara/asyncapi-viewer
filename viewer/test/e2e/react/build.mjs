#!/usr/bin/env node
// Build the React fixture app for react.spec.ts the way a user's app would get the viewer: pack
// the npm package (so `files` and `exports` are what is tested), install the tarball into this
// app without saving it, copy the example documents into public/examples/ and run a production
// Vite build into dist/ (public/examples/, dist/ and node_modules/ are ignored by git). Requires
// `npm run build` in viewer/ first. Run from anywhere:
//
//   node viewer/test/e2e/react/build.mjs
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const viewer = join(here, '../../..');
const root = join(viewer, '..');
const npm = (args, cwd) => execFileSync('npm', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });

if (!existsSync(join(viewer, 'dist/asyncapi-viewer.js'))) throw new Error('run `npm run build` in viewer/ first');

const out = mkdtempSync(join(tmpdir(), 'asyncapi-viewer-pack-'));
try {
  const [{ filename }] = JSON.parse(npm(['pack', '--json', '--pack-destination', out], viewer));
  npm(existsSync(join(here, 'node_modules')) ? ['install', '--no-audit', '--no-fund'] : ['ci', '--no-audit', '--no-fund'], here);
  npm(['install', '--no-save', '--no-audit', '--no-fund', join(out, filename)], here);
} finally {
  rmSync(out, { recursive: true, force: true });
}

const examples = join(here, 'public/examples');
mkdirSync(examples, { recursive: true });
for (const name of ['orders-v3.yaml', 'accounts-v2.json']) copyFileSync(join(root, 'docs/examples', name), join(examples, name));
for (const name of ['streetlights-kafka-asyncapi.yml', 'adeo-kafka-request-reply-asyncapi.yml', 'gitter-streaming-asyncapi.yml']) {
  copyFileSync(join(viewer, 'demo/spec-examples', name), join(examples, name));
}

npm(['run', 'build'], here);
const index = readFileSync(join(here, 'dist/index.html'), 'utf8');
if (!/<script type="module"[^>]*src="\/viewer\/test\/e2e\/react\/dist\/assets\//.test(index)) {
  throw new Error('the built app has no module script under its base path');
}
console.log('built viewer/test/e2e/react/dist');
