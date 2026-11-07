import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseManifest } from "@plif/core";
import { PlifBookElement } from "./web-component";

vi.mock("page-flip", () => ({
  PageFlip: vi.fn(() => ({
    destroy: vi.fn(),
    loadFromImages: vi.fn(),
    getPage: vi.fn(() => ({ setDensity: vi.fn() })),
  })),
}));

const mockManifest = {
  version: "1.0.0",
  title: "Test Book",
  pageSize: { width: 500, height: 700 },
  hasCover: false,
  pages: [{ src: "https://example.com/page1.jpg" }],
};

describe("<plif-book> custom element", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockManifest), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("registers plif-book in customElements registry", () => {
    expect(customElements.get("plif-book")).toBe(PlifBookElement);
  });

  it("creates an instance with observed attributes", () => {
    const el = document.createElement("plif-book") as PlifBookElement;
    expect(el).toBeInstanceOf(PlifBookElement);
    expect(PlifBookElement.observedAttributes).toEqual(["src", "theme", "direction"]);
  });

  it("updates attributes cleanly and fetches manifest", async () => {
    const el = document.createElement("plif-book") as PlifBookElement;
    document.body.appendChild(el);
    el.setAttribute("src", "https://example.com/manifest.json");
    el.setAttribute("direction", "rtl");
    expect(el.getAttribute("src")).toBe("https://example.com/manifest.json");
    expect(el.getAttribute("direction")).toBe("rtl");

    // Allow async loadFromUrl to settle
    await vi.waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("https://example.com/manifest.json");
    });

    document.body.removeChild(el);
  });
  describe("attribute overrides", () => {
    const manifest = parseManifest({
      version: 1,
      title: "Book",
      pageSize: { width: 500, height: 700 },
      direction: "ltr",
      theme: "magazine",
      pages: [{ src: "https://example.com/p1.jpg" }],
    });

    function mount(attrs: Record<string, string>): PlifBookElement {
      const el = document.createElement("plif-book") as PlifBookElement;
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      document.body.appendChild(el);
      return el;
    }

    it("applies direction attribute over the manifest", () => {
      const el = mount({ direction: "rtl" });
      el.renderManifest(manifest);
      expect(el.querySelector("div")?.getAttribute("dir")).toBe("rtl");
      el.remove();
    });

    it("re-renders when the direction attribute changes", () => {
      const el = mount({});
      el.renderManifest(manifest);
      expect(el.querySelector("div")?.getAttribute("dir")).toBe("ltr");
      el.setAttribute("direction", "rtl");
      expect(el.querySelector("div")?.getAttribute("dir")).toBe("rtl");
      el.remove();
    });

    it("ignores invalid attribute values", () => {
      const el = mount({ direction: "sideways" });
      el.renderManifest(manifest);
      expect(el.querySelector("div")?.getAttribute("dir")).toBe("ltr");
      el.remove();
    });
  });
});
