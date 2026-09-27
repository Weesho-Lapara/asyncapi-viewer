# asyncapi-viewer (web component)

A web component that renders [AsyncAPI](https://www.asyncapi.com/) 2 and 3 documents, JSON or
YAML, in the browser: `<asyncapi-viewer src="asyncapi.yaml"></asyncapi-viewer>`. Operations with
payload trees and example panels, servers, messages and schemas, a searchable sidebar with tag
filters, light and dark themes that follow the page, a container-based layout for documentation
columns, and no inline script or style, so `script-src 'self'; style-src 'self'` is enough.

It is the browser side of the [`asyncapi-viewer`](https://pypi.org/project/asyncapi-viewer/)
Python-Markdown extension and MkDocs plugin, and ships inside that package; this npm package is
the same build for any other page. Documentation, attributes and theming:
https://weesho-lapara.github.io/asyncapi-viewer/

## Use

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.1.0/dist/asyncapi-viewer.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.1.0/theme/asyncapi-theme.css">

<asyncapi-viewer src="asyncapi.yaml" sidebar></asyncapi-viewer>
```

Or `npm install asyncapi-viewer` and import `asyncapi-viewer` (an ES module that defines the
element) or load `asyncapi-viewer/iife` with a plain script tag. Each load fires
`asyncapi-load` (`detail.model`, `detail.problems`) or `asyncapi-error` (`detail.error`). Types
ship with the package; `import type {} from 'asyncapi-viewer/react'` adds the element to React's
JSX, with `onasyncapi-load` and `onasyncapi-error`. React and SSR notes:
https://weesho-lapara.github.io/asyncapi-viewer/other-tools/ The theme file is optional: copy
it to change the two accent colours, or set any `--asyncapi-*` custom property on the element.
Fonts are never loaded by the component; the page opts in (see the theme file).

## Development

The component knows nothing about MkDocs or Python. Its only interfaces are the element and its
attributes, `options.schema.json`, and the CSS custom properties in `theme/asyncapi-theme.css`.
See [ROADMAP.md](../ROADMAP.md) for the design decisions and
[specs/viewer-spec.md](../specs/viewer-spec.md) for the original specification.

```sh
npm ci
npm run check         # tsc + eslint
npm test              # vitest: options, loader, resolver, normalisers, schema builder, generator
npm run build         # dist/asyncapi-viewer.js (ESM) and dist/asyncapi-viewer.iife.js
npm run coverage      # normaliser over the AsyncAPI example corpus -> test/coverage/REPORT.md
npm run e2e:install   # Playwright browsers (once)
npm run e2e           # Playwright: axe-core accessibility, CSP page, screenshot capture
npm run sync-examples # refresh demo/spec-examples/ from the coverage corpus (after npm run coverage)
```

The demo at `demo/index.html` is a visual test bench: one viewer, a dropdown of every
asyncapi/spec example (a verbatim copy under `demo/spec-examples/`, listed by its
`index.json`), the docs examples and every test fixture, option checkboxes and a width switch.
Serve the repository root (`node scripts/serve.mjs`, or any static server) and open
`/viewer/demo/`; `?doc=<path>` selects a document.

## Browser suite (Playwright)

- `test/e2e/a11y.spec.ts`: axe-core over the demo at 1280 and 380px in light and dark, with
  the drawer open on the narrow width; fails on serious or critical violations. Plus a keyboard
  walk through the drawer and a tree toggle.
- `test/e2e/csp.spec.ts`: `test/e2e/csp/` is served with
  `default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'` and must render
  fully with no CSP console errors. Result on 2026-09-26: Chromium and WebKit pass locally,
  Firefox passes in CI (Playwright's Firefox build does not launch on this macOS version).
  Lit's constructed stylesheets and the CSSOM writes for derived colours are allowed under a
  strict `style-src`; a `style` attribute binding was not, and was removed.
- `test/e2e/instant.spec.ts`: a Material for MkDocs fixture site with `navigation.instant`
  (`test/e2e/mkdocs/`, built by `build.py`, ignored): viewers render on every page reached
  through instant navigation and through history, with no full load. Skipped until built.
- `test/e2e/react.spec.ts`: a React 19 app (`test/e2e/react/`, built by `build.mjs` from the
  packed npm tarball and type-checked against the shipped types, so `files`, `exports` and the
  types are tested too; `dist/` ignored): JSX props arrive as attributes (booleans bare or
  removed, `className` as `class`), `onasyncapi-load`/`onasyncapi-error` receive the events,
  `src`, theme, sidebar and label changes from state re-render, repeated unmount and remount,
  and a document built as a JavaScript object handed over as a Blob URL. Skipped until built.
- `test/e2e/sidebar.spec.ts`: the resizable sidebar (drag, keyboard, clamping, double-click reset,
  no handle in the drawer layout).
- `test/e2e/screenshots.spec.ts`: captures every example document at 1280, 820 and 380px in
  both themes into `test/e2e/screenshots/<browser>/` (ignored by git, uploaded as a CI
  artifact) and asserts no horizontal overflow. Pixel comparison across platforms is not
  attempted.

`dist/` is never committed. The Python package copies the built files at build time.

## Bundle size log (gzipped IIFE)

| Date | Chunk | Size |
|---|---|---|
| 2026-09-26 | 0.2 skeleton (Lit only) | 6.0 kB |
| 2026-09-26 | 1.2 loader (`yaml` added) | 38.6 kB |
| 2026-09-26 | 1.4 v3 normaliser and schema builder | 45.1 kB |
| 2026-09-26 | 1.5 v2 normaliser | 46.3 kB |
| 2026-09-26 | 1.6 schema tree builder complete | 46.9 kB |
| 2026-09-26 | 1.7 traits and problems | 47.2 kB |
| 2026-09-26 | 1.9 UI foundation (markdown-it added) | 93.8 kB |
| 2026-09-26 | 1.10 operation block, part 1 | 94.7 kB |
| 2026-09-26 | 1.11 payload tree | 97.4 kB |
| 2026-09-26 | 1.12 example panel and generator | 100.9 kB |
| 2026-09-26 | 1.13 operation block, part 2 | 102.5 kB |
| 2026-09-26 | 1.14 remaining sections | 104.3 kB |
| 2026-09-26 | 1.15 sidebar and drawer | 107.0 kB |
| 2026-09-26 | 1.16 breakpoints verified | 107.1 kB |
| 2026-09-26 | 1.17/1.18 review round, Avro, Playwright | 109.5 kB |
