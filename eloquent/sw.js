// No-op service worker — exists only so browsers can fetch it
// and detect it changed, triggering unregistration from index.html cleanup script.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.map(c => caches.delete(c)))));
  self.clients.claim();
});
