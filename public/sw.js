/* ==========================================================================
   EKSPLOR TANGGAMUS - Progressive Web App Service Worker (sw.js)
   Offline Caching & Network Fallback Strategy
   ========================================================================== */

const CACHE_NAME = 'tanggamus-v2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json',
  './favicon.svg',
  './manifest.json',
  './Gambar/kiluan.jpg',
  './Gambar/gigi-hiu.jpg',
  './Gambar/way-lalaan.jpg',
  './Gambar/batutegi.jpg',
  './Gambar/muara-indah.jpg',
  './Gambar/gunung-tanggamus.jpg',
  './Gambar/danau-hijau-ulubelu.jpg',
  './Gambar/gulai-taboh.jpg',
  './Gambar/seruit-lampung.jpg',
  './Gambar/kopi-ulubelu.jpg'
];

// Install Event - Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip cross-origin API calls like Open-Meteo or external images if offline
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return offline fallback if network fails
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
