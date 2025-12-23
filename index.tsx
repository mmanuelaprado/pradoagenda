
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

// Registro robusto do Service Worker para PWA (Google Play / Android)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = './sw.js';
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('PWA: Service Worker registrado com escopo:', registration.scope);
        
        // Verifica atualizações do SW
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('PWA: Nova versão disponível! Por favor, recarregue.');
                } else {
                  console.log('PWA: Conteúdo cacheado para uso offline.');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('PWA: Erro no registro do Service Worker:', error);
      });
  });
}

// Escuta evento de instalação (Prompt)
window.addEventListener('beforeinstallprompt', (e) => {
  // Opcional: Salvar o evento para disparar o prompt em um botão personalizado
  console.log('PWA: Aplicativo pronto para instalação.');
});
