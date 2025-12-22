
const CACHE_NAME = 'prado-agenda-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon/favicon.png'
];

/**
 * INSTALAÇÃO: Armazena em cache os recursos estáticos principais
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA SW: Cache inicializado');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('PWA SW: Falha ao cachear alguns recursos iniciais', err);
      });
    })
  );
  self.skipWaiting();
});

/**
 * ATIVAÇÃO: Remove caches antigos de versões anteriores
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('PWA SW: Removendo cache obsoleto:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

/**
 * BUSCA (FETCH): Estratégia Stale-While-Revalidate
 * Tenta carregar do cache para velocidade, enquanto busca atualização na rede.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;

  // Só aplicamos cache em requisições GET para recursos da própria origem
  if (event.request.method !== 'GET' || !isLocal) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Se a resposta for válida, atualizamos o cache em background
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Em caso de falha de rede (offline), retorna o que estiver no cache
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
