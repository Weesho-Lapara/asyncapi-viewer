# Web pages and React

The viewer is a standard web component, published to npm as
[`asyncapi-viewer`](https://www.npmjs.com/package/asyncapi-viewer) with the same version as the
Python package. It needs no framework and no build step, and it knows nothing about MkDocs.

## Install

=== "npm"

    ```sh
    npm install asyncapi-viewer
    ```

    ```js
    import 'asyncapi-viewer';  // defines <asyncapi-viewer>
    // Optional: the theme file with the two accent colours.
    import 'asyncapi-viewer/theme/asyncapi-theme.css';
    ```

    Importing the module once, anywhere, defines the element for the whole page. Importing it
    again is harmless.

=== "Script tag"

    ```html
    <script type="module" src="https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.1.1/dist/asyncapi-viewer.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/asyncapi-viewer@2.1.1/theme/asyncapi-theme.css">
    ```

    For pages that cannot load modules, `dist/asyncapi-viewer.iife.js` works with a plain
    `<script>`. Pin the version as above rather than using `@latest`.

Then use the element:

```html
<asyncapi-viewer src="/specs/asyncapi.yaml" sidebar></asyncapi-viewer>
```

Every [attribute](attributes.md) works the same in HTML, JSX and templates, and can change at any
time: the viewer updates in place and reloads only when `src` changes.

## React

React 19 supports custom elements fully: props become attributes (`true` a bare attribute, `false`
none, `className` becomes `class`) and `on<event-name>` props become event listeners. The
Playwright suite runs a React 19 app that installs the npm package, so this is tested on every
change.

```tsx title="ApiDocs.tsx"
import { useState } from 'react';
import 'asyncapi-viewer';
import type {} from 'asyncapi-viewer/react';   // JSX typing, TypeScript only
import type { AsyncAPILoadEvent } from 'asyncapi-viewer';

export function ApiDocs({ spec }: { spec: string }) {
  const [summary, setSummary] = useState('Loading…');

  const onLoad = (e: AsyncAPILoadEvent) => {
    const { model, problems } = e.detail;
    setSummary(`${model.title}: ${model.operations.length} operations, ${problems.length} problems`);
  };

  return (
    <>
      <p>{summary}</p>
      <asyncapi-viewer
        src={spec}
        sidebar
        theme="auto"
        send-label="PUBLISH"
        onasyncapi-load={onLoad}
        onasyncapi-error={(e) => setSummary(e.detail.error.message)}
      ></asyncapi-viewer>
    </>
  );
}
```

Attribute names in JSX are the kebab-case ones (`send-label`, `theme-toggle`). With the
`asyncapi-viewer/react` import, TypeScript checks them: an unknown attribute or `theme="sepia"` is
a compile error, and the event handlers receive typed events.

**React 18** passes custom element props as strings and does not attach `on…` listeners. Write
booleans as strings (`sidebar=""` or `sidebar="true"`) and add listeners through a ref:

```tsx
const ref = useRef<HTMLElement>(null);
useEffect(() => {
  const el = ref.current;
  const onLoad = (e: Event) => console.log((e as AsyncAPILoadEvent).detail.model.title);
  el?.addEventListener('asyncapi-load', onLoad);
  return () => el?.removeEventListener('asyncapi-load', onLoad);
}, []);
return <asyncapi-viewer ref={ref} src={spec} sidebar=""></asyncapi-viewer>;
```

React 18 is not covered by the test suite.

### Next.js and other server rendering

Defining a custom element needs the browser, so import the package on the client only. The element
itself can be rendered on the server; it upgrades when the module loads.

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

This pattern is not covered by the test suite yet.

## Documents from memory

An editor, a generated specification or an API response can be shown without a file: turn it into
a Blob URL. Revoke the old URL when the document changes.

```js
const url = URL.createObjectURL(new Blob([JSON.stringify(doc)], { type: 'application/json' }));
viewer.setAttribute('src', url);
```

References inside the document (`#/components/...`) resolve. Relative file references do not,
since a Blob URL has no directory; use absolute URLs for those. The React test app does this with a
document held in component state.

## Events

Each finished load fires one event on the element. Both bubble, cross shadow roots, and fire after
the result has rendered, so a listener can already scroll to or measure the viewer.

| Event | `detail` |
|---|---|
| `asyncapi-load` | `url`, `specVersion` (e.g. `"3.0.0"`), `specMajor` (2 or 3), `model` (the normalised document: title, servers, operations, messages, schemas), `problems` |
| `asyncapi-error` | `url`, `error` with `kind` (`network`, `http`, `empty`, `parse`, `not-object`, `unsupported`), `message` and, for HTTP, `status` |

```js
viewer.addEventListener('asyncapi-load', (e) => console.log(e.detail.model.title));
viewer.addEventListener('asyncapi-error', (e) => console.warn(e.detail.error.message));
```

A new `src` fires again; changing any other attribute rebuilds the view without an event. The
element also exposes the latest state as read-only properties: `model`, `problems`, `loadResult`
and `options`, useful when a listener is added after the document has loaded.

## TypeScript

Types ship with the package:

- `AsyncAPIViewerElement`, `AsyncAPIViewerAttributes`, `AsyncAPILoadEvent`,
  `AsyncAPIErrorEvent`, and the model types (`Document`, `Operation`, `Message`, ...).
- `document.querySelector('asyncapi-viewer')` returns an `AsyncAPIViewerElement`, and
  `addEventListener('asyncapi-load', ...)` is typed, without any setup.
- `import type {} from 'asyncapi-viewer/react'` adds the element to React's JSX.

## Other frameworks

The element takes attributes and dispatches DOM events, which every framework can handle. These
snippets are not covered by the test suite.

=== "Vue"

    Tell the compiler the tag is a custom element, then bind as usual:

    ```js title="vite.config.js"
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag === 'asyncapi-viewer' } } })
    ```

    ```vue
    <asyncapi-viewer :src="spec" sidebar @asyncapi-load="onLoad"></asyncapi-viewer>
    ```

=== "Angular"

    Add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas`, then:

    ```html
    <asyncapi-viewer [attr.src]="spec" sidebar (asyncapi-load)="onLoad($event)"></asyncapi-viewer>
    ```

=== "Plain JavaScript"

    ```js
    const viewer = document.createElement('asyncapi-viewer');
    viewer.setAttribute('src', '/specs/asyncapi.yaml');
    viewer.addEventListener('asyncapi-load', (e) => console.log(e.detail.model.title));
    document.body.append(viewer);
    ```

## Styling and security

Everything on [Customising](customising.md) applies: set `--asyncapi-*` custom properties on the
element or load the theme file. The viewer loads no fonts and no third-party resources itself. It
needs no inline script or style, so a strict Content Security Policy only has to allow wherever the
viewer and your documents are served from (see
[Configuration](configuration.md#content-security-policy)).
