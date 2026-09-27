# asyncapi-viewer

Render [AsyncAPI](https://www.asyncapi.com/) documents inside your Markdown pages with one element:

```html
<asyncapi-viewer src="asyncapi.yaml"></asyncapi-viewer>
```

`asyncapi-viewer` is a [Python-Markdown](https://python-markdown.github.io/) extension, so it works in
any tool built on Python-Markdown: [MkDocs](https://www.mkdocs.org/) (with the bundled plugin),
[Zensical](https://zensical.org/), or plain `markdown.markdown()`. The element is a web component
that ships with the package and renders AsyncAPI 2 and 3 documents, JSON or YAML, in the browser:
no CDN, no inline scripts, dark mode, and a layout that fits a documentation column.

This site is built with the plugin. See the [live demo](demo.md).

## Install

```sh
pip install asyncapi-viewer
```

## Tool support

`asyncapi-viewer` works wherever Python-Markdown runs. The element and the fence are the same in
every host; what differs is one line of setup.

=== "MkDocs"

    The bundled plugin resolves paths per page, serves the viewer from the built site with
    integrity hashes, indexes local documents for the site search, and turns a missing document or
    an invalid attribute into a MkDocs warning, so `mkdocs build --strict` fails instead of shipping
    a blank viewer.

    ```yaml title="mkdocs.yml"
    plugins:
      - asyncapi-viewer
    ```

=== "Zensical"

    [Zensical](https://zensical.org/) reads `mkdocs.yml` but runs no plugins, so the extension does
    the work on its own: it finds `docs/`, keeps a copy of the viewer under it and links it with
    paths Zensical rewrites per page, indexes local documents and warns when one is missing. Put the
    viewer under `docs/` once, then list the extension.

    ```sh
    python -m asyncapi_viewer copy-assets docs/assets/asyncapi-viewer
    ```

    ```yaml title="mkdocs.yml"
    markdown_extensions:
      - asyncapi_viewer
    ```

    One `mkdocs.yml` can list both the plugin and the extension and build under either tool. This
    site does, and a Zensical build runs in its CI. Details in [Other tools](other-tools.md#zensical).

=== "Any Python-Markdown"

    Every other tool built on Python-Markdown, or your own script:

    ```python
    import markdown

    html = markdown.markdown(text, extensions=["asyncapi_viewer"])
    ```

    Without a docs directory the viewer loads from jsDelivr at the packaged version, with integrity
    hashes; with one it is served from there. Options such as `docs_dir`, `url_resolver` and
    `search_fallback` are in [Other tools](other-tools.md#plain-python-markdown).

Then put your AsyncAPI file next to your pages and reference it. Paths are relative to the
Markdown file, or relative to the docs directory when they start with `/`. Absolute `http(s)://`
URLs pass through unchanged.

```markdown title="docs/api/events.md"
# Events API

<asyncapi-viewer src="events.yaml" sidebar></asyncapi-viewer>
```

Or, without raw HTML, as a fenced block whose body uses the same names as the attributes:

````markdown title="docs/api/events.md"
```asyncapi
src: events.yaml
sidebar: true
```
````

## What you get

- **One element or one fence, any document.** JSON or YAML, AsyncAPI 2.x or 3.x, local file or URL.
- **Any host.** MkDocs with the plugin, Zensical with the extension alone, or plain Python-Markdown.
- **A viewer made for docs sites.** Operations with payload trees and example panels, servers,
  messages and schemas, a searchable sidebar with tag filters, light and dark themes that follow
  the page, and a container-based layout that never spills out of the column.
- **Served from your site.** The viewer is packaged with the wheel and published into the built
  site with Subresource Integrity hashes. No third-party CDN unless you ask for one.
- **CSP-clean.** No inline script or style: `script-src 'self'; style-src 'self'` is enough.
  See [Configuration](configuration.md#content-security-policy).
- **Searchable.** For local documents the build emits a hidden index of operations, channels and
  messages inside the element, so the site search finds them.
- **Strict-mode aware.** Problems surface as build warnings, not as a blank box in production.
- **Yours to style.** Two colours in a theme file, or any of the design tokens.
  See [Customising](customising.md).

## Where next

- [Live demo](demo.md) shows AsyncAPI 2 and 3 documents, the sidebar, a customised theme and an error.
- [Attributes](attributes.md) is the full reference.
- [Configuration](configuration.md) covers plugin options, self-hosting, the CDN option and Content Security Policy.
- [Customising](customising.md) is about colours, fonts and the theme file.
- [Other tools](other-tools.md) has the details for Zensical, plain Python-Markdown and Material's instant navigation.
- [Migration](migration.md) is for users of 1.x and of the older names `asyncapi-tag` and `mkdocs-asyncapi-tag-plugin`.

---

Built and maintained by [Weesho Lapara](https://weesholapara.com). Found it useful?
[Buy me a coffee](https://github.com/Weesho-Lapara/asyncapi-viewer?sponsor=1).
