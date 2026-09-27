import { describe, expect, it } from 'vitest';
import { buildNavItems, filterNav, groupNav, matches, tagFacets, type NavOptions } from '../src/render/nav.js';
import { accountsV2 } from './fixtures/expected/accounts-v2.js';
import { ordersV3 } from './fixtures/expected/orders-v3.js';

const base: NavOptions = { info: true, servers: true, messages: true, schemas: true, showServers: 'byDefault', showOperations: 'byDefault' };

describe('buildNavItems', () => {
  it('lists sections, flat operations and the Components group', () => {
    const items = buildNavItems(ordersV3, ordersV3.operations, 'v', base);
    expect(items.map((i) => [i.kind, i.label, i.group])).toEqual([
      ['section', 'Orders service', undefined],
      ['section', 'Servers', undefined],
      ['operation', 'emitOrderPlaced', 'Operations'],
      ['operation', 'onOrderShipped', 'Operations'],
      ['section', 'Messages', 'Components'],
      ['section', 'Schemas', 'Components'],
    ]);
    expect(items[2]).toMatchObject({ anchor: 'v--operations--emitOrderPlaced', badge: { label: 'SEND', action: 'send' } });
    expect(items[2]?.sub).toBeUndefined();
    expect(items[2]?.search).toEqual(['emitorderplaced', 'emitorderplaced', 'orders.placed', 'orderplaced', 'order placed', 'orders']);
    expect(items[2]?.tags).toEqual(['orders']);
    expect(items[4]?.count).toBe(2);
  });

  it('groups operations by their own tags or by document tags, untagged under Other', () => {
    const own = buildNavItems(ordersV3, ordersV3.operations, 'v', { ...base, showOperations: 'byOperationsTags' });
    expect(own.filter((i) => i.kind === 'operation').map((i) => i.group)).toEqual(['orders', 'fulfilment']);
    // orders-v3 declares no document tags: everything is Other under bySpecTags.
    const spec = buildNavItems(ordersV3, ordersV3.operations, 'v', { ...base, showOperations: 'bySpecTags' });
    expect(spec.filter((i) => i.kind === 'operation').map((i) => i.group)).toEqual(['Other', 'Other']);
    const v2 = buildNavItems(accountsV2, accountsV2.operations, 'v', { ...base, showOperations: 'bySpecTags' });
    expect(v2.filter((i) => i.kind === 'operation').map((i) => i.group)).toEqual(['accounts', 'security']);
  });

  it('lists servers under the Servers link only when a grouping mode is on, and honours hidden sections', () => {
    const grouped = buildNavItems(accountsV2, accountsV2.operations, 'v', { ...base, showServers: 'byServersTags' });
    expect(grouped.filter((i) => i.kind === 'server').map((i) => [i.label, i.group])).toEqual([
      ['production', 'accounts'],
      ['audit', 'security'],
    ]);
    const hidden = buildNavItems(accountsV2, [], 'v', { ...base, info: false, servers: false, schemas: false });
    expect(hidden.map((i) => i.label)).toEqual(['Messages']);
  });
});

describe('search', () => {
  const items = buildNavItems(ordersV3, ordersV3.operations, 'v', base);

  it('every term must match; case-insensitive substrings over heading, id, address and message names', () => {
    const emit = items[2]!;
    expect(matches(emit, 'Orders.')).toBe(true);
    expect(matches(emit, 'order placed')).toBe(true);
    expect(matches(emit, 'shipped')).toBe(false);
    expect(matches(emit, 'ORDERS')).toBe(true); // the tag name
    expect(matches(emit, '')).toBe(true);
  });

  it('hides section links during a query unless kept, reports counts, and keeps document order', () => {
    const r = filterNav(items, 'orders', false);
    expect(r.items.map((i) => i.label)).toEqual(['emitOrderPlaced', 'onOrderShipped']);
    expect([r.shown, r.total, r.active]).toEqual([2, 2, true]);
    const kept = filterNav(items, 'shipped', true);
    expect(kept.items.map((i) => i.label)).toEqual(['Orders service', 'Servers', 'onOrderShipped', 'Messages', 'Schemas']);
    expect(kept.shown).toBe(1);
    const none = filterNav(items, 'zzz', false);
    expect(none.items).toEqual([]);
    expect(filterNav(items, '   ', false).active).toBe(false);
  });

  it('groups consecutive items; groups with no matches disappear', () => {
    const grouped = buildNavItems(accountsV2, accountsV2.operations, 'v', { ...base, showOperations: 'bySpecTags' });
    const r = filterNav(grouped, 'login', false);
    expect(groupNav(r.items).map((g) => [g.group, g.items.length])).toEqual([['security', 1]]);
    expect(groupNav(grouped).map((g) => g.group)).toEqual([undefined, 'accounts', 'security', 'Components']);
  });
});

describe('tags facet (amendment 17)', () => {
  it('lists declared document tags first, then operation tags, each with its operation count', () => {
    // accounts-v2 declares accounts and security; both operations carry one of them.
    expect(tagFacets(accountsV2, accountsV2.operations)).toEqual([
      { name: 'accounts', description: 'Account lifecycle', count: 1 },
      { name: 'security', description: 'Authentication events', count: 1 },
    ]);
    // orders-v3 declares none: the operations' own tags in first-seen order.
    expect(tagFacets(ordersV3, ordersV3.operations)).toEqual([
      { name: 'orders', count: 1 },
      { name: 'fulfilment', count: 1 },
    ]);
    // A declared tag no operation carries is left out; hidden operations do not count.
    expect(tagFacets({ ...ordersV3, tags: [{ name: 'unused' }] }, [])).toEqual([]);
  });

  it('selected tags filter with any-of semantics and compose with the query', () => {
    const items = buildNavItems(ordersV3, ordersV3.operations, 'v', base);
    const one = filterNav(items, '', false, new Set(['fulfilment']));
    expect(one.items.map((i) => i.label)).toEqual(['onOrderShipped']);
    expect([one.shown, one.total, one.active]).toEqual([1, 2, true]);
    const both = filterNav(items, '', true, new Set(['orders', 'fulfilment']));
    expect(both.items.map((i) => i.label)).toEqual(['Orders service', 'Servers', 'emitOrderPlaced', 'onOrderShipped', 'Messages', 'Schemas']);
    const none = filterNav(items, 'placed', false, new Set(['fulfilment']));
    expect(none.shown).toBe(0);
    expect(filterNav(items, '', false, new Set()).active).toBe(false);
  });
});
