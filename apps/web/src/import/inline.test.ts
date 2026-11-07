import { afterEach, describe, expect, it, vi } from "vitest";
import { parseManifest } from "@plif/core";
import { blobUrlToDataUrl, inlineManifestPages } from "./inline";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("blobUrlToDataUrl", () => {
  it("passes through non-blob URLs unchanged", async () => {
    expect(await blobUrlToDataUrl("https://x.test/a.webp")).toBe("https://x.test/a.webp");
    expect(await blobUrlToDataUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("converts blob URLs to data URLs", async () => {
    const blob = new Blob(["hello"], { type: "text/plain" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }),
    );
    const result = await blobUrlToDataUrl("blob:http://localhost/abc");
    expect(result.startsWith("data:text/plain;base64,")).toBe(true);
  });

  it("throws when the blob cannot be fetched", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(blobUrlToDataUrl("blob:http://localhost/gone")).rejects.toThrow();
  });
});

describe("inlineManifestPages", () => {
  it("inlines blob pages and preserves alt and density", async () => {
    const blob = new Blob(["x"], { type: "image/webp" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }),
    );
    const manifest = parseManifest({
      version: 1,
      title: "T",
      pageSize: { width: 10, height: 10 },
      pages: [
        { src: "blob:http://localhost/1", alt: "one", density: "hard" },
        { src: "https://x.test/2.webp" },
      ],
    });
    const out = await inlineManifestPages(manifest);
    expect(out.pages[0]?.src.startsWith("data:image/webp;base64,")).toBe(true);
    expect(out.pages[0]?.alt).toBe("one");
    expect(out.pages[0]?.density).toBe("hard");
    expect(out.pages[1]?.src).toBe("https://x.test/2.webp");
  });
});
