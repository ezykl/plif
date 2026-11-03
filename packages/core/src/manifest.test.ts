import { describe, expect, it } from "vitest";
import { parseManifest } from "./manifest";

const valid = {
  version: 1,
  title: "My Book",
  pageSize: { width: 480, height: 679 },
  pages: [{ src: "a.webp" }, { src: "b.webp", density: "hard" }],
};

describe("parseManifest", () => {
  it("accepts a valid manifest and defaults hasCover to true", () => {
    const m = parseManifest(valid);
    expect(m.hasCover).toBe(true);
    expect(m.pages).toHaveLength(2);
  });

  it("rejects an empty page list", () => {
    expect(() => parseManifest({ ...valid, pages: [] })).toThrow();
  });

  it("rejects a non-positive page size", () => {
    expect(() => parseManifest({ ...valid, pageSize: { width: 0, height: 10 } })).toThrow();
  });

  it("rejects an unknown density", () => {
    expect(() => parseManifest({ ...valid, pages: [{ src: "a", density: "mushy" }] })).toThrow();
  });

  it("rejects an unsupported version", () => {
    expect(() => parseManifest({ ...valid, version: 2 })).toThrow();
  });
});
