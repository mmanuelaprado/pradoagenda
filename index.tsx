
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

// Registro resiliente do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Verifica se estamos em localhost ou domínio seguro para evitar erros de origem em previews
      const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '[::1]' ||
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
      );

      // Só tenta registrar se não estiver em um frame restrito ou se for HTTPS
      if (window.location.protocol === 'https:' || isLocalhost) {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('SW registrado com sucesso:', registration.scope);
      }
    } catch (error) {
      // Silencia erros de origem em ambientes de desenvolvimento (Studio/Frames)
      console.warn('Registro de Service Worker ignorado neste ambiente:', error);
    }
  });
}
