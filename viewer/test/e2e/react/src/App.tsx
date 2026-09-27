import { useEffect, useRef, useState, version } from 'react';
import type { AsyncAPIErrorEvent, AsyncAPILoadEvent, AsyncAPIViewerAttributes } from 'asyncapi-viewer';

type Theme = NonNullable<AsyncAPIViewerAttributes['theme']>;

// Documents copied into public/examples/ by build.mjs: the docs site examples and a few from the
// asyncapi/spec corpus.
const DOCUMENTS = [
  { file: 'orders-v3.yaml', label: 'Orders service (AsyncAPI 3, YAML)' },
  { file: 'accounts-v2.json', label: 'Accounts service (AsyncAPI 2, JSON)' },
  { file: 'streetlights-kafka-asyncapi.yml', label: 'Streetlights over Kafka (AsyncAPI 3)' },
  { file: 'adeo-kafka-request-reply-asyncapi.yml', label: 'Adeo request/reply (AsyncAPI 3)' },
  { file: 'gitter-streaming-asyncapi.yml', label: 'Gitter streaming (AsyncAPI 3)' },
];

const examples = `${import.meta.env.BASE_URL}examples/`;

export function App() {
  return (
    <main>
      <header className="intro">
        <h1>asyncapi-viewer in React</h1>
        <p>
          A React {version} app that installed the <code>asyncapi-viewer</code> npm package and renders{' '}
          <code>&lt;asyncapi-viewer&gt;</code> from JSX. Every attribute below is React state.
        </p>
      </header>
      <Playground />
      <FromObject />
      <section>
        <h2>A document that does not exist</h2>
        <MissingDocument />
      </section>
    </main>
  );
}

/** The error event: React 19 listens to a custom element's events through on<event-name>. */
function MissingDocument() {
  const [error, setError] = useState<string>();
  return (
    <>
      <p className="status" data-testid="missing-status">
        {error ?? 'Waiting for asyncapi-error…'}
      </p>
      <asyncapi-viewer
        id="react-missing"
        src={`${examples}nope.yaml`}
        onasyncapi-error={(e: AsyncAPIErrorEvent) => setError(`asyncapi-error: ${e.detail.error.kind} ${e.detail.error.status ?? ''}`.trim())}
      ></asyncapi-viewer>
    </>
  );
}

/** One viewer whose every attribute is bound to React state. */
function Playground() {
  const [file, setFile] = useState(DOCUMENTS[0].file);
  const [mounted, setMounted] = useState(true);
  const [sidebar, setSidebar] = useState(true);
  const [themeToggle, setThemeToggle] = useState(true);
  const [messageExamples, setMessageExamples] = useState(true);
  const [theme, setTheme] = useState<Theme>('auto');
  const [sendLabel, setSendLabel] = useState('SEND');
  const [status, setStatus] = useState('Loading…');
  const loads = useRef(0);

  const onLoad = (e: AsyncAPILoadEvent) => {
    const { model, specVersion, problems } = e.detail;
    loads.current += 1;
    setStatus(`Load ${loads.current}: ${model.title} · AsyncAPI ${specVersion} · ${model.operations.length} operations · ${problems.length} problems`);
  };

  return (
    <section>
      <h2>Playground</h2>
      <div className="controls">
        <label>
          Document{' '}
          <select data-testid="document" value={file} onChange={(e) => setFile(e.target.value)}>
            {DOCUMENTS.map((d) => (
              <option key={d.file} value={d.file}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Theme{' '}
          <select data-testid="theme" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="auto">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
        <label>
          Send label{' '}
          <input data-testid="send-label" value={sendLabel} size={10} onChange={(e) => setSendLabel(e.target.value)} />
        </label>
        <Check testId="mounted" checked={mounted} onChange={setMounted} label="Mounted" />
        <Check testId="sidebar" checked={sidebar} onChange={setSidebar} label="Sidebar" />
        <Check testId="theme-toggle" checked={themeToggle} onChange={setThemeToggle} label="Theme toggle" />
        <Check testId="message-examples" checked={messageExamples} onChange={setMessageExamples} label="Examples expanded" />
      </div>
      <p className="status" data-testid="load-status">
        {status}
      </p>
      {mounted && (
        // React 19 passes unknown props on custom elements as attributes: true becomes an empty
        // (bare) attribute, false removes it, strings pass through. className becomes class.
        <asyncapi-viewer
          id="react-playground"
          className="viewer"
          src={`${examples}${file}`}
          sidebar={sidebar}
          theme-toggle={themeToggle}
          message-examples={messageExamples ? 'true' : 'false'}
          theme={theme}
          send-label={sendLabel}
          onasyncapi-load={onLoad}
        ></asyncapi-viewer>
      )}
    </section>
  );
}

function Check({ testId, checked, onChange, label }: { testId: string; checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label>
      <input type="checkbox" data-testid={testId} checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

/**
 * A document held in React state as a plain object, handed to the viewer through a Blob URL: how
 * an editor, a generated spec or an API response gets rendered without a file.
 */
function FromObject() {
  const [events, setEvents] = useState(['created']);
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const document = {
      asyncapi: '3.0.0',
      info: { title: 'Built in React', version: `${events.length}.0.0`, description: 'This document is a JavaScript object in component state.' },
      channels: Object.fromEntries(
        events.map((e) => [e, { address: `things.${e}`, messages: { [e]: { name: `Thing${cap(e)}`, payload: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, at: { type: 'string', format: 'date-time' } } } } } }]),
      ),
      operations: Object.fromEntries(events.map((e) => [`on${cap(e)}`, { action: 'receive', channel: { $ref: `#/channels/${e}` } }])),
    };
    const next = URL.createObjectURL(new Blob([JSON.stringify(document)], { type: 'application/json' }));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [events]);

  const more = ['updated', 'deleted', 'archived', 'restored'].filter((e) => !events.includes(e));
  return (
    <section>
      <h2>From a JavaScript object</h2>
      <div className="controls">
        <button type="button" data-testid="add-event" disabled={!more.length} onClick={() => setEvents([...events, more[0]])}>
          Add a channel{more.length ? ` (${more[0]})` : ''}
        </button>
        <span data-testid="event-count">{events.length} channels</span>
      </div>
      {url && <asyncapi-viewer id="react-object" src={url}></asyncapi-viewer>}
    </section>
  );
}

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

// The shipped types are strict: a value outside an enum is a compile error, not a silent string.
// @ts-expect-error 'sepia' is not a theme
export const wrongTheme = <asyncapi-viewer src="x.yaml" theme="sepia"></asyncapi-viewer>;

// Plain DOM use is typed too (HTMLElementTagNameMap and HTMLElementEventMap), with no React involved.
export function plainDomUse(): void {
  const viewer = document.querySelector('asyncapi-viewer');
  viewer?.addEventListener('asyncapi-load', (e) => console.log(e.detail.model.operations.length, viewer.model?.title));
  viewer?.addEventListener('asyncapi-error', (e) => console.warn(e.detail.error.kind satisfies string));
}
