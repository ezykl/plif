import { describe, expect, it } from "vitest";
import {
  generateIframeEmbed,
  generateStandaloneHtml,
  generateWebComponentEmbed,
  parseManifest,
} from "./index";

const manifest = parseManifest({
  version: 1,
  title: "School Paper & <Mag>",
  pageSize: { width: 480, height: 679 },
  hasCover: true,
  theme: "magazine",
  direction: "ltr",
  pages: [{ src: "p1.webp" }, { src: "p2.webp" }],
});

describe("embed and export in @plif/core", () => {
  it("generates responsive iframe embed code", () => {
    const iframe = generateIframeEmbed({
      src: "https://plif.app/b/abc123?q=1&2",
      title: 'School "Paper" & Special',
    });
    expect(iframe).toContain('<iframe src="https://plif.app/b/abc123?q=1&amp;2"');
    expect(iframe).toContain('title="School &quot;Paper&quot; &amp; Special"');
    expect(iframe).toContain("allowfullscreen");
  });

  it("omits title attribute when not provided in iframe embed", () => {
    const iframe = generateIframeEmbed({
      src: "https://plif.app/b/abc123",
    });
    expect(iframe).not.toContain("title=");
  });

  it("generates web component embed snippet with custom or default scriptUrl", () => {
    const snippetCustom = generateWebComponentEmbed({
      manifestUrl: "https://example.com/manifest.json?a=1&b=2",
      scriptUrl: "https://unpkg.com/@plif/reader/dist/plif-book.js",
    });
    expect(snippetCustom).toContain(
      '<script type="module" src="https://unpkg.com/@plif/reader/dist/plif-book.js"></script>',
    );
    expect(snippetCustom).toContain(
      '<plif-book src="https://example.com/manifest.json?a=1&amp;b=2"',
    );

    const snippetDefault = generateWebComponentEmbed({
      manifestUrl: "https://example.com/manifest.json",
    });
    expect(snippetDefault).toContain(
      '<script type="module" src="https://unpkg.com/@plif/reader/dist/plif-book.js"></script>',
    );
  });

  it("generates a complete standalone HTML document with embedded manifest and round-trip consistency", () => {
    const html = generateStandaloneHtml(manifest);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>School Paper &amp; &lt;Mag&gt;</title>");
    expect(html).toContain('id="plif-manifest"');
    expect(html).toContain("st-page-flip");
    expect(html).toContain("prefers-reduced-motion");

    const match = html.match(
      /<script id="plif-manifest" type="application\/json">([\s\S]*?)<\/script>/,
    );
    expect(match).not.toBeNull();
    const parsedEmbedManifest = JSON.parse(match![1]!.trim());
    expect(parsedEmbedManifest.title).toEqual(manifest.title);
    expect(parsedEmbedManifest.pages).toEqual(manifest.pages);
  });
});
