/**
 * Shared detail blocks: the Parameters table, binding and security chips and the reply
 * block (spec 4.7 items 5, 7, 8, 9). Servers reuse the chips in their split style.
 */
import { css, html, nothing, type TemplateResult } from 'lit';
import type { Binding, Parameter, Reply, SecurityRequirement } from '../model/types.js';
import { renderInline } from './markdown.js';

export const detailStyles = css`
  .block {
    margin-top: 28px;
  }
  .block__title {
    margin: 0 0 10px;
    font: 500 11px/1 var(--_font-body);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--_muted);
  }
  .block__title:focus-visible {
    outline: 2px solid var(--_primary);
    outline-offset: 4px;
  }
  .params {
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 12px 20px;
    margin: 0;
    padding: 14px 16px;
    border: 1px solid var(--_line);
    border-radius: var(--_radius);
    background: var(--_surface);
  }
  .params dt {
    display: grid;
    gap: 2px;
    align-content: start;
  }
  .params__name {
    font: 500 13px/1.5 var(--_font-mono);
    color: var(--_primary-text);
    overflow-wrap: anywhere;
  }
  .params__schema {
    font: 400 11.5px/1.5 var(--_font-mono);
    color: var(--_muted);
  }
  .params dd {
    margin: 0;
    color: var(--_ink-2);
    font-size: 13px;
  }
  .params__facts {
    font: 400 11.5px/1.6 var(--_font-mono);
    color: var(--_muted);
    overflow-wrap: anywhere;
  }
  @container viewer (max-width: 699px) {
    .params {
      grid-template-columns: 1fr;
      gap: 4px;
    }
    .params dd + dt {
      margin-top: 12px;
    }
  }
  .chip__scope {
    color: var(--_muted);
  }
  .chip__value {
    color: var(--_ink);
  }
  /* Pill style: key and value in one pill; a described one becomes a full-width row. */
  .chip__head {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .chip--row {
    display: grid;
    gap: 4px;
    width: 100%;
    padding: 10px 14px;
    border-radius: var(--_radius-sm);
  }
  /* Split style (servers): the key in the pill, the value beside it. */
  .binding {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    min-width: 0;
    max-width: 100%;
  }
  .binding__head {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    min-width: 0;
  }
  .binding .chip__value {
    font-size: 13px;
    color: var(--_ink);
    overflow-wrap: anywhere;
  }
  .binding--described {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 4px;
  }
  .chip__desc {
    min-width: 0;
    padding-left: 2px;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--_ink-2);
    overflow-wrap: anywhere;
  }
  .chip pre {
    margin: 0;
    font: 11.5px/1.4 var(--_font-mono);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-width: 48ch;
  }
  .sec__id {
    font: 500 12.5px/1.5 var(--_font-mono);
    color: var(--_primary-text);
    text-decoration: none;
  }
  .sec__id:hover,
  .sec__id:focus-visible {
    text-decoration: underline;
  }
  .sec--row {
    justify-items: start;
    gap: 8px;
  }
  .sec__pill {
    background: var(--_bg);
  }
  /* Hierarchy: details indent under the pill, items indent under their group label. */
  .sec__details {
    display: grid;
    gap: 6px;
    width: 100%;
    min-width: 0;
    padding-left: 14px;
    font-size: 12px;
  }
  .sec__details .chip__desc {
    padding-left: 0;
  }
  .sec__list {
    display: grid;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--_ink);
  }
  .sec__list li {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .sec__list .sec__list {
    margin-top: 4px;
    padding-left: 14px;
  }
  .sec__list a {
    color: var(--_primary-text);
  }
  .sec__group {
    display: grid;
    gap: 4px;
  }
  .sec__label {
    font: 400 12px/1.5 var(--_font-mono);
    color: var(--_muted);
  }
  .sec__group .sec__list,
  .sec__scopes {
    padding-left: 14px;
  }
  .sec__scopes {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 4px 14px;
    margin: 0;
  }
  .sec__scopes dt {
    color: var(--_ink);
  }
  .sec__scopes dd {
    margin: 0;
    min-width: 0;
    color: var(--_ink-2);
    overflow-wrap: anywhere;
  }
  @container viewer (max-width: 699px) {
    .sec__scopes {
      grid-template-columns: 1fr;
      gap: 2px;
    }
    .sec__scopes dd {
      margin-bottom: 6px;
    }
  }
  .reply {
    padding: 14px 16px;
    border: 1px solid var(--_line);
    border-left: 3px solid var(--_secondary);
    border-radius: var(--_radius);
    background: var(--_surface);
    display: grid;
    gap: 8px;
  }
  .reply__row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 12px;
    min-width: 0;
  }
  .reply__address {
    font: 400 14px/1.5 var(--_font-mono);
    color: var(--_ink);
    word-break: break-all;
  }
  .reply__messages {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .reply__desc {
    color: var(--_ink-2);
    font-size: 13px;
  }
  .reply__row--bindings {
    align-items: flex-start;
  }
  .reply__row--bindings .label {
    padding-top: 6px;
  }
`;

export function renderParameters(parameters: Parameter[], anchor: string): TemplateResult | typeof nothing {
  if (parameters.length === 0) return nothing;
  return html`<div class="block" id="${anchor}--parameters">
    <h4 class="sub-title" tabindex="-1">Parameters</h4>
    <dl class="params">
      ${parameters.map((p) => {
        const facts: string[] = [];
        if (p.enum && p.enum.length > 0) facts.push(`enum: ${p.enum.join(' · ')}`);
        if (p.default !== undefined) facts.push(`default: ${p.default}`);
        if (p.examples && p.examples.length > 0) facts.push(`examples: ${p.examples.join(' · ')}`);
        if (p.location) facts.push(`location: ${p.location}`);
        return html`<dt>
            <span class="params__name">${p.name}</span>
            ${p.schemaType ? html`<span class="params__schema">schema: ${p.schemaType}</span>` : nothing}
          </dt>
          <dd>
            ${p.description ? html`<div>${renderInline(p.description)}</div>` : nothing}
            ${facts.length > 0 ? html`<div class="params__facts">${facts.join('  ·  ')}</div>` : nothing}
          </dd>`;
      })}
    </dl>
  </div>`;
}

function isSchemaShaped(value: unknown): value is { type: string; description?: unknown; enum?: unknown } {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && typeof (value as { type?: unknown }).type === 'string';
}

function chipValue(value: unknown): TemplateResult {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return html`<span class="chip__value mono">${String(value)}</span>`;
  // Some bindings (Kafka groupId, clientId) carry a schema instead of a value: show its type.
  if (isSchemaShaped(value)) {
    const facts = [value.type, Array.isArray(value.enum) ? `enum: ${value.enum.map(String).join(' · ')}` : undefined].filter(Boolean).join(' · ');
    return html`<span class="chip__value mono">${facts}</span>`;
  }
  const text = JSON.stringify(value);
  if (text.length <= 40) return html`<span class="chip__value mono">${text}</span>`;
  return html`<pre class="chip__value">${JSON.stringify(value, null, 2)}</pre>`;
}

export type BindingStyle = 'pill' | 'split';

/**
 * A binding. `pill`: key and value together in one pill (operations, replies). `split`: the key
 * in the pill and the value beside it (servers, whose values are URLs). A description, when
 * there is one, sits underneath on a full-width row.
 */
function bindingChip(scopeLabel: string, protocol: string, leaf: { key: string; value: unknown }, title: string, style: BindingStyle): TemplateResult {
  const description = isSchemaShaped(leaf.value) && typeof leaf.value.description === 'string' ? leaf.value.description : undefined;
  const key = html`<span class="mono"><span class="chip__scope">${scopeLabel}</span>${leaf.key}</span>`;
  if (style === 'split') {
    return html`<li class="binding ${description ? 'binding--described' : ''}" title=${title}>
      <span class="binding__head"><span class="chip">${key}</span>${chipValue(leaf.value)}</span>
      ${description ? html`<span class="chip__desc">${renderInline(description)}</span>` : nothing}
    </li>`;
  }
  return html`<li class="chip ${description ? 'chip--row' : ''}" title=${title}>
    <span class="chip__head">${key}${chipValue(leaf.value)}</span>
    ${description ? html`<span class="chip__desc">${renderInline(description)}</span>` : nothing}
  </li>`;
}

/**
 * Nested binding objects become one chip per leaf value with a dotted key
 * (`topicConfiguration.retention.ms 60000000`); scalar arrays are joined; schema-shaped
 * values (Kafka groupId) stay one chip showing the schema's type and description.
 */
export function flattenBinding(b: Binding): Array<{ key: string; value: unknown }> {
  const out: Array<{ key: string; value: unknown }> = [];
  const visit = (key: string, value: unknown) => {
    if (Array.isArray(value)) {
      if (value.every((v) => typeof v !== 'object' || v === null)) out.push({ key, value: value.map(String).join(' · ') });
      else out.push({ key, value });
      return;
    }
    if (typeof value === 'object' && value !== null) {
      if (typeof (value as { type?: unknown }).type === 'string') {
        out.push({ key, value });
        return;
      }
      for (const [k, v] of Object.entries(value)) visit(`${key}.${k}`, v);
      return;
    }
    out.push({ key, value });
  };
  visit(b.key, b.value);
  return out;
}

/** Chips reading `<scope>.<key> <value>`; empty when there are none. */
export function renderBindings(bindings: Binding[], title = 'Bindings', style: BindingStyle = 'pill'): TemplateResult | typeof nothing {
  if (bindings.length === 0) return nothing;
  return html`<div class="block">
    <h4 class="sub-title">${title}</h4>
    <ul class="chips">
      ${bindings.flatMap((b) => flattenBinding(b).map((leaf) => bindingChip(`${b.scope}.`, b.protocol, leaf, `${b.protocol} binding`, style)))}
    </ul>
  </div>`;
}

/**
 * Everything under a security chip's head, as an indented hierarchy: description, scheme facts and
 * the OpenID discovery URL as lines; then a `flows` group with each flow's URLs stacked under its
 * name; then a `scopes` group listing each scope once with its description. Required scopes that
 * no flow declares are listed there too, so the head never needs to repeat them.
 */
function securityDetails(s: SecurityRequirement): TemplateResult | typeof nothing {
  const flows = s.flows ?? [];
  const scopes = new Map<string, string>();
  for (const f of flows) for (const sc of f.scopes) if (!scopes.has(sc.name)) scopes.set(sc.name, sc.description);
  if (scopes.size > 0) for (const name of s.scopes) if (!scopes.has(name)) scopes.set(name, '');
  const facts = s.facts ?? [];
  if (!s.description && facts.length === 0 && !s.openIdConnectUrl && flows.length === 0) return nothing;
  const url = (label: string, href: string | undefined) => (href ? html`<li class="mono"><span class="chip__scope">${label} </span><a href=${href}>${href}</a></li>` : nothing);
  return html`<div class="sec__details">
    ${s.description ? html`<span class="chip__desc">${renderInline(s.description)}</span>` : nothing}
    ${facts.length > 0 || s.openIdConnectUrl
      ? html`<ul class="sec__list">
          ${facts.map((f) => html`<li class="mono"><span class="chip__scope">${f.label} </span>${f.value}</li>`)}
          ${url('discovery', s.openIdConnectUrl)}
        </ul>`
      : nothing}
    ${flows.length > 0
      ? html`<div class="sec__group">
          <span class="sec__label">flows</span>
          <ul class="sec__list">
            ${flows.map(
              (f) => html`<li>
                <span class="mono">${f.kind}</span>
                <ul class="sec__list">${url('authorization', f.authorizationUrl)}${url('token', f.tokenUrl)}${url('refresh', f.refreshUrl)}</ul>
              </li>`,
            )}
          </ul>
        </div>`
      : nothing}
    ${scopes.size > 0
      ? html`<div class="sec__group">
          <span class="sec__label">scopes</span>
          <dl class="sec__scopes">${[...scopes].map(([name, description]) => html`<dt class="mono">${name}</dt><dd>${description ? renderInline(description) : nothing}</dd>`)}</dl>
        </div>`
      : nothing}
  </div>`;
}

/** True when the details list the scopes, so the head does not repeat them. */
function scopesListed(s: SecurityRequirement): boolean {
  return (s.flows ?? []).some((f) => f.scopes.length > 0);
}

/**
 * A security requirement as a chip. The pill holds the scheme id only; its type sits beside it,
 * and the required scopes too unless the details list them. `pill` (operations) links the id to
 * the Servers section and, when there are details, boxes the whole entry as a full-width row like
 * a described binding; `split` (servers) has nothing to link to and stacks the details underneath
 * without a box.
 */
function securityChip(s: SecurityRequirement, style: BindingStyle, serversHref?: string): TemplateResult {
  const id = serversHref ? html`<a class="sec__id" href=${serversHref}>${s.id}</a>` : html`<span class="mono">${s.id}</span>`;
  // An inline v3 requirement has no key, so the normaliser names it after its type: show it once.
  const type = s.type && s.type !== s.id ? html`<span class="chip__value mono">${s.type}</span>` : nothing;
  const required = s.scopes.length > 0 && !scopesListed(s) ? html`<span class="chip__value mono"><span class="chip__scope">scopes </span>${s.scopes.join(' · ')}</span>` : nothing;
  const details = securityDetails(s);
  const head = html`<span class="binding__head"><span class="chip ${style === 'pill' ? 'sec__pill' : ''}">${id}</span>${type}${required}</span>`;
  if (style === 'split') {
    return html`<li class="binding ${details !== nothing ? 'binding--described' : ''}">${head}${details}</li>`;
  }
  if (details === nothing) return html`<li class="binding">${head}</li>`;
  return html`<li class="chip chip--row sec--row">${head}${details}</li>`;
}

/** Security requirements as chips (spec 4.7 item 9). `serversHref` links each scheme to the Servers section. */
export function renderSecurity(security: SecurityRequirement[], style: BindingStyle = 'pill', serversHref?: string): TemplateResult | typeof nothing {
  if (security.length === 0) return nothing;
  return html`<div class="block">
    <h4 class="sub-title">Security</h4>
    <ul class="chips">
      ${security.map((s) => securityChip(s, style, serversHref))}
    </ul>
  </div>`;
}

export function renderReply(reply: Reply, prefix: string): TemplateResult {
  const address = reply.channel ? reply.channel.address : undefined;
  return html`<div class="block">
    <h4 class="sub-title">Reply</h4>
    <div class="reply">
      ${reply.addressLocation
        ? html`<div class="reply__row"><span class="label">Address from</span><span class="reply__address">${reply.addressLocation}</span></div>`
        : nothing}
      ${reply.addressDescription ? html`<div class="reply__desc">${renderInline(reply.addressDescription)}</div>` : nothing}
      ${reply.channel
        ? html`<div class="reply__row">
            <span class="label">Channel</span>
            <span class="reply__address">${address === null ? 'Address not specified' : address}</span>
            ${reply.channel.id !== address ? html`<span class="params__schema">${reply.channel.id}</span>` : nothing}
          </div>`
        : nothing}
      ${reply.messages.length > 0
        ? html`<div class="reply__row">
            <span class="label">Messages</span>
            <ul class="reply__messages">
              ${reply.messages.map((m) => html`<li><a class="chip" href="#${prefix}--messages--${m.anchor}">${m.title ?? m.name ?? m.id}</a></li>`)}
            </ul>
          </div>`
        : nothing}
      ${reply.channel && reply.channel.bindings.length > 0
        ? html`<div class="reply__row reply__row--bindings">
            <span class="label">Bindings</span>
            <ul class="chips">
              ${reply.channel.bindings.flatMap((b) => flattenBinding(b).map((leaf) => bindingChip('reply.channel.', b.protocol, leaf, `${b.protocol} binding of the reply channel`, 'pill')))}
            </ul>
          </div>`
        : nothing}
    </div>
  </div>`;
}
