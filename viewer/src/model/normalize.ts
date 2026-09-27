/**
 * Entry point: turn a loaded document into the normalised model.
 */
import type { RefResolver } from '../load/refs.js';
import { Context, DEFAULT_NORMALIZE_OPTIONS, type NormalizeOptions } from './context.js';
import type { Document, Problem, Tag } from './types.js';
import { normalizeV2 } from './v2.js';
import { normalizeV3 } from './v3.js';

export interface NormalizeInput {
  resolver: RefResolver;
  data: Record<string, unknown>;
  specVersion: string;
  specMajor: 2 | 3;
  /** Problems found earlier (reference preloading) to carry into the document. */
  problems?: Problem[];
  options?: Partial<NormalizeOptions>;
}

export function normalize(input: NormalizeInput): Document {
  const options: NormalizeOptions = { ...DEFAULT_NORMALIZE_OPTIONS, ...input.options, labels: { ...DEFAULT_NORMALIZE_OPTIONS.labels, ...input.options?.labels } };
  const ctx = new Context(input.resolver, options);
  for (const p of input.problems ?? []) ctx.problems.push(p);
  const doc = input.specMajor === 3 ? normalizeV3(ctx, input.data, input.specVersion) : normalizeV2(ctx, input.data, input.specVersion);
  inheritTagDescriptions(doc);
  return doc;
}

/**
 * A tag on a server, channel, operation or message usually repeats the name of a document-level
 * tag and leaves the description there. Copy that description down so every chip can show it.
 */
function inheritTagDescriptions(doc: Document): void {
  const described = new Map(doc.tags.filter((t) => t.description).map((t) => [t.name, t.description as string]));
  if (described.size === 0) return;
  const fill = (tags: Tag[]) => {
    for (const t of tags) {
      const description = described.get(t.name);
      if (t.description === undefined && description !== undefined) t.description = description;
    }
  };
  for (const s of doc.servers) fill(s.tags);
  for (const op of doc.operations) {
    fill(op.tags);
    fill(op.channel.tags);
    for (const m of op.messages) fill(m.tags);
  }
  for (const m of doc.messages) fill(m.tags);
}
