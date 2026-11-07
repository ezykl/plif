/* global self, caches, fetch, URL */
// Plif Offline Service Worker
const CACHE_NAME = "plif-studio-v2";
const PRECACHE_ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

// The app asks the worker to cache extra same-origin assets (e.g. the PDF.js worker).
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;
  const sameOrigin = data.urls.filter((u) => {
    try {
      return new URL(u, self.location.href).origin === self.location.origin;
    } catch {
      return false;
    }
  });
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(sameOrigin))
      .catch(() => {}),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET requests with http/https protocols
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // HTML navigation requests: Network-first with cached index.html fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("./index.html");
          if (fallback) return fallback;
          return caches.match("/");
        }),
    );
    return;
  }

  // Same-origin static assets: Stale-while-revalidate / Cache-first strategy
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
                .catch(() => {});
            }
            return networkResponse;
          })
          .catch((error) => {
            if (cachedResponse) return cachedResponse;
            throw error;
          });

        if (cachedResponse) {
          event.waitUntil(networkFetch);
          return cachedResponse;
        }

        return networkFetch;
      }),
    );
    return;
  }

  // Cross-origin requests: Allow browser default handling without interception
});
