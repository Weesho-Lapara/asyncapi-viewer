# Attributes

Two syntaxes are accepted and take the same names:

=== "Element"

    ```html
    <asyncapi-viewer src="events.yaml" sidebar publishLabel="PUBLISH"></asyncapi-viewer>
    ```

=== "Fenced block"

    ````markdown
    ```asyncapi
    src: events.yaml
    sidebar: true
    publishLabel: PUBLISH
    ```
    ````
    
    !!! note "Fenced form"

        - Each line is `key: value`.
        - Quotes around a value are optional.
        - `#` starts a comment.
        - The path may follow the language instead (```` ```asyncapi events.yaml ````).
        - Only `src` is required.
        - Attribute names are case-insensitive.
        - The kebab-case spelling (`send-label`) is accepted too.
        - Boolean attributes accept `true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off`, and a bare attribute means `true`.

| Attribute | Values | Default | Effect |
|---|---|---|---|
| `src` | path or URL | required | The AsyncAPI document (JSON or YAML) |
| `id` | string | `asyncapi-viewer-N` | Element id; also the prefix of every anchor inside the viewer |
| `sidebar` | boolean | `false` | Show the navigation sidebar: a column from 1100px of viewer width, a drawer behind a menu button below |
| `info` | boolean | `true` | Show the Info section |
| `servers` | boolean | `true` | Show the Servers section |
| `operations` | boolean | `true` | Show the operations |
| `messages` | boolean | `true` | Show the Messages section (component messages) |
| `schemas` | boolean | `true` | Show the Schemas section (component schemas) |
| `errors` | boolean | `true` | Show the Problems panel (load and validation problems) |
| `showMessageExamples` | boolean | `false` | Show example panels in the Messages section |
| `messageExamples` | boolean | `true` | Example panels start expanded; `false` starts them collapsed |
| `showServers` | `byDefault`, `bySpecTags`, `byServersTags` | `byDefault` | List servers in the sidebar, grouped by the document's tags or by their own |
| `showOperations` | `byDefault`, `bySpecTags`, `byOperationsTags` | `byDefault` | Sidebar grouping for operations |
| `useChannelAddressAsIdentifier` | boolean | `false` | AsyncAPI 3: head each operation with its channel address instead of its title |
| `publishLabel`, `subscribeLabel` | string | `PUB`, `SUB` | Badge text for AsyncAPI 2 publish and subscribe operations<br><br>**Note:** An AsyncAPI 2 `publish` operation is one your application *receives*, while `subscribe` is one it *sends*. This is the reverse of what the words suggest. |
| `sendLabel`, `receiveLabel` | string | `SEND`, `RECEIVE` | Badge text for AsyncAPI 3 send and receive operations |
| `requestLabel`, `replyLabel` | string | `REQUEST`, `REPLY` | Badge text for AsyncAPI 3 operations that carry a `reply` |
| `theme` | `auto`, `light`, `dark` | `auto` | `auto` follows the page: Material's colour scheme, `html[data-theme]`, then the system preference |
| `themeToggle` | boolean | `false` | Show a light/dark toggle in the viewer header |
| `searchKeepSections` | boolean | `false` | Keep the Info, Servers, Messages and Schemas links visible while a sidebar search is active |
| `parserOptions` | JSON object | `{"applyTraits": true}` | Only `applyTraits` is honoured; other keys warn and are ignored |
| `schemaID` | string | | Deprecated: accepted, warns once, does nothing |




## Examples

Sidebar on, grouped by the tags declared in the document, example panels collapsed:

```html
<asyncapi-viewer src="events.yaml" sidebar showOperations="bySpecTags" messageExamples="false"></asyncapi-viewer>
```

Custom operation labels for an AsyncAPI 3 document:

```html
<asyncapi-viewer src="orders.yaml" sendLabel="EMIT" receiveLabel="ON"></asyncapi-viewer>
```

Always dark, with the viewer's own toggle so readers can switch:

```html
<asyncapi-viewer src="events.yaml" theme="dark" themeToggle></asyncapi-viewer>
```

Leave traits unapplied (single quotes around the attribute keep the JSON readable):

```html
<asyncapi-viewer src="events.yaml" parserOptions='{"applyTraits": false}'></asyncapi-viewer>
```

Both the paired and the self-closing form are accepted and HTML global attributes such as `class`, `data-*` and `aria-*` pass through to the element.

```html
<asyncapi-viewer
    src="events.yaml"
    class="wide"
    sidebar
/>
```

## Anchors

Every section, operation, message and schema has an id of the form `<element id>--<section>--<item>`, for example `asyncapi-viewer-1--operations--emitOrderPlaced`. 

Linking to one scrolls to it and moves keyboard focus there, and opens the entry when it is collapsible. 

Set `id` on the element when you link to anchors from other pages, so a change in the number of viewers on the page does not move them.

## Validation

Unknown attributes and invalid values are reported as warnings and skipped; the remaining
attributes still apply. Under MkDocs the warnings go through the MkDocs logger, so
`mkdocs build --strict` fails on them. An element without `src` renders a visible message in place.

Elements inside fenced or indented code blocks and inline code spans are left alone, and an
`asyncapi` fence nested inside a longer fence (four backticks around three) stays a code sample,
which is how this page shows the syntax.
