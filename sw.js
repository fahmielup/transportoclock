const CACHE_NAME = 'transportoclock-v1';
const ASSETS = ['/', '/index.html', '/alarm.mp3', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.payload ? e.payload.json() : {};
  const title = data.title || '🔔 Pickup Time!';
  const options = {
    body: data.body || 'Waktu pickup telah tiba',
    icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22%3E%3Crect width=%22192%22 height=%22192%22 fill=%22%231a1a2e%22 rx=%2230%22/%3E%3Ctext x=%2296%22 y=%22130%22 font-size=%22100%22 text-anchor=%22middle%22%3E%F0%9F%9A%90%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22%3E%3Ctext x=%2248%22 y=%2270%22 font-size=%2250%22 text-anchor=%22middle%22%3E%F0%9F%94%94%3C/text%3E%3C/svg%3E',
    vibrate: [500, 200, 500, 200, 500, 200, 500],
    requireInteraction: true,
    tag: data.tag || 'transportoclock',
    data: { url: '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(clientList => {
    for (const client of clientList) {
      if (client.url.includes('transportoclock') && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow('/');
  }));
});
