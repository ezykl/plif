/**
 * Registers the Plif offline service worker when supported.
 *
 * @param swUrl - Optional path to the service worker script (defaults to "/sw.js").
 * @returns The ServiceWorkerRegistration instance on success, or null if unsupported/failed.
 */
export async function registerServiceWorker(
  swUrl: string = "/sw.js",
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
    return registration;
  } catch (error) {
    console.warn("Service worker registration failed:", error);
    return null;
  }
}
