import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Could not find root element to mount to");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Render error:", err);
    rootElement.innerHTML = `<div style="padding: 40px; text-align: center;">
      <h1 style="color: #FF1493;">Prado Agenda</h1>
      <p>Erro ao iniciar aplicação. Por favor, limpe o cache do navegador e tente novamente.</p>
    </div>`;
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: O sistema está pronto para ser instalado como App.');
});