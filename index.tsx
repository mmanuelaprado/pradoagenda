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

// Registro robusto do Service Worker para PWA
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    // Adicionamos um pequeno atraso (1s) para garantir que o navegador 
    // terminou de processar o estado do documento, evitando o "InvalidStateError"
    setTimeout(() => {
      const swUrl = `${window.location.origin}/sw.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('PWA: Service Worker registrado:', registration.scope);
        })
        .catch((error) => {
          // Tratamento amigável para ambientes de preview onde o SW pode ser bloqueado
          if (error.name === 'InvalidStateError' || error.message.includes('invalid state')) {
            console.warn('PWA: Registro ignorado (documento em transição ou ambiente restrito).');
          } else if (window.location.hostname.includes('usercontent.goog') || window.location.hostname.includes('localhost')) {
            console.warn('PWA: Registro falhou no ambiente de desenvolvimento:', error.message);
          } else {
            console.error('PWA: Erro no registro do Service Worker:', error);
          }
        });
    }, 1000);
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: Aplicativo pronto para instalação.');
});