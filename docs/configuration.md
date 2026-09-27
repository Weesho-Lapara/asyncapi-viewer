# Configuration

## Plugin options

```yaml title="mkdocs.yml"
plugins:
  - asyncapi-viewer:
      load_assets: true              # emit the viewer script and theme with the first element on a page (default: true)
      search_fallback: true          # index local documents for the site search (default: true)
      viewer_js: auto                # 'auto' serves the packaged viewer from the site; or a URL or docs-relative path
      viewer_theme: auto             # same for the theme stylesheet
      viewer_js_integrity: auto      # 'auto' computes the hash for the served copy; '' omits the attribute
      viewer_theme_integrity: auto
      renderer: viewer               # 'legacy' keeps the 1.x React-based viewer (see Migration)
```

With the defaults the plugin publishes the viewer that ships with the package into the built site
under `assets/asyncapi-viewer/` (the ES module, an IIFE build and the theme) and emits, once per
page, a module script and a stylesheet link pointing at them with Subresource Integrity hashes.
Nothing is loaded from a third-party host.

## Self-hosting the viewer

The default already is self-hosting. Point the options elsewhere when you want a different copy,
for example one you customised. Plugin-level paths are relative to `docs/` and resolved per page
like `src` is:

```yaml title="mkdocs.yml"
plugins:
  - asyncapi-viewer:
      viewer_js: assets/viewer/asyncapi-viewer.js
      viewer_theme: assets/viewer/my-theme.css
      viewer_js_integrity: ''
      viewer_theme_integrity: ''
```

`python -m asyncapi_viewer copy-assets docs/assets/viewer` writes the three packaged files into a
directory and prints their hashes, which you can paste into the integrity options if you keep the
files unchanged. The same is available from Python as `asyncapi_viewer.assets.copy_assets(dest)`.

## Using a CDN

The package pins the version of the viewer it ships, and the same version is published to npm as
`asyncapi-viewer`. To load it from jsDelivr instead of your site:

```yaml title="mkdocs.yml"
plugins:
  - asyncapi-viewer:
      viewer_js: https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.0.0/dist/asyncapi-viewer.js
      viewer_theme: https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.0.0/theme/asyncapi-theme.css
      viewer_js_integrity: ''
      viewer_theme_integrity: ''
```

The hashes printed by `copy-assets` apply to the CDN copy of the same version too, so you can keep
integrity checking. Never use `@latest`: the build and the viewer share an options schema, and a
mismatched version can reject attributes the build accepted.

## Loading assets yourself

Set `load_assets: false` and add the files through `extra_javascript` and `extra_css`. The script
must be loaded as a module (`type: module` in the `extra_javascript` entry) or use the IIFE build,
`asyncapi-viewer.iife.js`, which is also in the package and works with a plain script tag. There is
no runner script any more: the element renders itself.

## Search

The viewer renders into a shadow root, so a search indexer that reads the built HTML would never
see operation names. When `src` is a local file, the build reads it and puts a hidden list of
operation headings, channel addresses and message names inside the element; the viewer removes it
when it renders. MkDocs' search plugin indexes that list. Remote documents are never fetched at
build time. YAML needs PyYAML, which MkDocs already depends on.

## Content Security Policy

With the defaults, pages need only:

- `script-src 'self'` and `style-src 'self'`: no inline script or style is emitted, and the viewer
  applies its styles through constructed stylesheets.
- `connect-src` for wherever your AsyncAPI documents live (`'self'` for files under `docs/`) and
  for any external `$ref` they contain.
- `img-src` for a logo, if you set one in the theme.

Loading the viewer from a CDN adds that host to `script-src` and `style-src`.

## Security notes

- The viewer version is pinned: it is the one packaged with the wheel, published under the same
  version number.
- Nothing from your Markdown is interpolated into JavaScript. Attribute values are validated
  against the viewer's schema and HTML-escaped onto the element.
- The build never fetches documents; the browser does, from the URL the plugin resolved. The
  search index reads local files only.
- Descriptions are rendered as Markdown with raw HTML disabled, so a document cannot inject markup
  into the page.
