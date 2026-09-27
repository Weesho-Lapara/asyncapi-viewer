import { html, type TemplateResult } from 'lit';
import type { Tag } from '../model/types.js';

/**
 * A tag chip. With a description it is focusable and shows it as a tooltip on hover and focus
 * (`.chip--tip`, pure CSS); the description is also in visually hidden text for screen readers.
 */
export function tagChip(tag: Tag): TemplateResult {
  if (!tag.description) return html`<li class="chip">${tag.name}</li>`;
  return html`<li class="chip chip--tip" data-tip=${tag.description} tabindex="0">
    ${tag.name}<span class="visually-hidden">: ${tag.description}</span>
  </li>`;
}
