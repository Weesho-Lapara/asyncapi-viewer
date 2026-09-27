import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// What a React app does after `npm install asyncapi-viewer`: import the module once (it defines
// <asyncapi-viewer>) and, optionally, the theme file.
import 'asyncapi-viewer';
import 'asyncapi-viewer/theme/asyncapi-theme.css';
import './app.css';
import { App } from './App.jsx';

// StrictMode mounts, unmounts and remounts every component once under `npm run dev`, the
// harshest lifecycle a custom element meets in React; the tested build is a production one.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
