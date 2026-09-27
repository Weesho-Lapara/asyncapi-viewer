# Changelog

## Unreleased

### Fixed
- The viewer no longer logs "unknown attribute 'resolved-theme' was ignored" for the attribute it
  sets on itself to reflect the theme.
- The MkDocs plugin now serves the packaged viewer even when `docs/assets/asyncapi-viewer/` holds
  an older copy (the one the extension keeps for Zensical builds of the same site). Before, MkDocs
  published the stale files under the packaged files' integrity hashes and browsers blocked them.

### Documentation
- New pages: Getting started, and Web pages and React (npm, script tag, React and TypeScript,
  events, Next.js, other frameworks). The overview presents both packages and has screenshots,
  also on Customising; `viewer/scripts/docs-screenshots.ts` regenerates them. The demo adds Adeo's
  Kafka request/reply document with remote Avro schemas and the Streetlights example. The README
  is shorter and points to the site.

## asyncapi-viewer 2.1.0 (2026-09-27)

### Fixed
- Badge labels (`publish-label` and the other five), `use-channel-address-as-identifier` and
  `parser-options` now take effect when they change after the document has loaded, as they do
  when React or another framework updates the element's attributes in place. Before, only a new
  `src` rebuilt the model.

### Added
- `asyncapi-load` and `asyncapi-error` events on the element, fired once per `src` after the result
  has rendered, with the model and problems or the load error as `detail`.
- TypeScript types in the npm package: the element, `AsyncAPIViewerAttributes`, the event types and
  the model; `HTMLElementTagNameMap` and `HTMLElementEventMap` entries; and
  `asyncapi-viewer/react` for JSX (`onasyncapi-load` and `onasyncapi-error` included).
- A React 19 app in the Playwright suite (`viewer/test/e2e/react/`) installs the packed npm
  package, type-checks against its types and checks JSX props, events, `src` changes, unmounting
  and a document from component state.

## asyncapi-viewer 2.0.0 (2026-09-27)

### Changed
- **A viewer of our own.** The wrapped `@asyncapi/react-component` is replaced by a web component
  that ships with the package: AsyncAPI 2 and 3, JSON and YAML, `$ref` resolution, a normalised
  model, payload trees, example panels (generated from the schema when a message has none),
  bindings and security as chips with their details, a sidebar with search, tag filters and
  grouping, light and dark modes following the page, a container-based layout for documentation
  columns, and no inline script or style, so `script-src 'self'; style-src 'self'` suffices.
  Typefaces follow Swagger UI (Titillium Web, Open Sans, Source Code Pro) with system fallbacks;
  the page opts in to loading them.
- **Assets are served from the site by default.** The MkDocs plugin publishes the packaged
  viewer under `assets/asyncapi-viewer/` with Subresource Integrity hashes; the bare extension
  defaults to the jsDelivr copy of the same version. `viewer_theme` names the theme stylesheet;
  `viewer_css` is a deprecated alias. `embed_css` does nothing and warns. The runner script is gone.
- Attributes are validated against the schema the viewer ships. `schemaID` is deprecated (warns,
  does nothing); `parserOptions` honours `applyTraits` only. New attributes `theme`, `themeToggle`
  and `searchKeepSections`. Kebab-case spellings are accepted.
- Anchors inside the viewer are `<element id>--<section>--<item>`.

### Added
- Search index: for a local `src` the build emits a hidden list of operation headings, channel
  addresses and message names inside the element (option `search_fallback`, on by default;
  `file_resolver` decides what counts as a local file; YAML needs the `yaml` extra). The viewer
  removes it on render. The build still never fetches documents.
- Hosts without plugin hooks (Zensical, MkDocs 2.0) are first-class: the extension finds the
  docs directory (`docs_dir`, auto-detected as `./docs`), keeps a copy of the viewer under it
  (`assets_dir`) fresh and links it docs-relative, finds local documents there for the search
  index and warns when one is missing. `python -m asyncapi_viewer copy-assets DIR` makes the
  first copy (Zensical lists files before it renders) and prints the hashes.
- `renderer: legacy` keeps the 1.x output for one major version.
- A Customising page: two accents in a theme file, every design token, fonts, Material palettes.

### Removed
- The weekly re-pin of the React component (`update-viewer.yml`) and the `unpkg.com` defaults.

## asyncapi-viewer 1.2.0 (2026-09-26)

### Changed
- **Renamed to `asyncapi-viewer`.** PyPI package `asyncapi-viewer`, import `asyncapi_viewer`, MkDocs
  plugin id `asyncapi-viewer`, Markdown extension `asyncapi_viewer`, element `<asyncapi-viewer>`.
  The old names (`asyncapi-tag` plugin id, `asyncapi_tag` extension, `<asyncapi-tag>` element,
  `asyncapi_tag` import via the shim) keep working until 3.0. Default container ids are now
  `asyncapi-viewer-N`; containers carry both the `asyncapi-viewer` and `asyncapi-tag` classes.
- Repository renamed to `Weesho-Lapara/asyncapi-viewer`; docs at
  https://weesho-lapara.github.io/asyncapi-viewer/.

### Added
- Fenced-block syntax: a fence with language `asyncapi` whose body is `key: value` lines using the
  attribute names (the path may also follow the language). Works with `fenced_code` and
  `pymdownx.superfences`, needs no configuration, and an `asyncapi` fence nested inside a longer
  fence stays a code sample.

### Fixed
- An `<asyncapi-tag>` written inside an inline code span (backticks) was rendered instead of being
  shown as code.

## asyncapi-tag 1.2.0 (2026-09-26)

- Deprecated shim: contains no code of its own, depends on `asyncapi-viewer>=1.2.0,<2` and
  re-exports its modules under the old import name.

## asyncapi-tag 1.1.0 (2026-09-25)

### Changed
- `sidebar` now defaults to `false`, matching the viewer. Inside a documentation column the viewer
  uses its compact layout, where the sidebar hides behind a toggle button; pages that want it should
  set `sidebar="true"`.
- Network-level load errors name the URL that failed instead of the browser's terse message.

### Fixed
- The viewer spilled over the right-hand table of contents in Material and floated its sidebar toggle
  and overlay over the page. A small stylesheet (`embed_css`, on by default) now keeps the viewer,
  its toggle and its sidebar inside the container, and below the theme's sticky header.
- Only the first viewer on a page rendered on a full page load.

### Added
- Plugin/extension option `embed_css`.
- Documentation site at https://weesho-lapara.github.io/asyncapi-tag/, built with the plugin itself
  (Material theme with instant navigation) and deployed from CI. A strict build of it runs on every
  pull request, under MkDocs and under Zensical.
- Zensical support documented: enable `markdown_extensions: [asyncapi_tag]`; Zensical resolves
  relative `src` paths per page on its own.
- Weekly `update-viewer` workflow that re-pins `@asyncapi/react-component`, runs the tests and opens
  a pull request. `scripts/update_viewer.py` gained `--check` and now records the bump in this file.
- Weekly `compat` workflow that runs the suite against the MkDocs 2.0 pre-release and the newest
  Python-Markdown and Material, as an early warning.
- `docs` extra (`pip install asyncapi-tag[docs]`).

## asyncapi-tag 1.0.0 (2026-09-25)

First release under the new name. The project was previously published as
`mkdocs-asyncapi-tag-plugin`; that package is now a deprecated shim depending on this one.

### Changed
- Rewritten as a Python-Markdown extension (`asyncapi_tag`) with a thin MkDocs plugin around it.
  The plugin id `asyncapi-tag` is unchanged.
- The viewer (`@asyncapi/react-component`) is pinned to 3.2.1 and loaded with Subresource
  Integrity instead of `@latest` without a hash. New plugin options `viewer_js`, `viewer_css`,
  `viewer_js_integrity`, `viewer_css_integrity` and `load_assets` allow self-hosting.
- The viewer stylesheet is now loaded; earlier versions rendered unstyled output.
- The viewer renders where the tag is placed, and every tag on a page is rendered, not only the first.
- Per-tag data is emitted in HTML data attributes and rendered by a single runner script. Nothing
  from the Markdown source is interpolated into JavaScript.
- Errors while fetching or rendering are shown inside the container instead of only in the console.
- Warnings (missing document, invalid attribute) go through the MkDocs logger, so
  `mkdocs build --strict` catches them.
- Packaging moved to `pyproject.toml` (PEP 621), `src/` layout, Python 3.9+.

### Fixed
- `src` is resolved relative to the page like MkDocs links, or relative to `docs_dir` when it starts
  with `/`. Earlier versions emitted the build machine's absolute filesystem path.
- YAML documents work: the document is passed to the viewer as text and parsed there.
  Supersedes [#1](https://github.com/Weesho-Lapara/asyncapi-tag/pull/1)
  (thanks @mistermelphin) and fixes the JavaScript syntax error in 0.9.0 reported in
  [#2](https://github.com/Weesho-Lapara/asyncapi-tag/issues/2) (thanks @busches).
- String and enum attributes (`publishLabel`, `showServers`, `parserOptions`, ...) are passed
  through instead of being turned into booleans. Added the AsyncAPI v3 labels
  (`sendLabel`, `receiveLabel`, `requestLabel`, `replyLabel`), `showMessageExamples`,
  `useChannelAddressAsIdentifier`, `schemaID` and `id`.
- Self-closing tags, tags without attributes, multi-line tags and tags inside code blocks are
  handled correctly.
- The `tests` package is no longer installed into site-packages, and the unused
  `beautifulsoup4` dependency is gone.

### Deprecated
- Plugin option `asyncapi_file` is ignored with a warning; MkDocs copies non-Markdown files itself.

## mkdocs-asyncapi-tag-plugin 1.0.0 (2026-09-25)

- Deprecated shim: contains no code and depends on `asyncapi-tag>=1.0.0,<2`.

## mkdocs-asyncapi-tag-plugin 0.9.0 (2024-11-26)

- Attempted YAML support via js-yaml. The emitted JavaScript contained a syntax error, so the
  viewer did not render (issue #2).

## mkdocs-asyncapi-tag-plugin 0.8.0 (2024-10-17)

- Last working release under the old name. JSON documents only.
