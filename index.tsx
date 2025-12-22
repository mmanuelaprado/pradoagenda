
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
 * 
 * Este bloco garante que o app seja reconhecido como instalável.
 * O uso de caminho relativo './sw.js' é fundamental para o funcionamento no Vercel.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('PWA: Service Worker ativo no escopo:', registration.scope);
      })
      .catch((error) => {
        // No AI Studio (preview), este erro de origem é comum.
        // No domínio final (Vercel), funcionará automaticamente.
        if (error.name === 'SecurityError') {
          console.warn('PWA: Registro de SW suspenso no ambiente de preview. Funcionará após o deploy.');
        } else {
          console.error('PWA: Falha ao registrar Service Worker:', error);
        }
      });
  });
}

// Escuta o evento que permite ao navegador sugerir a instalação
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: O sistema está pronto para ser instalado como App.');
});
