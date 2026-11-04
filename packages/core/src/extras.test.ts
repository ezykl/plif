import { describe, expect, it } from "vitest";
import {
  clampZoom,
  formatPageHash,
  parseManifest,
  parsePageHash,
  resolveArrowAction,
  stepZoom,
} from "./index";

describe("reader extras in @plif/core", () => {
  it("defaults manifest direction to ltr and toc to empty array", () => {
    const m = parseManifest({
      version: 1,
      title: "Book",
      pageSize: { width: 400, height: 600 },
      pages: [{ src: "p1.webp" }],
    });
    expect(m.direction).toBe("ltr");
    expect(m.toc).toEqual([]);
  });

  it("parses custom rtl direction and toc items", () => {
    const m = parseManifest({
      version: 1,
      title: "Manga",
      pageSize: { width: 400, height: 600 },
      direction: "rtl",
      toc: [{ title: "Chapter 1", page: 1 }],
      pages: [{ src: "p1.webp" }, { src: "p2.webp" }],
    });
    expect(m.direction).toBe("rtl");
    expect(m.toc).toEqual([{ title: "Chapter 1", page: 1 }]);
  });

  it("clamps and steps zoom between 1 and 3", () => {
    expect(clampZoom(0.5)).toBe(1);
    expect(clampZoom(4)).toBe(3);
    expect(stepZoom(1, 0.25)).toBe(1.25);
    expect(stepZoom(3, 0.25)).toBe(3);
    expect(stepZoom(1, -0.25)).toBe(1);
  });

  it("formats and parses #/page/N deep-link hashes", () => {
    expect(formatPageHash(0)).toBe("#/page/1");
    expect(formatPageHash(4)).toBe("#/page/5");
    expect(parsePageHash("#/page/1", 12)).toBe(0);
    expect(parsePageHash("#/page/5", 12)).toBe(4);
    expect(parsePageHash("#/page/99", 12)).toBe(11);
    expect(parsePageHash("#/page/0", 12)).toBe(0);
    expect(parsePageHash("#other", 12)).toBeNull();
    expect(parsePageHash("#/page/2", 0)).toBeNull();
  });

  it("resolves arrow key navigation for ltr and rtl", () => {
    expect(resolveArrowAction("ArrowRight", "ltr")).toBe("next");
    expect(resolveArrowAction("ArrowLeft", "ltr")).toBe("prev");
    expect(resolveArrowAction("ArrowRight", "rtl")).toBe("prev");
    expect(resolveArrowAction("ArrowLeft", "rtl")).toBe("next");
    expect(resolveArrowAction("Enter", "ltr")).toBeNull();
  });
});
