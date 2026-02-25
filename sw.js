const CACHE_NAME = 'snack-check-v2';
const STATIC_URLS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './nutrition-analyze.js',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_URLS).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  if (e.request.url.startsWith('http') && (e.request.url.indexOf(self.location.host) !== -1 || e.request.url.indexOf('cdn.jsdelivr.net') !== -1)) {
    e.respondWith(
      caches.match(e.request).then(function (r) {
        return r || fetch(e.request).then(function (res) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(function (c) { c.put(e.request, clone); });
          return res;
        });
      })
    );
  }
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
