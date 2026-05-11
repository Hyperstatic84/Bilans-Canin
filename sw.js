const CACHE = 'bilans-canin-v1';
const FILES = ['./canin-diagnostic.html', './icon.svg', './manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Only cache same-origin requests
  if(e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        var network = fetch(e.request).then(function(res) {
          if(res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
          }
          return res;
        }).catch(function(){ return cached; });
        return cached || network;
      })
    );
  }
});
