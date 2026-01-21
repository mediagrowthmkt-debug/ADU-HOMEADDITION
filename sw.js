// Service Worker para PWA e Cache Offline
// Versão: 1.0.8
// Gerado em: 2025-01-20

const CACHE_NAME = 'wolf-additions-v8';
const STATIC_CACHE = 'static-v7';
const IMAGE_CACHE = 'images-v7';

// Recursos críticos para cache imediato
const CRITICAL_ASSETS = [
  '/ADU-HOMEADDITION/home-additions.html',
  '/ADU-HOMEADDITION/styles.min.css',
  '/ADU-HOMEADDITION/scripts.min.js',
  '/ADU-HOMEADDITION/0 - Brand Logo/brand-logo-wolfcarpenters.png'
];

// Install - Cache recursos críticos
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Estratégia: Cache First para imagens, Network First para HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de outros domínios (exceto fontes)
  if (url.origin !== location.origin && !url.href.includes('fonts.googleapis.com')) {
    return;
  }

  // Estratégia para imagens: Cache First com fallback para Network
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }

          return fetch(request).then(networkResponse => {
            // Cache apenas respostas bem-sucedidas
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Retorna placeholder se offline
            return new Response(
              '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f5f6f7"/><text x="50%" y="50%" text-anchor="middle" fill="#666">Imagem não disponível offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
        });
      })
    );
    return;
  }

  // Estratégia para CSS/JS: Cache First
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(networkResponse => {
          return caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Estratégia para HTML: Network First com Cache Fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            return response || caches.match('/ADU-HOMEADDITION/home-additions.html');
          });
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Background Sync para formulários offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    console.log('🔄 Service Worker: Syncing offline form submissions');
    event.waitUntil(syncOfflineForms());
  }
});

async function syncOfflineForms() {
  // Implementar lógica de sincronização de formulários quando voltar online
  console.log('📤 Syncing pending form submissions...');
}

// Push Notifications (futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/ADU-HOMEADDITION/0 - Brand Logo/brand-logo-wolfcarpenters.png',
    badge: '/ADU-HOMEADDITION/0 - Brand Logo/brand-logo-wolfcarpenters.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Wolf Carpenters', options)
  );
});

console.log('🚀 Service Worker: Loaded and ready!');
