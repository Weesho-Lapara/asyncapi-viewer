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

## MkDocs quick start

```yaml title="mkdocs.yml"
plugins:
  - asyncapi-viewer
```

Put your AsyncAPI file anywhere under `docs/` and reference it from a page. Paths are relative to the
Markdown file, or relative to `docs/` when they start with `/`. Absolute `http(s)://` URLs pass
through unchanged.

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

A missing document or an invalid attribute is a MkDocs warning, so `mkdocs build --strict` fails
instead of shipping a blank viewer.

## What you get

- **One element or one fence, any document.** JSON or YAML, AsyncAPI 2.x or 3.x, local file or URL.
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
- [Other tools](other-tools.md) covers Zensical, plain Python-Markdown and Material's instant navigation.
- [Migration](migration.md) is for users of 1.x and of the older names `asyncapi-tag` and `mkdocs-asyncapi-tag-plugin`.

---

Built and maintained by [Weesho Lapara](https://weesholapara.com). Found it useful?
[Buy me a coffee](https://github.com/Weesho-Lapara/asyncapi-viewer?sponsor=1).
