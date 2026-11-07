/**
 * Registers the Plif offline service worker when supported.
 *
 * @param swUrl - Optional path to the service worker script (defaults to "/sw.js").
 * @param precacheUrls - Extra same-origin URLs (e.g. the PDF worker) the service worker should cache.
 * @returns The ServiceWorkerRegistration instance on success, or null if unsupported/failed.
 */
export async function registerServiceWorker(
  swUrl: string = `${import.meta.env.BASE_URL ?? "/"}sw.js`,
  precacheUrls: readonly string[] = [],
): Promise<ServiceWorkerRegistration | null> {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    !navigator.serviceWorker
  ) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    if (precacheUrls.length > 0) {
      const ready = navigator.serviceWorker.ready
        ? await navigator.serviceWorker.ready
        : registration;
      const worker = ready.active ?? registration.active;
      worker?.postMessage({ type: "CACHE_URLS", urls: [...precacheUrls] });
    }
    return registration;
  } catch (error) {
    console.warn("Service worker registration failed:", error);
    return null;
  }
}
