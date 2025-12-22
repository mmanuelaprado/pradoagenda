
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
 * Versão otimizada para evitar erros de 'Invalid URL' e 'Cross-Origin'.
 * Usamos um caminho relativo simples 'sw.js' que resolve corretamente
 * em relação à localização do index.html.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Registra o Service Worker usando um caminho relativo simples
    // Isso evita falhas na construção de objetos URL em ambientes restritos
    navigator.serviceWorker
      .register('sw.js')
      .then((registration) => {
        console.log('PWA: Service Worker registrado com sucesso no escopo:', registration.scope);
        
        // Monitoramento de atualizações
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('PWA: Nova versão disponível! Recarregue a página.');
                } else {
                  console.log('PWA: Conteúdo pronto para uso offline.');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        // Log amigável para erros comuns de ambiente de desenvolvimento
        const isSecurityError = error.name === 'SecurityError' || error.message.includes('origin');
        if (isSecurityError) {
          console.warn('PWA: Registro do SW bloqueado por restrições de origem ou segurança. Isso é comum em pré-visualizações do AI Studio. O PWA funcionará perfeitamente após o deploy final.');
        } else {
          console.error('PWA: Erro inesperado ao registrar Service Worker:', error);
        }
      });
  });
}

// Escuta o evento de instalação para Android/Chrome
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: O aplicativo pode ser instalado no dispositivo.');
});
