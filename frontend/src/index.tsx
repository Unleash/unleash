import 'whatwg-fetch';
import 'themes/app.css';
import 'regenerator-runtime/runtime';

import ReactDOM from 'react-dom/client';
import { ApplicationRoot } from './ApplicationRoot.tsx';

window.global ||= window;

// Keep this file free of component definitions for HMR to work.
ReactDOM.createRoot(document.getElementById('app')!).render(
    <ApplicationRoot />,
);
