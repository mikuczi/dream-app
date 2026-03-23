// ── reverie Service Worker ──────────────────────────────────
const CACHE_SHELL   = 'reverie-shell-v1'
const CACHE_IMAGES  = 'reverie-images-v1'

const SHELL_URLS = ['/', '/index.html']

// ── Install: pre-cache the app shell ───────────────────────
self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_SHELL).then(cache => cache.addAll(SHELL_URLS))
  )
})

// ── Activate: delete old caches ────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_SHELL && k !== CACHE_IMAGES)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: route-based caching strategy ────────────────────
self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Skip non-GET and cross-origin (Firebase, Google Fonts, etc.)
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Images / photos → cache-first, background update
  if (/\.(png|jpe?g|svg|ico|webp)(\?.*)?$/.test(url.pathname) || url.pathname.startsWith('/photos/')) {
    e.respondWith(cacheFirst(request, CACHE_IMAGES))
    return
  }

  // JS / CSS assets (hashed filenames) → cache-first (immutable)
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(cacheFirst(request, CACHE_SHELL))
    return
  }

  // HTML navigation → network-first, fallback to cached shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          caches.open(CACHE_SHELL).then(c => c.put(request, res.clone()))
          return res
        })
        .catch(() => caches.match('/') )
    )
    return
  }

  // Everything else → network-first
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// ── Helpers ─────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const res = await fetch(request)
  if (res.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, res.clone())
  }
  return res
}

// ── Push notifications ───────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {
    title: 'reverie',
    body: 'Did you dream last night? Log it now.',
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      tag: 'dream-reminder',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        if (clients.length) return clients[0].focus()
        return self.clients.openWindow('/')
      })
  )
})
