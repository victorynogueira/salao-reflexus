const CACHE_NAME = 'reflexus-v1'
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/agenda',
  '/agendamento',
  '/clientes',
  '/servicos',
  '/financeiro',
  '/configuracoes',
  '/manifest.json',
  '/globals.css',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      })
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        const cacheCopy = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cacheCopy)
        })
        return response
      })
      return cached || fetchPromise
    }).catch(() => {
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('/login')
      }
    })
  )
})

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Salão Reflexus', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(event.notification.data?.url || '/')) {
          return client.focus()
        }
      }
      return clients.openWindow(event.notification.data?.url || '/dashboard')
    })
  )
})
