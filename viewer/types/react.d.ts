/**
 * JSX typing for <asyncapi-viewer> in React 19. Opt in once, anywhere in the app:
 *
 *   import type {} from 'asyncapi-viewer/react';
 *
 * Attributes are the element's kebab-case names; booleans may be passed as true/false (React 19
 * writes true as a bare attribute and removes false). Events use React 19's custom element
 * convention: `onasyncapi-load` and `onasyncapi-error`.
 */
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { AsyncAPIErrorEvent, AsyncAPILoadEvent, AsyncAPIViewerAttributes, AsyncAPIViewerElement } from 'asyncapi-viewer';

export interface AsyncAPIViewerJSXProps
  extends Omit<DetailedHTMLProps<HTMLAttributes<AsyncAPIViewerElement>, AsyncAPIViewerElement>, keyof AsyncAPIViewerAttributes>,
    AsyncAPIViewerAttributes {
  /** The document loaded and rendered. */
  'onasyncapi-load'?: (event: AsyncAPILoadEvent) => void;
  /** The document could not be loaded; the viewer shows the error in place. */
  'onasyncapi-error'?: (event: AsyncAPIErrorEvent) => void;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'asyncapi-viewer': AsyncAPIViewerJSXProps;
    }
  }
}
