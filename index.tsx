import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * REGISTRO PWA (Service Worker)
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usamos o caminho absoluto /sw.js. 
    // Em ambientes de preview (como AI Studio), o navegador pode bloquear por política de origem,
    // então tratamos o erro graciosamente.
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('PWA: Service Worker ativo no escopo:', registration.scope);
      })
      .catch((error) => {
        if (error.message && error.message.includes('origin')) {
          console.warn('PWA: Registro de Service Worker ignorado devido a restrição de origem (comum em ambiente de preview).');
        } else {
          console.error('PWA: Falha ao registrar Service Worker:', error);
        }
      });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: O sistema está pronto para ser instalado como App.');
});