/**
 * Public types for the element: the events it dispatches and the attributes it accepts.
 *
 * Both events bubble and cross shadow roots. They fire once per `src`, after the viewer has
 * rendered the result, so a listener can already find the rendered sections. Rebuilding the model
 * because a label option changed does not fire them again.
 */
import type { LoadError } from './load/loader.js';
import type { Document, Problem } from './model/types.js';
import type { AsyncAPIViewerElement } from './element.js';

export interface AsyncAPILoadDetail {
  /** The document URL, resolved against the page. */
  url: string;
  /** Exact `asyncapi` field, e.g. "3.0.0". */
  specVersion: string;
  specMajor: 2 | 3;
  /** The normalised model the viewer renders. */
  model: Document;
  /** Reference and normalisation problems (the Problems panel); empty when there are none. */
  problems: readonly Problem[];
}

export interface AsyncAPIErrorDetail {
  /** The document URL, resolved against the page. */
  url: string;
  /** Why the document could not be shown: network, HTTP status, parse or version failure. */
  error: LoadError;
}

/** `asyncapi-load`: the document loaded and rendered. */
export type AsyncAPILoadEvent = CustomEvent<AsyncAPILoadDetail>;
/** `asyncapi-error`: the document could not be loaded; the viewer shows the error in place. */
export type AsyncAPIErrorEvent = CustomEvent<AsyncAPIErrorDetail>;

/** Values the element reads as true or false (case-insensitive); an empty or bare attribute is true. */
export type BooleanAttribute = boolean | '' | 'true' | 'false' | '1' | '0' | 'yes' | 'no' | 'on' | 'off';

/**
 * Every attribute of `<asyncapi-viewer>` in its kebab-case spelling, as written in HTML or JSX.
 * Mirrors options.schema.json; a unit test keeps the two in step. Booleans are for frameworks
 * that turn `true` into a bare attribute and `false` into none (React 19, Vue, Svelte, Lit).
 */
export interface AsyncAPIViewerAttributes {
  /** The AsyncAPI document (JSON or YAML), as a path or URL relative to the page. Required. */
  src?: string;
  /** Element id; also prefixes every anchor inside the viewer. Generated when absent. */
  id?: string;
  /** Show the navigation column; a drawer behind a menu button on narrow containers. Default false. */
  sidebar?: BooleanAttribute;
  /** Show the Info section. Default true. */
  info?: BooleanAttribute;
  /** Show the Servers section and the server selector. Default true. */
  servers?: BooleanAttribute;
  /** Show the operations. Default true. */
  operations?: BooleanAttribute;
  /** Show the Messages section (component messages). Default true. */
  messages?: BooleanAttribute;
  /** Show the Schemas section (component schemas). Default true. */
  schemas?: BooleanAttribute;
  /** Show the load and validation problems panel. Default true. */
  errors?: BooleanAttribute;
  /** Show examples in the Messages section. Default false. */
  'show-message-examples'?: BooleanAttribute;
  /** Example panels start expanded; false starts them collapsed. Default true. */
  'message-examples'?: BooleanAttribute;
  /** Sidebar grouping for servers. Default byDefault. */
  'show-servers'?: 'byDefault' | 'bySpecTags' | 'byServersTags';
  /** Sidebar grouping for operations. Default byDefault. */
  'show-operations'?: 'byDefault' | 'bySpecTags' | 'byOperationsTags';
  /** AsyncAPI 3: label operations by channel address instead of title. Default false. */
  'use-channel-address-as-identifier'?: BooleanAttribute;
  /** Badge text for AsyncAPI 2 publish operations. Default PUB. */
  'publish-label'?: string;
  /** Badge text for AsyncAPI 2 subscribe operations. Default SUB. */
  'subscribe-label'?: string;
  /** Badge text for AsyncAPI 3 send operations. Default SEND. */
  'send-label'?: string;
  /** Badge text for AsyncAPI 3 receive operations. Default RECEIVE. */
  'receive-label'?: string;
  /** Badge text for AsyncAPI 3 send operations that carry a reply. Default REQUEST. */
  'request-label'?: string;
  /** Badge text for AsyncAPI 3 receive operations that carry a reply. Default REPLY. */
  'reply-label'?: string;
  /** JSON object; only `{"applyTraits": false}` changes anything. */
  'parser-options'?: string;
  /** @deprecated Accepted, warns once, does nothing. */
  'schema-id'?: string;
  /** auto follows the host page (Material scheme, html[data-theme], prefers-color-scheme). Default auto. */
  theme?: 'auto' | 'light' | 'dark';
  /** Show a light/dark toggle in the viewer header. Default false. */
  'theme-toggle'?: BooleanAttribute;
  /** Keep the Info, Servers, Messages and Schemas links visible while a sidebar search query is active. Default false. */
  'search-keep-sections'?: BooleanAttribute;
}

declare global {
  interface HTMLElementTagNameMap {
    'asyncapi-viewer': AsyncAPIViewerElement;
  }
  interface HTMLElementEventMap {
    'asyncapi-load': AsyncAPILoadEvent;
    'asyncapi-error': AsyncAPIErrorEvent;
  }
}
