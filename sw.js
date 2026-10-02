// SnoreGym Service Worker - Network-First with Cache Fallback Strategy
// Actualizado para soportar tcct.html (TCC para Tinnitus)
const CACHE_NAME = 'snoregym-v2';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './snoregym.html',
    './tcct.html',
    './at.html',
    './manifest-at.json',
    './css/bootstrap-index.min.css',
    './css/bootstrap-reducido.min.css',
    './css/bi-index.css',
    './css/bootstrap-icons.min.css',
    './purify/tcct.css',
    './js/audifonos-form.js',
    './js/oido-audio.js',
    './js/oido-ui.js',
    './js/rate-prompt.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js'
];

// Install event - pre-cache essential assets
self.addEventListener('install', event => {
    console.log('[SW] Install event');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching essential assets');
            return cache.addAll(URLS_TO_CACHE).catch(err => {
                console.log('[SW] Some assets could not be cached:', err);
                // Don't fail if some assets can't be cached
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activate event');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Claim all clients immediately
});

// Fetch event - Network-First Strategy with Cache Fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Network-First Strategy
    event.respondWith(
        fetch(request)
            .then(response => {
                // Only cache successful responses (status 200-299)
                if (response && response.status >= 200 && response.status < 300) {
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            })
            .catch(error => {
                // Network failed - try to return from cache
                console.log('[SW] Network request failed, trying cache:', request.url);
                return caches.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        console.log('[SW] Serving from cache:', request.url);
                        return cachedResponse;
                    }
                    
                    // Return a fallback response if neither network nor cache available
                    if (request.destination === 'document') {
                        return caches.match('./snoregym.html');
                    }
                    
                    // For other types, return a generic offline response
                    return new Response(
                        'Contenido no disponible. Por favor, verifica tu conexión a internet.',
                        { status: 503, statusText: 'Service Unavailable' }
                    );
                });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
