# Other tools

`asyncapi-viewer` is a Python-Markdown extension first. The MkDocs plugin is a thin layer that
resolves document paths per page, publishes the viewer into the site and reports problems through
the MkDocs logger.

## Zensical

[Zensical](https://zensical.org/) reads `mkdocs.yml` but does not run MkDocs plugins. It does honour
`markdown_extensions`, so the extension does the rendering there, and since there is no plugin to
publish the viewer, copy it under `docs/` and point the extension at the copy:

```sh
python -m asyncapi_viewer copy-assets docs/assets/asyncapi-viewer
```

```yaml title="mkdocs.yml"
markdown_extensions:
  - asyncapi_viewer:
      viewer_js: /assets/asyncapi-viewer/asyncapi-viewer.js
      viewer_theme: /assets/asyncapi-viewer/asyncapi-theme.css
      viewer_js_integrity: ''
      viewer_theme_integrity: ''
```

Relative `src` paths work: Zensical rewrites them per page like it does for links. Listing both
`plugins: [asyncapi-viewer]` and `markdown_extensions: [asyncapi_viewer]` lets one file build under
MkDocs and Zensical: the plugin replaces the extension settings with the served copy and its hashes
when it runs, and Zensical uses them as written. This site is built that way, and a Zensical build
runs in CI.

The differences from MkDocs: a missing document is not reported at build time (the viewer shows
the error in place instead), the asset paths above are site-root-absolute so they assume the site
is served from the domain root, and the search index is not produced, because the extension cannot
tell where a page-relative `src` lives without the plugin.

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
| `search_fallback` | `True` | Emit the hidden search index for local documents |
| `file_resolver` | working directory | Callable mapping `src` to a readable local path for the search index, or `None`; never called for URLs |
| `url_resolver` | identity | Callable mapping `src` (and relative asset URLs) to what the browser fetches |
| `warn` | `logging` | Callable receiving warning messages |
| `renderer` | `viewer` | `legacy` keeps the 1.x React-based output |

Without a `url_resolver`, `src` is emitted as written and the browser resolves it relative to the
page URL. Use site-root-relative or absolute URLs, or supply a resolver, when pages live in
subdirectories. Without the plugin the defaults load the viewer from jsDelivr; to serve it yourself,
copy the files with `python -m asyncapi_viewer copy-assets` and set the two URLs.

## Material for MkDocs

Material's `navigation.instant` swaps page content without a full reload. The viewer is a custom
element, so the elements Material swaps in upgrade and render on their own; nothing subscribes to
Material's `document$`. Theme changes are followed live through Material's colour scheme attribute.

## How it works

Each element or fence becomes an `<asyncapi-viewer>` element with validated, kebab-case attributes;
the first on a page also emits the module script and the theme link. In the browser the element
fetches the document, resolves `$ref`s (internal, relative files and absolute URLs), normalises
AsyncAPI 2 and 3 into one model and renders it into a shadow root, so page styles and viewer styles
never collide. Problems found on the way are listed in the viewer's Problems panel rather than
failing silently.
