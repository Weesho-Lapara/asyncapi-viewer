# Live demo

Select the spec you want to view.

<select id="demo-spec" class="demo-select" aria-label="AsyncAPI document">
  <optgroup label="AsyncAPI 3">
    <option value="orders" data-src="orders-v3.yaml" data-attrs='{"send-label": "EMIT", "receive-label": "ON"}'>Orders service (YAML)</option>
    <option value="adeo" data-src="adeo-kafka-request-reply-asyncapi.yml" data-attrs='{"sidebar": ""}'>Adeo: Kafka request/reply with Avro</option>
    <option value="streetlights" data-src="streetlights-kafka-asyncapi.yml" data-attrs='{"sidebar": "", "show-servers": "byServersTags", "use-channel-address-as-identifier": ""}'>Streetlights over Kafka</option>
  </optgroup>
  <optgroup label="AsyncAPI 2">
    <option value="accounts" data-src="accounts-v2.json" data-attrs='{"sidebar": "", "show-operations": "bySpecTags", "message-examples": "false"}'>Accounts service (JSON)</option>
  </optgroup>
  <optgroup label="Errors">
    <option value="error" data-src="https://example.invalid/asyncapi.yaml" data-attrs='{}'>A document that cannot be loaded</option>
  </optgroup>
</select>

<div data-demo-spec="orders" markdown>

Custom badge labels for the send and receive operations.

````markdown
```asyncapi
src: examples/orders-v3.yaml
sendLabel: EMIT
receiveLabel: ON
```
````

</div>

<div data-demo-spec="adeo" hidden markdown>

A request with its reply, Kafka bindings, and Avro payloads that the browser fetches from
asyncapi.com and shows as trees. The sidebar opens from the menu button in a column this narrow.

````markdown
<asyncapi-viewer src="examples/adeo-kafka-request-reply-asyncapi.yml" sidebar></asyncapi-viewer>
````

</div>

<div data-demo-spec="streetlights" hidden markdown>

Servers grouped by their tags in the sidebar, and operations labelled by channel address.

````markdown
<asyncapi-viewer src="examples/streetlights-kafka-asyncapi.yml" sidebar showServers="byServersTags" useChannelAddressAsIdentifier></asyncapi-viewer>
````

</div>

<div data-demo-spec="accounts" hidden markdown>

The sidebar with operations grouped by the document's tags; example panels start collapsed.

````markdown
<asyncapi-viewer src="examples/accounts-v2.json" sidebar showOperations="bySpecTags" messageExamples="false"></asyncapi-viewer>
````

</div>

<div data-demo-spec="error" hidden markdown>

This one is meant to fail: the host does not exist. Readers get a message naming the URL instead of
a blank box. A wrong local path is caught earlier, because `mkdocs build --strict` fails on it.

````markdown
<asyncapi-viewer src="https://example.invalid/asyncapi.yaml"></asyncapi-viewer>
````

</div>

<asyncapi-viewer id="demo-viewer" src="examples/orders-v3.yaml" sendLabel="EMIT" receiveLabel="ON"></asyncapi-viewer>

The Adeo and Streetlights documents are from the
[AsyncAPI specification examples](https://github.com/asyncapi/spec/tree/master/examples)
(Apache-2.0).
