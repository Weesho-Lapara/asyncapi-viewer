import { describe, expect, it } from 'vitest';
import type { AsyncAPIViewerAttributes } from '../src/events.js';
import { OPTION_SPECS, lookupOption } from '../src/options.js';

// The published attribute typing (src/events.ts) is written by hand; this keeps it in step with
// options.schema.json. The Record type makes tsc fail when a key is missing or extra here.
const TYPED: Record<keyof AsyncAPIViewerAttributes, true> = {
  src: true,
  id: true,
  sidebar: true,
  info: true,
  servers: true,
  operations: true,
  messages: true,
  schemas: true,
  errors: true,
  'show-message-examples': true,
  'message-examples': true,
  'show-servers': true,
  'show-operations': true,
  'use-channel-address-as-identifier': true,
  'publish-label': true,
  'subscribe-label': true,
  'send-label': true,
  'receive-label': true,
  'request-label': true,
  'reply-label': true,
  'parser-options': true,
  'schema-id': true,
  theme: true,
  'theme-toggle': true,
  'search-keep-sections': true,
};

describe('AsyncAPIViewerAttributes', () => {
  it('names every option in options.schema.json, and nothing else', () => {
    // Through the element's own lookup: `schema-id` reaches `schemaID` the way the element reads it.
    const covered = Object.keys(TYPED).map((attribute) => lookupOption(attribute)?.name ?? `unknown: ${attribute}`);
    expect(covered.sort()).toEqual(OPTION_SPECS.map((o) => o.name).sort());
  });
});
