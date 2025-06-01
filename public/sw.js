// Service Worker for ChatBuddy
const CACHE_NAME = "chatbuddy-cache-v1";

// Assets to cache for offline use
const assetsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/click.mp3",
  "/send.mp3",
  "/receive.mp3",
  "/error.mp3",
  "/typing.mp3",
  "/images/icons/sun.png",
  "/images/icons/moon.png",
  "/images/icons/sound-on.png",
  "/images/icons/sound-off.png",
  "/images/icons/user.png",
];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Take control immediately

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Stale-while-revalidate strategy
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests and API calls
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Cache the updated file for future use
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Return null on network error
            return null;
          });

        // Return cached response immediately, or fall back to network request
        return cachedResponse || fetchPromise;
      });
    })
  );
});
