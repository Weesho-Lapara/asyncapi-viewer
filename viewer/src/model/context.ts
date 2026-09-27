/**
 * Shared state for one normalisation run: the resolver, the problems list, the label options,
 * anchor allocation and the small helpers every normaliser needs.
 */
import { schemaNameOf, type RefResolver } from '../load/refs.js';
import type { Binding, BindingScope, ExternalDocs, Problem, SectionId, SecurityFlow, SecurityRequirement, Tag } from './types.js';

export interface Labels {
  publish: string;
  subscribe: string;
  send: string;
  receive: string;
  request: string;
  reply: string;
}

export interface NormalizeOptions {
  labels: Labels;
  useChannelAddressAsIdentifier: boolean;
  applyTraits: boolean;
}

export const DEFAULT_NORMALIZE_OPTIONS: NormalizeOptions = {
  labels: { publish: 'PUB', subscribe: 'SUB', send: 'SEND', receive: 'RECEIVE', request: 'REQUEST', reply: 'REPLY' },
  useChannelAddressAsIdentifier: false,
  applyTraits: true,
};

export type Obj = Record<string, unknown>;

export function isObj(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : typeof value === 'number' || typeof value === 'boolean' ? String(value) : undefined;
}

/** A dereferenced object together with where it lives, for nested references. */
export interface Located {
  value: Obj;
  baseUrl: string;
  /** Resolved id when the value came through a `$ref`. */
  id: string | undefined;
}

export class Context {
  readonly problems: Problem[] = [];
  readonly #anchors = new Map<SectionId, Set<string>>();

  constructor(
    readonly resolver: RefResolver,
    readonly options: NormalizeOptions,
  ) {}

  problem(severity: Problem['severity'], message: string, where: string): void {
    this.problems.push({ severity, message, where });
  }

  /**
   * Dereference `value` (following `$ref` chains) and require an object. Anything else is
   * recorded as a problem at `where` and yields undefined.
   */
  object(value: unknown, baseUrl: string, where: string): Located | undefined {
    if (value === undefined) return undefined;
    const r = this.resolver.deref(value, baseUrl);
    if ('error' in r) {
      this.problem('error', r.error, where);
      return undefined;
    }
    if (!isObj(r.value)) {
      this.problem('warning', `Expected an object at "${where}" but found ${describeType(r.value)}; it was skipped.`, where);
      return undefined;
    }
    return { value: r.value, baseUrl: r.baseUrl, id: r.id };
  }

  /** Iterate a map-shaped field (`servers`, `channels`, ...) dereferencing each entry. */
  *entries(map: unknown, baseUrl: string, where: string): Generator<[key: string, located: Located, where: string]> {
    if (map === undefined) return;
    if (!isObj(map)) {
      this.problem('warning', `Expected a map at "${where}"; it was skipped.`, where);
      return;
    }
    for (const [key, raw] of Object.entries(map)) {
      const itemWhere = `${where}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      const located = this.object(raw, baseUrl, itemWhere);
      if (located) yield [key, located, itemWhere];
    }
  }

  /** Iterate a list field dereferencing each entry. */
  *items(list: unknown, baseUrl: string, where: string): Generator<[located: Located, where: string]> {
    if (list === undefined) return;
    if (!Array.isArray(list)) {
      this.problem('warning', `Expected a list at "${where}"; it was skipped.`, where);
      return;
    }
    for (let i = 0; i < list.length; i++) {
      const itemWhere = `${where}/${i}`;
      const located = this.object(list[i], baseUrl, itemWhere);
      if (located) yield [located, itemWhere];
    }
  }

  /** A document-unique anchor for `id` within a section. */
  anchor(section: SectionId, id: string): string {
    const used = this.#anchors.get(section) ?? new Set<string>();
    this.#anchors.set(section, used);
    const base = slug(id);
    let candidate = base;
    for (let n = 2; used.has(candidate); n++) candidate = `${base}-${n}`;
    used.add(candidate);
    return candidate;
  }

  tags(list: unknown, baseUrl: string, where: string): Tag[] {
    const out: Tag[] = [];
    for (const [{ value, baseUrl: b }, w] of this.items(list, baseUrl, where)) {
      const name = str(value['name']);
      if (name === undefined) {
        this.problem('warning', `A tag without a name at "${w}" was skipped.`, w);
        continue;
      }
      const tag: Tag = { name };
      const description = str(value['description']);
      if (description !== undefined) tag.description = description;
      const ext = this.externalDocs(value['externalDocs'], b, `${w}/externalDocs`);
      if (ext) tag.externalDocs = ext;
      out.push(tag);
    }
    return out;
  }

  externalDocs(value: unknown, baseUrl: string, where: string): ExternalDocs | undefined {
    const located = this.object(value, baseUrl, where);
    if (!located) return undefined;
    const url = str(located.value['url']);
    if (url === undefined) {
      this.problem('warning', `externalDocs without a url at "${where}" was skipped.`, where);
      return undefined;
    }
    const out: ExternalDocs = { url };
    const description = str(located.value['description']);
    if (description !== undefined) out.description = description;
    return out;
  }

  /** `bindings: { kafka: { groupId: x, bindingVersion: y } }` -> one Binding per key. */
  bindings(scope: BindingScope, value: unknown, baseUrl: string, where: string): Binding[] {
    const out: Binding[] = [];
    const located = this.object(value, baseUrl, where);
    if (!located) return out;
    for (const [protocol, entry, w] of this.entries(located.value, located.baseUrl, where)) {
      for (const [key, v] of Object.entries(entry.value)) {
        out.push({ scope, protocol, key, value: v });
      }
      void w;
    }
    return out;
  }

  /**
   * Apply `traits` to an object: the object's own fields win, then earlier traits over later
   * ones (the official parser's order). Keys a trait must not carry are dropped with a problem.
   * Returns the object unchanged when `applyTraits` is off or there are no traits.
   */
  withTraits(value: Obj, baseUrl: string, where: string, forbidden: readonly string[]): Obj {
    const traits = value['traits'];
    if (!this.options.applyTraits || traits === undefined) return value;
    let merged: Obj = { ...value };
    delete merged['traits'];
    for (const [trait, w] of this.items(traits, baseUrl, `${where}/traits`)) {
      const patch: Obj = { ...trait.value };
      for (const key of forbidden) {
        if (key in patch) {
          this.problem('warning', `A trait must not define "${key}"; that field of the trait at "${w}" was ignored.`, w);
          delete patch[key];
        }
      }
      merged = mergeObjects(patch, merged);
    }
    return merged;
  }

  /** The last pointer segment of a resolved id: `#/servers/production` -> `production`. */
  static keyOf(id: string | undefined): string | undefined {
    if (id === undefined) return undefined;
    const pointer = id.slice(id.indexOf('#') + 1);
    const last = pointer.split('/').pop();
    return last === undefined || last === '' ? undefined : last.replace(/~1/g, '/').replace(/~0/g, '~');
  }

  static schemaName(id: string | undefined): string | undefined {
    return id === undefined ? undefined : schemaNameOf(id);
  }
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'a list';
  return typeof value === 'object' ? 'an object' : `a ${typeof value}`;
}

/** Deep merge where `over` wins; lists and scalars are replaced, objects merged key by key. */
/**
 * The facts of a security scheme object that a reader wants beside its name: where an API key
 * goes, the HTTP scheme, the OpenID discovery URL and, for OAuth 2, every flow with its URLs and
 * scopes. v2 flows list scopes under `scopes`, v3 under `availableScopes`; both are read.
 */
export function securitySchemeDetails(scheme: Obj): Pick<SecurityRequirement, 'facts' | 'openIdConnectUrl' | 'flows' | 'extensions'> {
  const out: Pick<SecurityRequirement, 'facts' | 'openIdConnectUrl' | 'flows' | 'extensions'> = {};
  const facts: Array<{ label: string; value: string }> = [];
  const fact = (label: string, key: string) => {
    const value = str(scheme[key]);
    if (value !== undefined) facts.push({ label, value });
  };
  switch (str(scheme['type'])) {
    case 'apiKey':
      fact('in', 'in');
      break;
    case 'httpApiKey':
      fact('name', 'name');
      fact('in', 'in');
      break;
    case 'http':
      fact('scheme', 'scheme');
      fact('bearer format', 'bearerFormat');
      break;
    case 'openIdConnect': {
      const url = str(scheme['openIdConnectUrl']);
      if (url !== undefined) out.openIdConnectUrl = url;
      break;
    }
    case 'oauth2': {
      const flows = scheme['flows'];
      if (isObj(flows)) {
        const list: SecurityFlow[] = [];
        for (const [kind, raw] of Object.entries(flows)) {
          if (!isObj(raw)) continue;
          const flow: SecurityFlow = { kind, scopes: [] };
          const auth = str(raw['authorizationUrl']);
          const token = str(raw['tokenUrl']);
          const refresh = str(raw['refreshUrl']);
          if (auth !== undefined) flow.authorizationUrl = auth;
          if (token !== undefined) flow.tokenUrl = token;
          if (refresh !== undefined) flow.refreshUrl = refresh;
          const scopes = raw['availableScopes'] ?? raw['scopes'];
          if (isObj(scopes)) {
            for (const [name, description] of Object.entries(scopes)) flow.scopes.push({ name, description: typeof description === 'string' ? description : '' });
          }
          list.push(flow);
        }
        if (list.length > 0) out.flows = list;
      }
      break;
    }
  }
  if (facts.length > 0) out.facts = facts;
  // Schemes such as `plain` or `scramSha256` have no standard fields, so authors put the
  // connection settings in extensions (Adeo: x-sasl.jaas.config, x-security.protocol).
  const extensions = Object.entries(scheme).filter(([k]) => k.startsWith('x-')).map(([key, value]) => ({ key, value }));
  if (extensions.length > 0) out.extensions = extensions;
  return out;
}

export function mergeObjects(base: Obj, over: Obj): Obj {
  const out: Obj = { ...base };
  for (const [key, v] of Object.entries(over)) {
    const existing = out[key];
    out[key] = isObj(existing) && isObj(v) && !('$ref' in v) && !('$ref' in existing) ? mergeObjects(existing, v) : v;
  }
  return out;
}

/**
 * Anchor slug for an id. Runs of separators collapse to one hyphen so an anchor never contains
 * "--", the separator between element id, section and item in page anchors.
 */
export function slug(id: string): string {
  return id.replace(/[^A-Za-z0-9_.]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}
