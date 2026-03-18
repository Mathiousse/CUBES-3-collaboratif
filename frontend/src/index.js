import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const event = new CustomEvent('swUpdate', { detail: registration });
    document.dispatchEvent(event);
  },
  onSuccess: () => {
    console.log('[PWA] App cached and ready for offline use.');
  },
});

reportWebVitals();
