# Getting started

One viewer, set up for your stack. Pick your tool below; after that the element, its
[attributes](attributes.md) and its behaviour are the same everywhere.

## Set up

=== "MkDocs"

    ```sh
    pip install asyncapi-viewer
    ```

    ```yaml title="mkdocs.yml"
    plugins:
      - asyncapi-viewer
    ```

    The plugin resolves paths per page, serves the viewer from the built site with integrity
    hashes, indexes local documents for the site search, and turns a missing document or an
    invalid attribute into a MkDocs warning, so `mkdocs build --strict` fails instead of shipping a
    blank viewer.

=== "Zensical"

    ```sh
    pip install asyncapi-viewer
    python -m asyncapi_viewer copy-assets docs/assets/asyncapi-viewer
    ```

    ```yaml title="mkdocs.yml"
    markdown_extensions:
      - asyncapi_viewer
    ```

    [Zensical](https://zensical.org/) reads `mkdocs.yml` but runs no plugins, so the extension does
    the work on its own: it finds `docs/`, keeps the viewer copy there fresh, links it with paths
    Zensical rewrites per page, indexes local documents and warns when one is missing. The
    `copy-assets` step is needed once, because Zensical lists `docs/` before it renders. One
    `mkdocs.yml` can list both the plugin and the extension and build under either tool; details in
    [Configuration](configuration.md#zensical).

=== "Python-Markdown"

    ```sh
    pip install asyncapi-viewer
    ```

    ```python
    import markdown

    html = markdown.markdown(text, extensions=["asyncapi_viewer"])
    ```

    Any other tool built on Python-Markdown works the same way. Without a docs directory the
    viewer loads from jsDelivr at the packaged version, with integrity hashes. Options such as
    `docs_dir`, `url_resolver` and `search_fallback` are in
    [Configuration](configuration.md#extension-options).

=== "React"

    ```sh
    npm install asyncapi-viewer
    ```

    ```tsx title="main.tsx"
    import 'asyncapi-viewer';                       // defines <asyncapi-viewer>, once per app
    import type {} from 'asyncapi-viewer/react';    // JSX typing, TypeScript only
    ```

    React 19 passes JSX props to custom elements as attributes (`true` a bare attribute, `false`
    none) and `on<event-name>` props as event listeners. A React 19 app that installs the npm
    package is part of the test suite. For React 18 and Next.js, see
    [below](#react-18-and-server-rendering).

=== "HTML"

    ```html
    <script type="module" src="https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.1.1/dist/asyncapi-viewer.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.1.1/theme/asyncapi-theme.css">
    ```

    Or `npm install asyncapi-viewer` and `import 'asyncapi-viewer'` in your bundle. For pages that
    cannot load modules, `dist/asyncapi-viewer.iife.js` works with a plain `<script>`. Pin the
    version rather than using `@latest`. The theme stylesheet is optional.

=== "Vue, Angular"

    ```sh
    npm install asyncapi-viewer
    ```

    Import `asyncapi-viewer` once, then tell the framework the tag is a custom element. Vue:
    `compilerOptions.isCustomElement: (tag) => tag === 'asyncapi-viewer'` in the Vue plugin
    options. Angular: `CUSTOM_ELEMENTS_SCHEMA` in the component's `schemas`. Events bind as usual
    (`@asyncapi-load`, `(asyncapi-load)`). These two are not covered by the test suite.

## Add a document

=== "Markdown"

    Put the AsyncAPI file next to your pages and reference it. Paths are relative to the Markdown
    file, or to the docs directory when they start with `/`.

    ```markdown title="docs/api/events.md"
    <asyncapi-viewer src="events.yaml" sidebar></asyncapi-viewer>
    ```

    Or, without raw HTML, as a fenced block with the same names:

    ````markdown title="docs/api/events.md"
    ```asyncapi
    src: events.yaml
    sidebar: true
    ```
    ````

=== "HTML and JSX"

    ```html
    <asyncapi-viewer src="/specs/asyncapi.yaml" sidebar></asyncapi-viewer>
    ```

    ```tsx
    <asyncapi-viewer
      src="/specs/asyncapi.yaml"
      sidebar
      send-label="PUBLISH"
      onasyncapi-load={(e) => console.log(e.detail.model.title)}
    ></asyncapi-viewer>
    ```

    `src` is relative to the page. Attribute names in JSX are the kebab-case ones; with the
    `asyncapi-viewer/react` import, TypeScript rejects unknown names and values.

Absolute `http(s)://` URLs work everywhere; the browser fetches them, so the server must allow it
(CORS). Every attribute can change at any time: the viewer updates in place and reloads only when
`src` changes.

## In JavaScript apps

### Events

Each finished load fires one event on the element. Both bubble, cross shadow roots, and fire after
the result has rendered.

| Event | `detail` |
|---|---|
| `asyncapi-load` | `url`, `specVersion` (e.g. `"3.0.0"`), `specMajor` (2 or 3), `model` (the normalised document: title, servers, operations, messages, schemas), `problems` |
| `asyncapi-error` | `url`, `error` with `kind` (`network`, `http`, `empty`, `parse`, `not-object`, `unsupported`), `message` and, for HTTP, `status` |

```js
viewer.addEventListener('asyncapi-load', (e) => console.log(e.detail.model.title));
viewer.addEventListener('asyncapi-error', (e) => console.warn(e.detail.error.message));
```

A new `src` fires again; other attribute changes do not. The latest state is also on the element
as read-only properties: `model`, `problems`, `loadResult` and `options`.

### TypeScript

Types ship with the package: `AsyncAPIViewerElement`, `AsyncAPIViewerAttributes`,
`AsyncAPILoadEvent`, `AsyncAPIErrorEvent` and the model types. `querySelector('asyncapi-viewer')`
and `addEventListener('asyncapi-load', ...)` are typed without setup;
`import type {} from 'asyncapi-viewer/react'` adds the element to React's JSX.

### Documents from memory

An editor, a generated specification or an API response can be shown through a Blob URL. Revoke
the old URL when the document changes.

```js
const url = URL.createObjectURL(new Blob([JSON.stringify(doc)], { type: 'application/json' }));
viewer.setAttribute('src', url);
```

References inside the document (`#/components/...`) resolve; relative file references do not,
since a Blob URL has no directory.

### React 18 and server rendering

React 18 passes custom element props as strings and does not attach `on…` listeners: write
booleans as strings (`sidebar=""`) and add listeners through a ref and `addEventListener`.

With server rendering (Next.js and similar), import the package on the client only, since
defining a custom element needs the browser. The element itself can be rendered on the server:

```tsx title="app/api-docs/viewer.tsx"
'use client';
import { useEffect } from 'react';

export function Viewer({ src }: { src: string }) {
  useEffect(() => {
    import('asyncapi-viewer');
  }, []);
  return <asyncapi-viewer src={src} sidebar></asyncapi-viewer>;
}
```

React 18 and Next.js are not covered by the test suite yet.

## Next

- Choose what the viewer shows with [attributes](attributes.md).
- Match your site's colours in [Customising](customising.md).
- Self-host, use the CDN or tighten your Content Security Policy in [Configuration](configuration.md).
- Try the documents on the [live demo](demo.md).
