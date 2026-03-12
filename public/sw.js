// Dream Journal Service Worker — morning reminder notifications

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// Handle push events (phase 2 — Twilio/VAPID)
self.addEventListener('push', e => {
  const data = e.data?.json() ?? { title: 'Dream Journal', body: 'Did you dream last night? Log it now.' }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'dream-reminder',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length) return clients[0].focus()
      return self.clients.openWindow('/')
    })
  )
})
