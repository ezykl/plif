import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./pwa";

describe("registerServiceWorker", () => {
  const originalServiceWorker = navigator.serviceWorker;

  afterEach(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: originalServiceWorker,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it("returns null when serviceWorker is not supported in navigator", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const reg = await registerServiceWorker();
    expect(reg).toBeNull();
  });

  it("registers default /sw.js when serviceWorker is supported and resolves", async () => {
    const mockRegistration = {
      scope: "/",
      active: null,
      installing: null,
      waiting: null,
    } as unknown as ServiceWorkerRegistration;

    const registerMock = vi.fn().mockResolvedValue(mockRegistration);
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: registerMock },
      configurable: true,
      writable: true,
    });

    const reg = await registerServiceWorker();
    expect(registerMock).toHaveBeenCalledWith("/sw.js");
    expect(reg).toBe(mockRegistration);
  });

  it("registers custom swUrl when provided", async () => {
    const mockRegistration = {
      scope: "/custom/",
    } as unknown as ServiceWorkerRegistration;

    const registerMock = vi.fn().mockResolvedValue(mockRegistration);
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: registerMock },
      configurable: true,
      writable: true,
    });

    const reg = await registerServiceWorker("/custom-sw.js");
    expect(registerMock).toHaveBeenCalledWith("/custom-sw.js");
    expect(reg).toBe(mockRegistration);
  });

  it("gracefully catches rejection and returns null", async () => {
    const registerMock = vi.fn().mockRejectedValue(new Error("SecurityError: Access denied"));
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: registerMock },
      configurable: true,
      writable: true,
    });

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const reg = await registerServiceWorker();
    expect(registerMock).toHaveBeenCalledWith("/sw.js");
    expect(reg).toBeNull();

    consoleWarnSpy.mockRestore();
  });

  it("posts precache URLs to the active service worker", async () => {
    const postMessage = vi.fn();
    const mockRegistration = { active: { postMessage } } as unknown as ServiceWorkerRegistration;
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
      },
      configurable: true,
      writable: true,
    });

    await registerServiceWorker("/sw.js", ["/assets/pdf.worker.min.mjs"]);
    expect(postMessage).toHaveBeenCalledWith({
      type: "CACHE_URLS",
      urls: ["/assets/pdf.worker.min.mjs"],
    });
  });

  it("supports subpath registration and precaching for GitHub Pages (/plif/sw.js)", async () => {
    const postMessage = vi.fn();
    const mockRegistration = {
      scope: "/plif/",
      active: { postMessage },
    } as unknown as ServiceWorkerRegistration;
    const registerMock = vi.fn().mockResolvedValue(mockRegistration);
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: registerMock,
        ready: Promise.resolve(mockRegistration),
      },
      configurable: true,
      writable: true,
    });

    const reg = await registerServiceWorker("/plif/sw.js", ["/plif/assets/pdf.worker.min.mjs"]);
    expect(registerMock).toHaveBeenCalledWith("/plif/sw.js");
    expect(postMessage).toHaveBeenCalledWith({
      type: "CACHE_URLS",
      urls: ["/plif/assets/pdf.worker.min.mjs"],
    });
    expect(reg).toBe(mockRegistration);
  });
});

describe("PWA assets verification", () => {
  it("has a valid manifest.webmanifest with all required properties", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");

    const manifestPath = path.resolve(__dirname, "../public/manifest.webmanifest");
    const content = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe("Plif Flipbook Studio");
    expect(manifest.short_name).toBe("Plif");
    expect(manifest.description).toBe(
      "Tactile, client-side digital flipbook creator and offline reader",
    );
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toBe("#fdfbf7");
    expect(manifest.theme_color).toBe("#24201d");
    expect(manifest.icons).toEqual([
      {
        src: "./icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ]);
  });

  it("has icon.svg containing all required brand palette colors", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");

    const iconPath = path.resolve(__dirname, "../public/icon.svg");
    const svg = await fs.readFile(iconPath, "utf-8");

    expect(svg).toContain("<svg");
    expect(svg).toContain("#fdfbf7");
    expect(svg).toContain("#f5efe6");
    expect(svg).toContain("#c25e3e");
    expect(svg).toContain("#24201d");
  });

  it("has sw.js with plif-studio-v2 cache name and offline caching strategies", async () => {
    const fs = await import("fs/promises");
    const path = await import("path");

    const swPath = path.resolve(__dirname, "../public/sw.js");
    const sw = await fs.readFile(swPath, "utf-8");

    expect(sw).toContain("plif-studio-v2");
    expect(sw).toContain("CACHE_URLS");
    expect(sw).toContain("skipWaiting");
    expect(sw).toContain("clients.claim");
    expect(sw).toContain("navigate");
    expect(sw).toContain("./index.html");
  });
});
