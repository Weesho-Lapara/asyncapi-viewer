# AGENTS.md

Guidance for coding agents and new contributors working in this repository.

## What this is

`asyncapi-viewer` renders AsyncAPI documents in Markdown via an `<asyncapi-viewer src="...">` element.
It is a Python-Markdown extension plus a thin MkDocs plugin. Browser-side rendering is done by the
pinned `@asyncapi/react-component` standalone bundle.

The repository is also home to the deprecated `asyncapi-tag` PyPI package (the previous name), now a
shim under `legacy/` that only depends on `asyncapi-viewer`. The name before that,
`mkdocs-asyncapi-tag-plugin`, is archived on PyPI and no longer built here.

Direction, future plans and evaluations of other ecosystems (Docusaurus, Zensical, MkDocs 2.0)
are in [ROADMAP.md](ROADMAP.md); keep this file to how the repository works.

## Layout

```
src/asyncapi_viewer/
  __init__.py        version, public exports
  assets.py          legacy: pinned React viewer URLs/SRI, RUNNER_JS, loader_html(); new: static/ files,
                     manifest, copy_assets(), cdn_url(), viewer_loader_html()
  options.py         reads options.schema.json (copied from viewer/); validation shared with the viewer
  extension.py       Markdown extension: tag regex, attribute parsing, both renderers, preprocessor
  fallback.py        search fallback: hidden index list for local documents (PyYAML optional)
  mkdocs_plugin.py   MkDocs plugin: config options, registers the extension, resolves src per page
  __main__.py        `python -m asyncapi_viewer copy-assets DIR` for hosts without plugin hooks
viewer/                              the web component (Lit + TypeScript, Vite library build, Vitest,
                                     Playwright); published to npm as asyncapi-viewer with each release
  src/model/types.ts                 the normalised model, the contract between normalisers and UI
  src/model/invariants.ts            structural rules every model must satisfy (used by tests)
  src/events.ts                      public event and attribute types (asyncapi-load/-error,
                                     AsyncAPIViewerAttributes; test/attributes.test.ts keeps the
                                     latter in step with the schema); tsconfig.build.json emits
                                     dist/types/ after the Vite build
  types/react.d.ts                   JSX typing for React (package export asyncapi-viewer/react)
  test/e2e/                          Playwright: accessibility (axe), CSP page, screenshot capture,
                                     markdown/ (a page rendered by plain Python-Markdown; render.py
                                     writes index.html, ignored) and mkdocs/ (a Material fixture site
                                     with navigation.instant; build.py writes site/, ignored) and
                                     react/ (a React 19 app that installs the packed npm package;
                                     build.mjs writes dist/, ignored; own package-lock.json)
  test/fixtures/expected/            hand-written expected models for the docs example documents
  demo/                              visual test bench; demo/spec-examples/ is a generated copy of
                                     asyncapi/spec examples (npm run sync-examples), never edited by hand
legacy/asyncapi-tag/                 deprecated shim package (own pyproject, no entry points)
scripts/set_version.py               one version for the Python package and the npm package (--check in CI)
scripts/sync_viewer.py               copies the built viewer, theme, manifest and schema into the package
prototypes/docusaurus/               unpublished proof of concept, see ROADMAP.md
tests/                               pytest; test_mkdocs_plugin.py builds real sites in tmp_path
docs/ + mkdocs.yml                   documentation site, built with the plugin (Material theme);
                                     docs/examples/ holds the demo documents (two of our own, two
                                     copied from asyncapi/spec); docs/assets/screenshots/ is
                                     written by viewer/scripts/docs-screenshots.ts
.github/workflows/ci.yml             tests on Python 3.9-3.14, viewer build, lint, tests and Playwright,
                                     strict docs build under MkDocs and Zensical, both distributions
.github/workflows/docs.yml           deploys the docs site to GitHub Pages on push to main
                                     (Pages source must be set to "GitHub Actions" once, in Settings)
.github/workflows/publish.yml        on a version tag: viewer build, npm publish (trusted publishing,
                                     provenance), wheel, PyPI, GitHub release with the changelog section
.github/workflows/compat.yml         weekly informational run against MkDocs 2.0 pre-release and
                                     newest Markdown/Material (continue-on-error)
```

## Commands

```sh
python -m venv .venv && source .venv/bin/activate
pip install -e ".[test]"
pytest                                   # node on PATH enables the JS syntax test
python -m build                          # asyncapi-viewer
python -m build legacy/asyncapi-tag
python scripts/set_version.py 2.0.0       # both package versions; --check exits 1 when they differ
pip install -e ".[docs]" && mkdocs build --strict   # docs site; `mkdocs serve` to preview
pip install zensical && zensical build             # same site under Zensical
cd viewer && npm ci && npm run check && npm test && npm run build   # the 2.0 viewer (Node 22)
cd viewer && npm run coverage            # normaliser over the AsyncAPI example corpus -> test/coverage/REPORT.md
cd viewer && npm run e2e:install && npm run e2e   # Playwright: accessibility, CSP page, screenshots
python viewer/test/e2e/markdown/render.py         # before npm run e2e: the plain Python-Markdown page
python viewer/test/e2e/mkdocs/build.py            # before npm run e2e: the instant-navigation fixture site
node viewer/test/e2e/react/build.mjs              # before npm run e2e: the React app (after npm run build)
python -m asyncapi_viewer copy-assets DIR          # viewer files plus SRI hashes for hosts without plugin hooks
cd viewer && npx tsx scripts/docs-screenshots.ts  # docs/assets/screenshots/ (light and dark), after npm run build
cd viewer && npm run sync-examples       # refresh demo/spec-examples/ (spec corpus copy) after npm run coverage
python scripts/sync_viewer.py            # copy the built viewer, theme, manifest and schema into the package
```

## Conventions and constraints

- Never interpolate Markdown-sourced text into JavaScript. Per-tag data goes into HTML-escaped
  `data-asyncapi-*` attributes; `RUNNER_JS` reads them. Keep `RUNNER_JS` free of `</script>`.
- Never load the viewer from `@latest`. The Python package and the npm package share one version
  (`scripts/set_version.py`); the CDN option points at the npm copy of the packaged version. The
  legacy renderer's `assets.py` constants (the last `@asyncapi/react-component`) are frozen.
- `url_resolver` and `warn` extension options must have non-`None`, non-bool defaults:
  Python-Markdown coerces `None`-default config values with `parseBoolValue`. Asset options use
  the string `auto` for "the renderer's default" for the same reason.
- `src/asyncapi_viewer/options.schema.json` and `src/asyncapi_viewer/static/` are copies made by
  `scripts/sync_viewer.py` from `viewer/`; they are ignored by git and shipped in the wheel. The
  test suite copies the schema itself; CI runs the script before building the wheel and the docs.
- The extension has two renderers: `viewer` (default, emits `<asyncapi-viewer>` validated against
  the schema) and `legacy` (the 1.x container plus the React-based viewer, kept for one major
  version). Tests in `test_extension.py` and `test_mkdocs_plugin.py` describe the legacy output;
  `test_viewer_renderer.py` the new one.
- The build never fetches documents. The search fallback (`fallback.py`, extension option
  `search_fallback`, default on) reads a document only when `file_resolver` maps `src` to an
  existing local file: the plugin maps through the MkDocs files collection, the bare extension
  resolves against the working directory. It emits `<ul data-asyncapi-fallback hidden>` inside the
  element; the viewer removes it in `firstUpdated`. YAML needs PyYAML (extra `yaml`); without it
  YAML documents get no list and no warning.
- The preprocessor runs at priority 26, before `fenced_code`/`superfences` (25) stash fences, and
  tracks fences itself: a top-level ```` ```asyncapi ```` fence becomes a viewer, any other fence is
  passed through untouched (so tags inside it stay code), and tags in indented code or inline code
  spans are skipped. Both syntaxes share `_block()` (numbering, loader emission).
- `show.sidebar` defaults to off (the viewer's own default); the other `show.*` flags and
  `expand.messageExamples` default to on. Changing defaults is a breaking change.
- `assets.EMBED_CSS` keeps the viewer inside its container: the component uses container queries
  and, in a docs column, a `position: fixed` sidebar toggle/overlay and a non-shrinking centre
  panel, plus z-index 10-30 panels that beat a sticky header; the container's `z-index: 0` confines
  them. Re-check those class names (`.fixed`, `.burger-menu`, `.panel--center`) on viewer bumps.
- The legacy shim must not declare entry points; `asyncapi-viewer` itself registers both the new
  names and the old ones (plugin `asyncapi-tag`, extension `asyncapi_tag`), and the element
  `<asyncapi-tag>` stays an alias of `<asyncapi-viewer>` until 3.0. MkDocs lets the last
  duplicate entry point win silently, so never register the same id twice.
- Warnings in the MkDocs plugin go through `get_plugin_logger` so `--strict` fails on them.
- Do not commit build output, virtualenvs, `site/`, or agent working files; `.gitignore` covers them.
  Use a `scratch/` directory (ignored) for demo sites.
- `mkdocs.yml` lists both `plugins: [asyncapi-viewer]` and `markdown_extensions: [asyncapi_viewer]` on
  purpose: Zensical ignores `plugins` and honours `markdown_extensions`; the plugin does not
  duplicate an extension the user already listed. Keep both. Under Zensical the bare extension
  auto-detects `./docs` (`docs_dir`), links the viewer copy in `docs/assets/asyncapi-viewer/`
  (ignored by git) and resolves local documents under `docs/` for the search index. Zensical lists
  files before rendering, so a fresh checkout needs `python -m asyncapi_viewer copy-assets
  docs/assets/asyncapi-viewer` before `zensical build` (CI does); the extension refreshes the copy
  on later builds. Zensical does not clean `site/`, so check fresh builds with `rm -rf site`.
  The tests run from a neutral directory (`neutral_cwd` fixture) so auto-detection stays out.
- The docs site is the end-to-end test. New behaviour should be visible on `docs/demo.md` when it
  makes sense, and `mkdocs build --strict` must stay clean. The site runs on the new viewer;
  `docs/stylesheets/extra.css` loads the design fonts and styles the demo's document picker;
  `docs/javascripts/demo.js` switches the demo's one viewer between the example documents.
- Since the 2.0.0 release (2026-09-27) all work happens on `main`; the `viewer-2` feature branch is
  merged and historical. `viewer/dist/` and `viewer/node_modules/` are never committed;
  `package-lock.json` is.

## Releasing

One version number covers the Python package on PyPI and the viewer on npm; a tag publishes both.

1. `python scripts/set_version.py <version>` (writes `__version__` and `viewer/package.json`), turn
   the `## Unreleased` section of `CHANGELOG.md` into `## asyncapi-viewer <version> (<date>)`,
   commit and push to `main`.
2. Tag and push: `git tag v<version> && git push origin v<version>`.
3. `publish.yml` checks that the tag, both versions and the changelog agree, builds and tests the
   viewer, packs it, builds the wheel, publishes to npm first (trusted publishing with provenance,
   environment `npm`; a version already on npm is skipped, which is how the first, hand-published
   version gets through; the npm-side trusted publisher must exist for `asyncapi-viewer`: GitHub
   Actions, repository `Weesho-Lapara/asyncapi-viewer`, workflow `publish.yml`, environment `npm`),
   then to PyPI (trusted publishing, environment `pypi`, configured for both projects), then creates
   the GitHub release with that version's changelog section as notes and the wheel, sdist and npm
   tarball attached. The shim job only runs for the `v1.2.0` tag.
4. After a release, close any issues it resolves with a note pointing at the release.
   The repository was `mkdocs-asyncapi-tag-plugin`, then `asyncapi-tag`, and is now `asyncapi-viewer`;
   GitHub redirects the old URLs.
