const CACHE_NAME = "clc-rpg-v290-3";
const FALLBACK_INDEX = "./index.html";

function canonicalRequest(request) {
  const url = new URL(request.url);
  // Cache one canonical copy per path; ?cloud=1 / ?v=... cannot become separate stale shells.
  url.search = "";
  url.hash = "";
  return new Request(url.toString(), { method: "GET" });
}

self.addEventListener("install", event => {
  // Don't precache HTML here. It avoids capturing a GitHub Pages edge-cache copy during deployment.
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith("clc-rpg") && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();

    // Optional navigation preload: speeds network-first navigations where supported.
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) {}
    }
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Supabase / Google / CDN requests stay completely outside the service-worker cache.
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cacheKey = canonicalRequest(request);

    try {
      // For navigation, use preload response first when available; otherwise hit network.
      let response = null;
      if (request.mode === "navigate" && event.preloadResponse) {
        try { response = await event.preloadResponse; } catch (e) {}
      }
      if (!response) {
        response = await fetch(request, { cache: "no-store" });
      }

      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheKey, response.clone());
      }
      return response;
    } catch (networkError) {
      const cached = await caches.match(cacheKey);
      if (cached) return cached;

      if (request.mode === "navigate") {
        const fallbackUrl = new URL(FALLBACK_INDEX, self.location.href);
        const fallback = await caches.match(canonicalRequest(new Request(fallbackUrl)));
        if (fallback) return fallback;
      }

      return Response.error();
    }
  })());
});
