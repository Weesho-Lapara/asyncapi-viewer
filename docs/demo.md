# Live demo

Everything on this page is rendered by `asyncapi-viewer` from the example documents in
`docs/examples/`: two written for this site, and two from the
[AsyncAPI specification examples](https://github.com/asyncapi/spec/tree/master/examples)
(Apache-2.0). The Markdown for each section is shown above its viewer. Switch the site to dark
mode with the toggle in the header: the viewers follow.

The viewers sit in the documentation column, which is narrower than the 1100px the sidebar needs
to stay open, so it shows as a menu button here. The [overview](index.md) has a screenshot of the
wide layout, with the sidebar and the example panel beside each message.

## AsyncAPI 3 document (YAML), fenced-block syntax

Custom badge labels for the send and receive operations.

````markdown
```asyncapi
src: examples/orders-v3.yaml
sendLabel: EMIT
receiveLabel: ON
```
````

```asyncapi
src: examples/orders-v3.yaml
sendLabel: EMIT
receiveLabel: ON
```

## AsyncAPI 2 document (JSON), element syntax, with the sidebar

The sidebar is off by default. With `sidebar` on, it sits in a column when the viewer is at least
1100px wide and behind a menu button otherwise, as here inside the documentation column. It has a
search box, a Tags block that filters the operations, and grouping by the document's tags. Example
panels start collapsed here.

```markdown
<asyncapi-viewer src="examples/accounts-v2.json" sidebar showOperations="bySpecTags" messageExamples="false"></asyncapi-viewer>
```

<asyncapi-viewer src="examples/accounts-v2.json" sidebar showOperations="bySpecTags" messageExamples="false"></asyncapi-viewer>

## Kafka with Avro schemas and request/reply (AsyncAPI 3)

Adeo's costing service from the AsyncAPI case studies: a request operation with its reply, Kafka
bindings on servers, channels and messages, and payloads written in Avro. The two Avro schemas are
external `$ref`s to asyncapi.com, fetched by the browser; the viewer turns them into the same trees
as JSON Schema.

```markdown
<asyncapi-viewer src="examples/adeo-kafka-request-reply-asyncapi.yml" sidebar></asyncapi-viewer>
```

<asyncapi-viewer src="examples/adeo-kafka-request-reply-asyncapi.yml" sidebar></asyncapi-viewer>

## Streetlights over Kafka, servers grouped by tags (AsyncAPI 3)

The specification's classic example: four operations over two servers with SASL and certificate
security, a channel parameter in every address, and an operation trait that adds Kafka bindings to
each operation. The sidebar groups the servers by their tags, and operations are labelled by
channel address instead of their ids.

```markdown
<asyncapi-viewer src="examples/streetlights-kafka-asyncapi.yml" sidebar showServers="byServersTags" useChannelAddressAsIdentifier></asyncapi-viewer>
```

<asyncapi-viewer src="examples/streetlights-kafka-asyncapi.yml" sidebar showServers="byServersTags" useChannelAddressAsIdentifier></asyncapi-viewer>

## Customised

The same document with two other accents and a squarer radius, from three lines of CSS on the
page (see [Customising](customising.md)), plus the viewer's own light/dark toggle.

```markdown
<asyncapi-viewer src="examples/orders-v3.yaml" class="demo-custom" themeToggle></asyncapi-viewer>
```

```css
asyncapi-viewer.demo-custom {
  --asyncapi-primary: #0F766E;
  --asyncapi-secondary: #9F1239;
  --asyncapi-radius: 4px;
}
```

<asyncapi-viewer src="examples/orders-v3.yaml" class="demo-custom" themeToggle></asyncapi-viewer>

## Error handling (this one is meant to fail)

The element below points at a host that does not exist, to show what readers see when a document
cannot be loaded: a message in place of the viewer, naming the URL, instead of a blank box. A wrong
local path is caught earlier, at build time, because `mkdocs build --strict` fails on it.

```markdown
<asyncapi-viewer src="https://example.invalid/asyncapi.yaml"></asyncapi-viewer>
```

<asyncapi-viewer src="https://example.invalid/asyncapi.yaml"></asyncapi-viewer>
