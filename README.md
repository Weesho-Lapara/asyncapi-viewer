# asyncapi-viewer

Render [AsyncAPI](https://www.asyncapi.com/) documents inside Markdown pages with a single element:

```html
<asyncapi-viewer src="asyncapi.yaml"></asyncapi-viewer>
```

`asyncapi-viewer` is a [Python-Markdown](https://python-markdown.github.io/) extension, so it works in
any tool built on Python-Markdown. It ships with a plugin for [MkDocs](https://www.mkdocs.org/)
that resolves document paths the same way MkDocs resolves links, and with the viewer itself: a web
component that renders AsyncAPI 2 and 3 documents, JSON or YAML, in the browser. It is served from
your own site with Subresource Integrity hashes, needs no inline script or style, follows the page's
light or dark mode, and fits a documentation column.

**Documentation and live demo:** https://weesho-lapara.github.io/asyncapi-viewer/

> Formerly published as `asyncapi-tag` (and before that `mkdocs-asyncapi-tag-plugin`). See [Migrating](#migrating-from-older-names).

## MkDocs

```sh
pip install asyncapi-viewer
```

```yaml
# mkdocs.yml
plugins:
  - asyncapi-viewer
```

Put your AsyncAPI file anywhere under `docs/` and reference it from a page. Paths are relative to
the Markdown file, or relative to `docs/` when they start with `/`. Absolute `http(s)://` URLs are
passed through unchanged.

```markdown
<!-- docs/api/events.md -->
# Events API

<asyncapi-viewer src="events.yaml" sidebar="false"></asyncapi-viewer>
```

Prefer plain Markdown over raw HTML? The same thing as a fenced block, with the attribute names as
`key: value` lines (the path may also follow the language):

````markdown
```asyncapi
src: events.yaml
sidebar: false
```
````

A missing document or an invalid attribute is reported as a MkDocs warning, so `mkdocs build
--strict` fails instead of shipping a broken page.

### Plugin options

```yaml
plugins:
  - asyncapi-viewer:
      load_assets: true              # emit the viewer script and theme with the first element on a page
      search_fallback: true          # index local documents for the site search
      viewer_js: auto                # 'auto' serves the packaged viewer from the site; or a URL or docs-relative path
      viewer_theme: auto             # same for the theme stylesheet
      viewer_js_integrity: auto      # 'auto' computes the hash of the served copy; '' omits it
      viewer_theme_integrity: auto
      renderer: viewer               # 'legacy' keeps the 1.x React-based viewer for one major version
```

By default the plugin publishes the packaged viewer into the site under `assets/asyncapi-viewer/`
and links it with integrity hashes; no third-party CDN is involved. Point `viewer_js` and
`viewer_theme` at a URL or a docs-relative path to use another copy (for example a customised
theme), or set `load_assets: false` and load the module script and stylesheet yourself.

## Zensical

[Zensical](https://zensical.org/) reads `mkdocs.yml` but does not run MkDocs plugins. The extension
works on its own there: list it, and put the viewer under `docs/` once (Zensical lists files before
it renders pages; commit the copy or run the command in CI). From then on the extension keeps the
copy fresh and links it with docs-relative paths that Zensical rewrites per page, as it does for
`src`. Local documents are indexed for search and reported when missing.

```sh
python -m asyncapi_viewer copy-assets docs/assets/asyncapi-viewer
```

```yaml
markdown_extensions:
  - asyncapi_viewer
```

Listing both the plugin and the extension lets one `mkdocs.yml` build under MkDocs and Zensical.
A Zensical build of this project's docs runs in CI.

## Plain Python-Markdown

```python
import markdown

html = markdown.markdown(text, extensions=["asyncapi_viewer"])
```

Extension options (pass them as `extension_configs={"asyncapi_viewer": {...}}`):

| Option | Default | Description |
|---|---|---|
| `viewer_js`, `viewer_theme` | jsDelivr URLs of the packaged version | Where the page loads the viewer and the theme from |
| `viewer_js_integrity`, `viewer_theme_integrity` | matching SRI hashes | Empty string omits the attribute |
| `load_assets` | `True` | Emit the module script and the theme link with the first element on a page |
| `docs_dir` | `auto` (`./docs` when it exists) | Hosts without plugin hooks: find local documents under it, warn when missing, publish the viewer under `assets_dir` inside it |
| `search_fallback` | `True` | Emit a hidden search index for local documents (needs PyYAML for YAML: `pip install "asyncapi-viewer[yaml]"`) |
| `file_resolver` | `docs_dir` lookup, else the working directory | Callable mapping `src` to a readable local path for the index, or `None`; never called for URLs |
| `url_resolver` | identity | Callable mapping `src` (and relative asset URLs) to what the browser fetches |
| `warn` | `logging` | Callable receiving warning messages |
| `renderer` | `viewer` | `legacy` keeps the 1.x output |

## Attributes

The same names work as element attributes and as `key: value` lines in an `asyncapi` fence.
Only `src` is required. Attribute names are case-insensitive. Boolean attributes accept
`true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off`; a bare attribute means `true`.

| Attribute | Values | Default | Effect |
|---|---|---|---|
| `src` | path or URL | required | The AsyncAPI document (JSON or YAML) |
| `id` | string | `asyncapi-viewer-N` | Element id; also the prefix of every anchor inside the viewer |
| `sidebar` | boolean | `false` | Show the navigation sidebar (a column from 1100px of viewer width, a drawer below) |
| `info`, `servers`, `operations`, `messages`, `schemas`, `errors` | boolean | `true` | Show or hide each section |
| `showMessageExamples` | boolean | `false` | Show example panels in the Messages section |
| `messageExamples` | boolean | `true` | Example panels start expanded |
| `showServers` | `byDefault`, `bySpecTags`, `byServersTags` | `byDefault` | List servers in the sidebar, grouped |
| `showOperations` | `byDefault`, `bySpecTags`, `byOperationsTags` | `byDefault` | Sidebar grouping for operations |
| `useChannelAddressAsIdentifier` | boolean | `false` | AsyncAPI 3: head operations with the channel address |
| `publishLabel`, `subscribeLabel` | string | `PUB`, `SUB` | Badge text for AsyncAPI 2 operations |
| `sendLabel`, `receiveLabel`, `requestLabel`, `replyLabel` | string | `SEND`, `RECEIVE`, `REQUEST`, `REPLY` | Badge text for AsyncAPI 3 operations |
| `theme` | `auto`, `light`, `dark` | `auto` | `auto` follows the page (Material scheme, `html[data-theme]`, system preference) |
| `themeToggle` | boolean | `false` | A light/dark toggle in the viewer header |
| `searchKeepSections` | boolean | `false` | Keep section links visible during a sidebar search |
| `parserOptions` | JSON object | `{"applyTraits": true}` | Only `applyTraits` is honoured |
| `schemaID` | string | | Deprecated: warns once, does nothing |

Attributes are validated against the schema the viewer ships, so the build and the browser agree.
Kebab-case spellings (`send-label`) work too. Full reference with examples:
https://weesho-lapara.github.io/asyncapi-viewer/attributes/

## How it works

Each element or fence becomes an `<asyncapi-viewer>` element with validated, HTML-escaped
attributes; the first on a page also emits the module script and the theme link. In the browser the
element fetches the document, resolves `$ref`s, normalises AsyncAPI 2 and 3 into one model and
renders it into a shadow root. Problems are listed in the viewer's Problems panel rather than
failing silently. No content from the Markdown source is interpolated into JavaScript.

For local documents the build also emits a hidden list of operation headings, channel addresses and
message names inside the element, so a site search that reads the built HTML finds them; the viewer
removes it on render. The build never fetches remote documents.

Elements inside fenced or indented code blocks and inline code spans are left alone, and an
`asyncapi` fence nested in a longer fence stays code, so you can document the syntax.

Material for MkDocs users with `navigation.instant` enabled are covered: the element is a custom
element, so the content Material swaps in renders on its own.

## Migrating from older names

**From `asyncapi-tag` (1.0 and 1.1).** Replace `asyncapi-tag` with `asyncapi-viewer` in your
requirements. Nothing else has to change: the plugin id `asyncapi-tag`, the extension name
`asyncapi_tag` and the `<asyncapi-tag>` element are still accepted, and `asyncapi-tag` 1.2.0 on PyPI
is a shim that only depends on this package. When convenient, switch to `asyncapi-viewer`,
`asyncapi_viewer` and `<asyncapi-viewer>`; the old names will be removed in 3.0. Default container
ids changed from `asyncapi-tag-N` to `asyncapi-viewer-N`; set `id` if you link to them.

**From 1.x.** Pages and configuration keep working. The React-based viewer is replaced by the
packaged one, served from the site; `viewer_css` is a deprecated alias of `viewer_theme`,
`embed_css` and `schemaID` do nothing, and `renderer: legacy` brings the 1.x output back for one
major version. Details: https://weesho-lapara.github.io/asyncapi-viewer/migration/

**From `mkdocs-asyncapi-tag-plugin` (0.x).** Also remove the `asyncapi_file` option (MkDocs copies
non-Markdown files itself), use page-relative paths in `src`, and check pages that set string
attributes such as `publishLabel`, which earlier versions silently discarded.

## Customising

Two colours in a stylesheet loaded after the theme, or any of the design tokens; fonts follow
Swagger UI's and are loaded by the page, never by the viewer:

```css
asyncapi-viewer {
  --asyncapi-primary: #0F766E;
  --asyncapi-secondary: #9F1239;
}
```

See https://weesho-lapara.github.io/asyncapi-viewer/customising/.

## Development

```sh
python -m venv .venv && source .venv/bin/activate
pip install -e ".[test]"
cd viewer && npm ci && npm run build && cd ..      # the viewer (Node 22)
python scripts/sync_viewer.py                     # copy it into the package
pytest
```

The viewer lives in `viewer/` (Lit, TypeScript, Vite, Vitest, Playwright). Build the docs site with
`pip install -e ".[docs]" && mkdocs build --strict`. See `AGENTS.md` for the repository layout and
release procedure.

## Roadmap

Plans and evaluations of other ecosystems (Docusaurus, Zensical, MkDocs 2.0) are in
[ROADMAP.md](https://github.com/Weesho-Lapara/asyncapi-viewer/blob/main/ROADMAP.md).

## License

MIT
