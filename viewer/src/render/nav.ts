/**
 * The sidebar's data (ROADMAP amendment 11): one generic list of nav items built once per
 * render, which the sidebar renders and the search filters. Sections and operations today;
 * messages and schemas can join later without touching search, grouping or highlighting.
 */
import type { Document, Operation, OperationAction } from '../model/types.js';
import type { GroupOperations, GroupServers } from '../options.js';

export type NavKind = 'section' | 'server' | 'operation' | 'message' | 'schema';

export interface NavItem {
  kind: NavKind;
  label: string;
  /** Full page anchor id (element id, section, item). */
  anchor: string;
  /** Group heading; items without one are listed flat. */
  group?: string;
  badge?: { label: string; action: OperationAction };
  /** Second line, e.g. the channel address. */
  sub?: string;
  /** Right-hand count, for the Messages and Schemas links. */
  count?: number;
  /** Lower-cased strings the search matches against. */
  search: string[];
  /** Operations: the tag names they carry, for the Tags facet. */
  tags?: string[];
}

/** One entry of the sidebar's Tags block: a tag and how many operations carry it. */
export interface TagFacet {
  name: string;
  description?: string;
  count: number;
}

export interface NavOptions {
  info: boolean;
  servers: boolean;
  messages: boolean;
  schemas: boolean;
  showServers: GroupServers;
  showOperations: GroupOperations;
}

export function buildNavItems(doc: Document, operations: Operation[], prefix: string, options: NavOptions): NavItem[] {
  const items: NavItem[] = [];
  if (options.info) items.push({ kind: 'section', label: doc.title, anchor: `${prefix}--info`, search: [] });
  if (options.servers && doc.servers.length > 0) {
    items.push({ kind: 'section', label: 'Servers', anchor: `${prefix}--servers`, count: doc.servers.length, search: [] });
    if (options.showServers !== 'byDefault') {
      for (const s of doc.servers) {
        const group = groupFor(s.tags.map((t) => t.name), doc, options.showServers === 'bySpecTags');
        items.push({ kind: 'server', label: s.id, anchor: `${prefix}--servers--${s.anchor}`, group, sub: s.hostDisplay, search: [] });
      }
    }
  }
  for (const op of operations) {
    // Flat mode lists every operation under one "Operations" heading; tag modes group by tag.
    const group = options.showOperations === 'byDefault' ? 'Operations' : groupFor(op.tags.map((t) => t.name), doc, options.showOperations === 'bySpecTags');
    const tags = op.tags.map((t) => t.name);
    items.push({
      kind: 'operation',
      label: op.heading,
      anchor: `${prefix}--operations--${op.anchor}`,
      group,
      badge: { label: op.badgeLabel, action: op.action },
      tags,
      // The channel address and tags are searchable but not shown: the list stays a list of operations.
      search: [op.heading, op.id, op.channel.address ?? '', ...op.messages.flatMap((m) => [m.name ?? '', m.title ?? '']), ...tags]
        .filter((s) => s !== '')
        .map((s) => s.toLowerCase()),
    });
  }
  if (options.messages && doc.messages.length > 0) {
    items.push({ kind: 'section', label: 'Messages', anchor: `${prefix}--messages`, group: 'Components', count: doc.messages.length, search: [] });
  }
  if (options.schemas && doc.schemas.length > 0) {
    items.push({ kind: 'section', label: 'Schemas', anchor: `${prefix}--schemas`, group: 'Components', count: doc.schemas.length, search: [] });
  }
  return items;
}

/** bySpecTags: the first document-level tag the item carries, in document order; else its own first tag. */
function groupFor(tags: string[], doc: Document, bySpec: boolean): string {
  if (bySpec) {
    const declared = doc.tags.map((t) => t.name);
    const hit = declared.find((d) => tags.includes(d));
    return hit ?? 'Other';
  }
  return tags[0] ?? 'Other';
}

/**
 * The Tags block's entries (amendment 17): the document's declared tags first, in their order,
 * then any other tag an operation carries, in first-seen order. Tags no operation carries are
 * left out, since selecting them could only empty the list.
 */
export function tagFacets(doc: Document, operations: Operation[]): TagFacet[] {
  const counts = new Map<string, number>();
  for (const op of operations) for (const t of op.tags) counts.set(t.name, (counts.get(t.name) ?? 0) + 1);
  const out: TagFacet[] = [];
  const seen = new Set<string>();
  const add = (name: string, description?: string) => {
    const count = counts.get(name);
    if (count === undefined || seen.has(name)) return;
    seen.add(name);
    const facet: TagFacet = { name, count };
    if (description) facet.description = description;
    out.push(facet);
  };
  for (const t of doc.tags) add(t.name, t.description);
  for (const op of operations) for (const t of op.tags) add(t.name, t.description);
  return out;
}

/** Every space-separated term must match one of the item's search strings. */
export function matches(item: NavItem, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t !== '');
  if (terms.length === 0) return true;
  return terms.every((term) => item.search.some((s) => s.includes(term)));
}

export interface FilteredNav {
  items: NavItem[];
  /** Operations shown and total, for the live region. */
  shown: number;
  total: number;
  active: boolean;
}

/**
 * The search query and the selected tags together: an operation stays when every term matches
 * and, if any tags are selected, it carries at least one of them. Section links hide while a
 * filter is active unless `keepSections`.
 */
export function filterNav(items: NavItem[], query: string, keepSections: boolean, selectedTags: ReadonlySet<string> = new Set()): FilteredNav {
  const active = query.trim() !== '' || selectedTags.size > 0;
  const total = items.filter((i) => i.kind === 'operation').length;
  if (!active) return { items, shown: total, total, active };
  const tagged = (i: NavItem) => selectedTags.size === 0 || (i.tags ?? []).some((t) => selectedTags.has(t));
  const out = items.filter((i) => (i.kind === 'operation' ? matches(i, query) && tagged(i) : keepSections));
  return { items: out, shown: out.filter((i) => i.kind === 'operation').length, total, active };
}

/** Consecutive items with the same group form one block; `undefined` groups are flat. */
export function groupNav(items: NavItem[]): Array<{ group: string | undefined; items: NavItem[] }> {
  const out: Array<{ group: string | undefined; items: NavItem[] }> = [];
  for (const item of items) {
    const last = out[out.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else out.push({ group: item.group, items: [item] });
  }
  return out;
}
