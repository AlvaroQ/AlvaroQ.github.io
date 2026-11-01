// Kill switch for the service worker the previous version of this site registered at /sw.js.
// Returning visitors' browsers fetch this file on their next update check: it clears the old
// caches, unregisters itself and reloads open tabs so they are served from the network again.
// Safe to delete once old registrations have expired (see CLAUDE.md, Deploy).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })(),
  );
});
