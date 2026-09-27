# Other tools

`asyncapi-viewer` is a Python-Markdown extension first. The MkDocs plugin is a thin layer that
resolves document paths per page, publishes the viewer into the site and reports problems through
the MkDocs logger.

## Zensical

[Zensical](https://zensical.org/) reads `mkdocs.yml` but does not run MkDocs plugins. It does honour
`markdown_extensions`, and the extension is built to work on its own:

```yaml title="mkdocs.yml"
markdown_extensions:
  - asyncapi_viewer
```

Then put the viewer under `docs/` once:

```sh
python -m asyncapi_viewer copy-assets docs/assets/asyncapi-viewer
```

Zensical lists the files under `docs/` before it renders any page, so the copy has to exist before
the first build; commit it or add it to `.gitignore` and run the command in CI. From then on the
extension keeps it fresh: it finds the `docs/` directory (or the one you give as `docs_dir`),
rewrites the files there on each build when the package was upgraded, and links them with
docs-relative paths and integrity hashes, which Zensical rewrites per page like it rewrites `src`.
Local documents are found under `docs/` for the search index (page-relative paths are matched by
their unique suffix; use a `/`-prefixed path when two files share one), and a document that is not
found is reported as a warning at build time.

Listing both `plugins: [asyncapi-viewer]` and `markdown_extensions: [asyncapi_viewer]` lets one
file build under MkDocs and Zensical: under MkDocs the plugin takes over path resolution and serves
the viewer from the built site instead of writing under `docs/`. This site is built that way, and a
Zensical build runs in CI.

To serve the viewer from somewhere else under Zensical, set `viewer_js` and `viewer_theme` in the
extension config (docs-relative paths or URLs) and the publishing step is skipped.

## Plain Python-Markdown

```python
import markdown

html = markdown.markdown(text, extensions=["asyncapi_viewer"])
```

Extension options, passed as `extension_configs={"asyncapi_viewer": {...}}`:

| Option | Default | Description |
|---|---|---|
| `viewer_js`, `viewer_theme` | jsDelivr URLs of the packaged version | Where the page loads the viewer and the theme from |
| `viewer_js_integrity`, `viewer_theme_integrity` | matching SRI hashes | Empty string omits the attribute |
| `load_assets` | `True` | Emit the module script and the theme link with the first element on a page |
| `docs_dir` | `auto` | The documentation directory for hosts without plugin hooks: `auto` uses `./docs` when it exists. Local documents are found under it for the search index and reported when missing, and the viewer is published under it when the two URLs are `auto`. `''` disables |
| `assets_dir` | `assets/asyncapi-viewer` | Where under `docs_dir` the viewer is published |
| `search_fallback` | `True` | Emit the hidden search index for local documents |
| `file_resolver` | `docs_dir` lookup, else the working directory | Callable mapping `src` to a readable local path for the search index, or `None`; never called for URLs |
| `url_resolver` | identity | Callable mapping `src` (and relative asset URLs) to what the browser fetches |
| `warn` | `logging` | Callable receiving warning messages |
| `renderer` | `viewer` | `legacy` keeps the 1.x React-based output |

Without a `url_resolver`, `src` is emitted as written and the browser resolves it relative to the
page URL. Use site-root-relative or absolute URLs, or supply a resolver, when pages live in
subdirectories. With a docs directory the viewer is published under it and linked docs-relative;
without one the defaults load it from jsDelivr. To serve it from elsewhere, copy the files with
`python -m asyncapi_viewer copy-assets` and set the two URLs.

## Material for MkDocs

Material's `navigation.instant` swaps page content without a full reload. The viewer is a custom
element, so the elements Material swaps in upgrade and render on their own; nothing subscribes to
Material's `document$`. Theme changes are followed live through Material's colour scheme attribute.

## Web pages, React and other frameworks

The viewer is a standard web component, published to npm as
[`asyncapi-viewer`](https://www.npmjs.com/package/asyncapi-viewer) with the same version as the
Python package. Import it once and use the element anywhere:

```sh
npm install asyncapi-viewer
```

```tsx
import 'asyncapi-viewer';                              // defines <asyncapi-viewer>
import 'asyncapi-viewer/theme/asyncapi-theme.css';     // optional
import type {} from 'asyncapi-viewer/react';           // JSX typing, TypeScript only

export function ApiDocs() {
  return (
    <asyncapi-viewer
      src="/asyncapi.yaml"
      sidebar
      theme="dark"
      onasyncapi-load={(e) => console.log(e.detail.model.title)}
      onasyncapi-error={(e) => console.warn(e.detail.error.message)}
    ></asyncapi-viewer>
  );
}
```

Attributes are the kebab-case names from [Attributes](attributes.md). React 19 passes `true` as a
bare attribute and removes `false`; every attribute can change at any time. A document held in
memory (from an editor or an API) can be shown through a Blob URL:
`URL.createObjectURL(new Blob([JSON.stringify(doc)], { type: 'application/json' }))`. Internal
`$ref`s resolve; relative file references need a real URL. The Playwright suite runs a React 19
app that installs the npm package, so this path is tested on every change.

With server-side rendering (Next.js and similar), import the package only in the browser, for
example in a `'use client'` component's effect: defining a custom element needs `window`.

**Events.** Each finished load fires one event on the element; both bubble and cross shadow roots,
and fire after the result has rendered:

| Event | `detail` |
|---|---|
| `asyncapi-load` | `url`, `specVersion`, `specMajor` (2 or 3), `model` (the normalised document), `problems` |
| `asyncapi-error` | `url`, `error` with `kind` (`network`, `http`, `empty`, `parse`, `not-object`, `unsupported`), `message` and, for HTTP, `status` |

In plain JavaScript: `viewer.addEventListener('asyncapi-load', (e) => ...)`. A new `src` fires
again; changing other attributes does not. A listener added late can read `viewer.model` and
`viewer.loadResult` instead.

**TypeScript.** The package ships its types: `AsyncAPIViewerElement`, `AsyncAPIViewerAttributes`,
the event types and the model. `document.querySelector('asyncapi-viewer')` and
`addEventListener('asyncapi-load', ...)` are typed without extra setup;
`asyncapi-viewer/react` adds the element to React's JSX.

Without a bundler, load it from jsDelivr with a module script (see [Configuration](configuration.md)).

## How it works

Each element or fence becomes an `<asyncapi-viewer>` element with validated, kebab-case attributes;
the first on a page also emits the module script and the theme link. In the browser the element
fetches the document, resolves `$ref`s (internal, relative files and absolute URLs), normalises
AsyncAPI 2 and 3 into one model and renders it into a shadow root, so page styles and viewer styles
never collide. Problems found on the way are listed in the viewer's Problems panel rather than
failing silently.
