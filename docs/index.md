# asyncapi-viewer

Render [AsyncAPI](https://www.asyncapi.com/) documents with one element, in your documentation
site or in any web page:

```html
<asyncapi-viewer src="asyncapi.yaml"></asyncapi-viewer>
```

![The viewer showing an AsyncAPI 3 document: sidebar with search and operations, an operation with its payload tree, and a generated example beside it](assets/screenshots/viewer-light.png#only-light)
![The viewer showing an AsyncAPI 3 document: sidebar with search and operations, an operation with its payload tree, and a generated example beside it](assets/screenshots/viewer-dark.png#only-dark)

The viewer is a web component that renders AsyncAPI 2 and 3 documents, JSON or YAML, in the
browser. It comes two ways, with the same version number:

<div class="grid cards" markdown>

-   **For python-based docs sites**

    ---

    `pip install asyncapi-viewer`

    a Python-Markdown extension with a plugin for
    [MkDocs](https://www.mkdocs.org/). Works under [Zensical](https://zensical.org/) and any other
    Python-Markdown host. The viewer is served from your own site, local documents are checked at
    build time and indexed for the site search.

    [Getting started](getting-started.md)

-   **For web pages and app-based doc sites**

    ---

    `npm install asyncapi-viewer`, or one script tag from jsDelivr. A standard custom element with
    TypeScript types, `asyncapi-load` and `asyncapi-error` events, and a tested React integration.

    [Web pages and React](web.md)

</div>

This site is built with the MkDocs plugin. See the [live demo](demo.md).

## What you get

- **Any AsyncAPI document.** AsyncAPI 2.x and 3.x, JSON or YAML, local file, URL or an in-memory
  object. `$ref`s to the same document, other files and URLs are resolved; traits are applied;
  payloads in JSON Schema or Avro become trees.
- **Operations you can read.** Direction badges, channel addresses with their parameters, payload
  and header trees, and example panels with generated examples when the document has none.
  Servers, messages, schemas, bindings and security are all there.
- **Built for docs columns.** The layout follows the width of its container, not the window: a
  sidebar with search and tag filters on wide screens, a drawer behind a menu button on narrow ones.
- **Light and dark.** Follows Material's colour scheme, the page's `data-theme` or the system
  setting, live. Two accent colours restyle it; see [Customising](customising.md).
- **Nothing fails silently.** A document that cannot be loaded shows why, in place. Problems found
  in a document are listed in a Problems panel. In MkDocs a missing local file fails
  `mkdocs build --strict`.
- **Safe to embed.** Renders into a shadow root, needs no inline script or style
  (`script-src 'self'; style-src 'self'` is enough) and renders descriptions with raw HTML disabled.
  See [Configuration](configuration.md#content-security-policy).
- **Accessible.** Keyboard navigation, focus management for links into the viewer, screen reader
  announcements for search, and axe checks in CI.

<figure markdown>
  ![The same viewer at phone width: the sidebar becomes a menu button](assets/screenshots/narrow-light.png#only-light){ width="280" }
  ![The same viewer at phone width: the sidebar becomes a menu button](assets/screenshots/narrow-dark.png#only-dark){ width="280" }
  <figcaption>In a narrow column the sidebar moves behind a menu button.</figcaption>
</figure>

## Where next

- [Getting started](getting-started.md): MkDocs, Zensical or plain Python-Markdown in a few lines.
- [Web pages and React](web.md): npm, a script tag, React and TypeScript, events.
- [Live demo](demo.md): AsyncAPI 2 and 3, Kafka with Avro, request and reply, a customised theme and an error.
- [Attributes](attributes.md): every option, the same in Markdown, HTML and JSX.
- [Configuration](configuration.md): plugin options, self-hosting, the CDN, Content Security Policy.
- [Customising](customising.md): colours, fonts, the theme file.
- [Other tools](other-tools.md): Zensical, plain Python-Markdown and Material in detail.
- [Migration](migration.md): from 1.x and from the older names `asyncapi-tag` and `mkdocs-asyncapi-tag-plugin`.

---

Built and maintained by [Weesho Lapara](https://weesholapara.com). Found it useful?
[Buy me a coffee](https://github.com/Weesho-Lapara/asyncapi-viewer?sponsor=1).
