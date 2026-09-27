# Getting started

This page is for documentation sites built on Python-Markdown. For a web page, a React app or any
other JavaScript project, see [Web pages and React](web.md).

## Install

```sh
pip install asyncapi-viewer
```

The optional `yaml` extra (`pip install "asyncapi-viewer[yaml]"`) lets the build read YAML
documents for the search index outside MkDocs, which already brings PyYAML.

## Set up your tool

The element and the fence are the same in every host; what differs is one line of setup.

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

## Add a document

Put your AsyncAPI file next to your pages and reference it. Paths are relative to the Markdown
file, or relative to the docs directory when they start with `/`. Absolute `http(s)://` URLs pass
through unchanged; the browser fetches them, so the server must allow it (CORS).

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

Build the site. With the plugin, a wrong path or a misspelt attribute is a warning, and an error
under `mkdocs build --strict`.

## Next

- Choose what the viewer shows with [attributes](attributes.md): sections, sidebar, labels, theme.
- Match your site's colours in [Customising](customising.md).
- Serve the viewer from a CDN, or tighten your Content Security Policy, in
  [Configuration](configuration.md).
- See every option at work on the [live demo](demo.md).
