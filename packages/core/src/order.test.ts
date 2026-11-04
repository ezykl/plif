import { describe, expect, it } from "vitest";
import { buildManifest, movePage, removePage, setPageDensity, type ImportedPage } from "./order";

const samplePages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 600, height: 800, alt: "Page 1" },
  { id: "p2", src: "blob:2", width: 600, height: 800, alt: "Page 2" },
  { id: "p3", src: "blob:3", width: 600, height: 800, alt: "Page 3" },
];

describe("movePage", () => {
  it("moves an item forward and preserves immutability", () => {
    const next = movePage(samplePages, 0, 2);
    expect(next.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
    expect(samplePages.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("moves an item backward", () => {
    const next = movePage(samplePages, 2, 0);
    expect(next.map((p) => p.id)).toEqual(["p3", "p1", "p2"]);
  });

  it("returns a shallow copy when indices are out of bounds or equal", () => {
    expect(movePage(samplePages, -1, 1).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
    expect(movePage(samplePages, 0, 99).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
    expect(movePage(samplePages, 1, 1).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });
});

describe("removePage", () => {
  it("removes the page at the given index", () => {
    const next = removePage(samplePages, 1);
    expect(next.map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("returns a shallow copy if index is out of range", () => {
    expect(removePage(samplePages, -1)).toHaveLength(3);
    expect(removePage(samplePages, 5)).toHaveLength(3);
  });
});

describe("setPageDensity", () => {
  it("sets density on the targeted page without mutating others", () => {
    const next = setPageDensity(samplePages, 0, "hard");
    expect(next[0]?.density).toBe("hard");
    expect(next[1]?.density).toBeUndefined();
    expect(samplePages[0]?.density).toBeUndefined();
  });
});

describe("buildManifest", () => {
  it("builds a validated Manifest using the first page dimensions", () => {
    const pages = setPageDensity(samplePages, 0, "hard");
    const manifest = buildManifest({
      title: "  Campus Issue  ",
      hasCover: true,
      pages,
    });
    expect(manifest).toEqual({
      version: 1,
      title: "Campus Issue",
      pageSize: { width: 600, height: 800 },
      hasCover: true,
      theme: "magazine",
      direction: "ltr",
      toc: [],
      pages: [
        { src: "blob:1", alt: "Page 1", density: "hard" },
        { src: "blob:2", alt: "Page 2" },
        { src: "blob:3", alt: "Page 3" },
      ],
    });
  });

  it("defaults blank titles to Untitled Book and throws on empty pages", () => {
    const manifest = buildManifest({ title: "   ", pages: samplePages });
    expect(manifest.title).toBe("Untitled Book");
    expect(() => buildManifest({ title: "Empty", pages: [] })).toThrow(/at least one page/i);
  });
});
