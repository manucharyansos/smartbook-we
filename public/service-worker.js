self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const registrations = await self.registration.unregister().catch(() => false);
    const keys = await caches.keys().catch(() => []);
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();
    return registrations;
  })());
});
self.addEventListener('fetch', () => {});
