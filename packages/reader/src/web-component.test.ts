import { describe, expect, it, vi, beforeEach } from "vitest";
import { PlifBookElement } from "./web-component";

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
});
