# asyncapi-viewer

Render [AsyncAPI](https://www.asyncapi.com/) documents with one element:

```html
<asyncapi-viewer src="asyncapi.yaml"></asyncapi-viewer>
```

![The viewer showing an AsyncAPI 3 document: sidebar with search and operations, an operation with its payload tree, and a generated example beside it](assets/screenshots/viewer-light.png#only-light)
![The viewer showing an AsyncAPI 3 document: sidebar with search and operations, an operation with its payload tree, and a generated example beside it](assets/screenshots/viewer-dark.png#only-dark)

asyncapi-viewer is a web component for rendering AsyncAPI 2 and 3 documents in the browser. Documents can be JSON or YAML and can come from a local file, URL, or in-memory object.

<div class="grid cards" markdown>

-   **For python-based docs sites**

    ---
    `pip install asyncapi-viewer`

    A Python-Markdown extension with a plugin for [MkDocs](https://www.mkdocs.org/).

    It also works with [Zensical](https://zensical.org/) and other Python-Markdown hosts. The viewer is served from your site, local documents are checked at build time, and their contents are indexed for site search.

-   **For web pages and app-based doc sites**

    ---

    `npm install asyncapi-viewer`
    
    Or load it directly from jsDelivr with a script tag. 
    
    The package provides a standard custom element with TypeScript types, `asyncapi-load` and `asyncapi-error` events, and a tested React integration.

</div>

This documentation site uses the MkDocs plugin. See the [live demo](demo.md).

## What you get

- **Any AsyncAPI document.** 
    - AsyncAPI 2.x and 3.x, JSON or YAML, local file, URL or an in-memory object. 
    - `$ref`s to the document, other files, and URLs are resolved.
    - Payloads in JSON Schema or Avro become trees.
- **Light and dark.** 
    - Follows Material's colour scheme, the page's `data-theme` or the system setting, live. 
    - Two accent colours restyle it; see [Customising](customising.md).
- **Nothing fails silently.** 
    - A document that cannot be loaded shows why, in place. 
    - Problems found in a document are listed in a Problems panel. 
    - In MkDocs a missing local file fails `mkdocs build --strict`.
- **Visible errors**. 
    - Load failures are shown in the viewer. 
    - Problems found in a document are listed in a Problems panel. 
    - With MkDocs, missing local files fail mkdocs build --strict.
- **Safe to embed.** 
    - Renders into a shadow root and descriptions do not allow raw HTML.
    - No inline scripts or styles are required (`script-src 'self'; style-src 'self'` is enough)
- **Accessible.** 
    - Keyboard navigation, focus management for links into the viewer, screen reader
    announcements for search, and axe checks in CI.

<figure markdown>
  ![The same viewer at phone width: the sidebar becomes a menu button](assets/screenshots/narrow-light.png#only-light){ width="280" }
  ![The same viewer at phone width: the sidebar becomes a menu button](assets/screenshots/narrow-dark.png#only-dark){ width="280" }
  <figcaption>In a narrow column the sidebar moves behind a menu button.</figcaption>
</figure>

## Where next

- [Getting started](getting-started.md)
- [Live demo](demo.md)
- [Attributes](attributes.md)
- [Configuration](configuration.md)
- [Customising](customising.md)
- [Migration](migration.md)

---

Found it useful? [Buy me a coffee](https://github.com/Weesho-Lapara/asyncapi-viewer?sponsor=1).
