// WealthTrack Service Worker v2.1
const CACHE = 'wealthtrack-v2';
const ASSETS = [
  '/wealthtrack/',
  '/wealthtrack/index.html',
  '/wealthtrack/manifest.json',
  '/wealthtrack/icons/icon-192.png',
  '/wealthtrack/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS);
    }).catch(err => console.log('Cache failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/wealthtrack/index.html'));
    })
  );
});

// Background sync support
self.addEventListener('sync', e => {
  if (e.tag === 'sync-transactions') {
    console.log('Background sync triggered');
  }
});
