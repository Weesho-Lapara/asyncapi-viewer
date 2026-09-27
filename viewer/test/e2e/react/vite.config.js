import { defineConfig } from 'vite';

// Served by the e2e static server (scripts/serve.mjs serves the repository root), so the
// built files live under this path. JSX through the automatic runtime: no React plugin needed.
export default defineConfig({
  base: '/viewer/test/e2e/react/dist/',
  oxc: { jsx: { runtime: 'automatic' } },
  // React plus the viewer (Lit, YAML, markdown-it) in one chunk is about 550 kB unminified-gzip aside.
  build: { chunkSizeWarningLimit: 800 },
});
