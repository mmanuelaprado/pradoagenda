
const CACHE_NAME = 'prado-agenda-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon/favicon.png'
];

// Instalação: Cacheia os recursos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptação de requisições: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Ignorar requisições do Supabase ou de outros domínios para cache agressivo
  // Manter cache apenas para arquivos locais da aplicação
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Se a requisição for local e bem sucedida, atualiza o cache
        if (isLocal && networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Em caso de falha de rede (offline)
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
