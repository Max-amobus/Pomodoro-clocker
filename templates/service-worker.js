const CACHE_NAME = 'pomodoro-cache-v2';
const urlsToCache = [
  '/',
  '/static/css/timer.css',
  '/static/js/timer.js',
  '/static/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Видаляємо старий кеш (v1), щоб він не заважав
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Стратегія Network-First (Спочатку мережа, потім кеш)
self.addEventListener('fetch', event => {
  // Ігноруємо POST-запити (наприклад, збереження сесій), їх не можна кешувати
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Якщо запит успішний (є інтернет), оновлюємо кеш свіжою копією
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Якщо інтернету немає, намагаємося віддати файл із кешу
        return caches.match(event.request);
      })
  );
});