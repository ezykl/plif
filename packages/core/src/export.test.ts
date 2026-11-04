import { describe, expect, it } from "vitest";
import {
  generateIframeEmbed,
  generateStandaloneHtml,
  generateWebComponentEmbed,
  parseManifest,
} from "./index";

const manifest = parseManifest({
  version: 1,
  title: "School Paper",
  pageSize: { width: 480, height: 679 },
  hasCover: true,
  theme: "magazine",
  direction: "ltr",
  pages: [{ src: "p1.webp" }, { src: "p2.webp" }],
});

describe("embed and export in @plif/core", () => {
  it("generates responsive iframe embed code", () => {
    const iframe = generateIframeEmbed({
      src: "https://plif.app/b/abc123",
      title: "School Paper",
    });
    expect(iframe).toContain('<iframe src="https://plif.app/b/abc123"');
    expect(iframe).toContain('title="School Paper"');
    expect(iframe).toContain("allowfullscreen");
  });

  it("generates web component embed snippet", () => {
    const snippet = generateWebComponentEmbed({
      manifestUrl: "https://example.com/manifest.json",
      scriptUrl: "https://unpkg.com/@plif/reader/dist/plif-book.js",
    });
    expect(snippet).toContain(
      '<script type="module" src="https://unpkg.com/@plif/reader/dist/plif-book.js"></script>',
    );
    expect(snippet).toContain('<plif-book src="https://example.com/manifest.json"');
  });

  it("generates a complete standalone HTML document with embedded manifest", () => {
    const html = generateStandaloneHtml(manifest);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>School Paper</title>");
    expect(html).toContain('id="plif-manifest"');
    expect(html).toContain(JSON.stringify(manifest.title));
    expect(html).toContain("st-page-flip");
  });
});
