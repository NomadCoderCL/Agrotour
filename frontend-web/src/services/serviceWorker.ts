/**
 * Service Worker Registration Helper
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("[SW] Service Workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js",
      {
        scope: "/",
      }
    );

    console.log("[SW] Registered successfully:", registration);

    // Escuchar updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            console.log("[SW] New version activated, refresh needed");
            // Notificar al usuario
            if (window.confirm("Nueva versión disponible. ¿Recargar?")) {
              window.location.reload();
            }
          }
        });
      }
    });

    // Verificar updates periodicamente
    setInterval(() => {
      registration.update();
    }, 60000); // Cada minuto

    return registration;
  } catch (error) {
    console.error("[SW] Registration failed:", error);
    return null;
  }
}

/**
 * Enviar mensaje al Service Worker
 */
export function sendMessageToSW(message: any): Promise<any> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
    }
  });
}

/**
 * Verificar conectividad
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

export function setupConnectivityListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => {
    console.log("[NET] Online");
    onOnline();
  };

  const handleOffline = () => {
    console.log("[NET] Offline");
    onOffline();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
