/**
 * Service Worker
 * Caching offline y sincronización en background
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `agrotour-${CACHE_VERSION}`;

// Assets estáticos a cachear
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

// Rutas de API que se cachearan
const CACHE_PATTERNS = {
  // Cachear indefinidamente
  PERMANENT: [/\/api\/ubicaciones\//, /\/api\/productos\?/],
  // Cachear con expiration
  TEMPORARY: [/\/api\/ventas\//, /\/api\/visitas\//],
};

/**
 * Install: Cachear assets estáticos
 */
self.addEventListener("install", (event: ExtendableEvent) => {
  console.log("[SW] Install event");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.warn("[SW] Error caching assets", error);
      });
    })
  );

  // Activar inmediatamente el nuevo SW
  self.skipWaiting();
});

/**
 * Activate: Limpiar caches antiguos
 */
self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control de clientes inmediatamente
  self.clients.claim();
});

/**
 * Fetch: Estrategia Cache-First / Network-First
 */
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear GET requests
  if (request.method !== "GET") {
    return;
  }

  // Ignorar requests a /sync/ (siempre online)
  if (url.pathname.includes("/sync/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "Offline - Sync not available",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Cache static assets
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Cache API calls (network-first)
  if (isAPICall(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

/**
 * Estrategia: Cache-First
 * Usa cache si existe, sino hace fetch
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("[SW] Cache hit:", request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Fetch failed:", error);
    return cacheOrOfflineFallback(request);
  }
}

/**
 * Estrategia: Network-First
 * Intenta fetch primero, usa cache si falla
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    return cacheOrOfflineFallback(request);
  }
}

/**
 * Fallback: retornar cache o respuesta offline
 */
async function cacheOrOfflineFallback(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("[SW] Returning cached response:", request.url);
    return cachedResponse;
  }

  // Offline fallback
  console.log("[SW] No cache available, returning offline page");

  return new Response(
    JSON.stringify({
      error: "Offline",
      message: "No cache available for this resource",
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Helpers
 */
function isStaticAsset(url: URL): boolean {
  const pathname = url.pathname;
  return (
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2")
  );
}

function isAPICall(url: URL): boolean {
  return url.pathname.startsWith("/api/");
}

/**
 * Message handler: comunicación con cliente
 */
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  console.log("[SW] Message received:", event.data);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data.type === "GET_CACHE_SIZE") {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((requests) => {
        event.ports[0].postMessage({
          cacheSize: requests.length,
          requests: requests.map((r) => r.url),
        });
      });
    });
  }
});

export {};
