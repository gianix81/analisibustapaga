const CACHE_NAME = 'payanalyst-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // Non includere index.tsx o altri file TSX qui, 
  // verranno salvati in cache dinamicamente durante il fetch.
];

// Install event: open cache and add app shell files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened, adding app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache, fallback to network, then cache the new resource
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Non gestire richieste a API di terze parti come Gemini
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If the resource is in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the resource is not in the cache, fetch it from the network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            if (
              !networkResponse || 
              networkResponse.status !== 200 ||
              // Non salvare in cache risposte opache (es. da CDN senza CORS)
              networkResponse.type === 'opaque'
            ) {
              return networkResponse;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the new resource for future use
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            // Qui potresti restituire una pagina di fallback offline se ne avessi una.
        });
      })
  );
});


// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});