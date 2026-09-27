# asyncapi-viewer

Render [AsyncAPI](https://www.asyncapi.com/) documents with one element, in your documentation site
or in any web page:

```html
<asyncapi-viewer src="asyncapi.yaml"></asyncapi-viewer>
```

![The viewer showing an AsyncAPI 3 document with its sidebar, an operation, its payload tree and an example](https://raw.githubusercontent.com/Weesho-Lapara/asyncapi-viewer/main/docs/assets/screenshots/viewer-light.png)

The viewer is a web component that renders AsyncAPI 2 and 3 documents, JSON or YAML, in the
browser: payload trees and example panels, servers, messages and schemas, a searchable sidebar,
light and dark modes that follow the page, and a layout that fits a documentation column. It needs
no inline script or style and renders into its own shadow root.

It comes as a Python package for documentation sites (a Python-Markdown extension with a plugin for
MkDocs) and as an npm package for everything else, with one version number.

**Documentation and live demo:** https://weesho-lapara.github.io/asyncapi-viewer/

> Formerly published as `asyncapi-tag` (and before that `mkdocs-asyncapi-tag-plugin`). See [Migrating](#migrating-from-older-names).

## Documentation sites

```sh
pip install asyncapi-viewer
```

**MkDocs:** add the plugin. It serves the viewer from your site with integrity hashes, indexes local
documents for the site search, and makes `mkdocs build --strict` fail on a missing document.

```yaml
# mkdocs.yml
plugins:
  - asyncapi-viewer
```

**Zensical:** it runs no plugins, so list the extension and put the viewer under `docs/` once.

```sh
python -m asyncapi_viewer copy-assets docs/assets/asyncapi-viewer
```

```yaml
# mkdocs.yml
markdown_extensions:
  - asyncapi_viewer
```

**Any Python-Markdown:** `markdown.markdown(text, extensions=["asyncapi_viewer"])`.

Then reference a document from a page, with a path relative to the page:

```markdown
<asyncapi-viewer src="events.yaml" sidebar></asyncapi-viewer>
```

or as a fenced block using the same names:

````markdown
```asyncapi
src: events.yaml
sidebar: true
```
````

Guide: https://weesho-lapara.github.io/asyncapi-viewer/getting-started/

## Web pages and apps

```sh
npm install asyncapi-viewer
```

```tsx
import 'asyncapi-viewer';
import type {} from 'asyncapi-viewer/react';   // JSX typing for React

<asyncapi-viewer src="/asyncapi.yaml" sidebar onasyncapi-load={(e) => console.log(e.detail.model.title)} />
```

Or one script tag from jsDelivr, pinned to a version. TypeScript types ship with the package, the
element fires `asyncapi-load` and `asyncapi-error` events, and a React 19 app is part of the test
suite. Guide: https://weesho-lapara.github.io/asyncapi-viewer/getting-started/

## Options

Every option is an attribute, the same in Markdown, HTML and JSX: sections to show, the sidebar and
its grouping, badge labels, the theme and a theme toggle. Reference:
https://weesho-lapara.github.io/asyncapi-viewer/attributes/. Plugin and extension options (where the
viewer is served from, integrity, search index) are on
https://weesho-lapara.github.io/asyncapi-viewer/configuration/.

## Migrating from older names

**From `asyncapi-tag` (1.0 and 1.1).** Replace `asyncapi-tag` with `asyncapi-viewer` in your
requirements. The plugin id `asyncapi-tag`, the extension name `asyncapi_tag` and the
`<asyncapi-tag>` element are still accepted until 3.0, and `asyncapi-tag` 1.2.0 on PyPI is a shim
that only depends on this package.

**From 1.x.** Pages and configuration keep working; `renderer: legacy` brings the 1.x React-based
output back for one major version. From `mkdocs-asyncapi-tag-plugin` (0.x), also remove the
`asyncapi_file` option. Details: https://weesho-lapara.github.io/asyncapi-viewer/migration/

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
release procedure, and [ROADMAP.md](https://github.com/Weesho-Lapara/asyncapi-viewer/blob/main/ROADMAP.md)
for plans.

## License

MIT
