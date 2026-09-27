# asyncapi-viewer

Render [AsyncAPI](https://www.asyncapi.com/) documents as interactive documentation. Made with [Claude](https://claude.com/claude-code).

<table>
<tr>
<th>In Markdown</th>
<th>In HTML</th>
</tr>
<tr>
<td>

````markdown
```asyncapi
src: events.yaml
sidebar: true
publishLabel: PUBLISH
```
````

</td>
<td>

```html
<asyncapi-viewer
  src="events.yaml"
  sidebar
  publish-label="PUBLISH"
></asyncapi-viewer>
```

</td>
</tr>
<tr>
<td>Python-Markdown, MkDocs, Zensical</td>
<td>Any web page, React, and Markdown pages too</td>
</tr>
</table>

Supports AsyncAPI 2 and 3, JSON and YAML.

[Documentation](https://weesho-lapara.github.io/asyncapi-viewer/) · [Live demo](https://weesho-lapara.github.io/asyncapi-viewer/demo/)

## Documentation sites

Install the Python package:

```bash
pip install asyncapi-viewer
```

### MkDocs

Add the plugin:

```yaml
plugins:
  - asyncapi-viewer
```

Then reference an AsyncAPI document:

```html
<asyncapi-viewer src="events.yaml" sidebar></asyncapi-viewer>
```

Or use the Markdown extension:

```yaml
markdown_extensions:
  - asyncapi_viewer
```

````markdown
```asyncapi
src: events.yaml
sidebar: true
```
````

The plugin:

- serves the viewer from your site
- validates local documents at build time
- indexes local documents for site search
- fails `mkdocs build --strict` when a local document is missing

[Getting started](https://weesho-lapara.github.io/asyncapi-viewer/getting-started/)

## Web pages and applications

Install from npm:

```bash
npm install asyncapi-viewer
```

Import the element:

```js
import 'asyncapi-viewer';
```

Then use it in HTML:

```html
<asyncapi-viewer
  src="/asyncapi.yaml"
  sidebar
></asyncapi-viewer>
```

A CDN build is also available from jsDelivr.

The package includes:

- TypeScript types
- `asyncapi-load` and `asyncapi-error` events
- React integration

[Web pages and React](https://weesho-lapara.github.io/asyncapi-viewer/getting-started/)

## Features

- AsyncAPI 2 and 3
- JSON and YAML
- Local files, URLs, and in-memory documents
- `$ref` resolution
- JSON Schema and Avro payload trees
- Generated examples
- Search and tag filtering
- Responsive layout
- Light and dark themes
- Custom themes and labels
- Servers, messages, schemas, bindings, and security
- Accessible keyboard navigation
- Shadow DOM isolation
- No inline scripts or styles

## Personalisation

Viewer options are available as HTML attributes and work consistently in Markdown and JSX.
[Attributes](https://weesho-lapara.github.io/asyncapi-viewer/attributes/)

Plugin and extension configuration:
[Configuration](https://weesho-lapara.github.io/asyncapi-viewer/configuration/)

Custom themes:
[Customising](https://weesho-lapara.github.io/asyncapi-viewer/customising/)

## Migration

The project was previously published as:

- `asyncapi-tag`
- `mkdocs-asyncapi-tag-plugin`

See the [migration guide](https://weesho-lapara.github.io/asyncapi-viewer/migration/).

## Development

Create a virtual environment and install the test dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"
```

Build the viewer:

```bash
cd viewer
npm ci
npm run build
cd ..
python scripts/sync_viewer.py
```

Run the tests:

```bash
pytest
```

Build the documentation:

```bash
pip install -e ".[docs]"
mkdocs build --strict
```

The viewer is in `viewer/` and uses Lit, TypeScript, Vite, Vitest, and Playwright.

## License

MIT
