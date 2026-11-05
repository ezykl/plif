import { describe, expect, it } from "vitest";
import type { ImportedPage } from "./order";
import { applyBookPreset, applyBulkDensity, BOOK_PRESETS, THEMES } from "./themes";
import { parseManifest } from "./manifest";
import { buildManifest } from "./order";

const samplePages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 480, height: 679, alt: "Page 1" },
  { id: "p2", src: "blob:2", width: 480, height: 679, alt: "Page 2" },
  { id: "p3", src: "blob:3", width: 480, height: 679, alt: "Page 3" },
  { id: "p4", src: "blob:4", width: 480, height: 679, alt: "Page 4" },
];

describe("THEMES and manifest theme support", () => {
  it("defines tokens for newsprint, magazine, classic, and studio", () => {
    expect(Object.keys(THEMES)).toEqual(["newsprint", "magazine", "classic", "studio"]);
  });

  it("defines tactile tokens (surfaceWarm, cardBg, borderSubtle, inkMuted, accentHover) for all themes", () => {
    for (const [key, theme] of Object.entries(THEMES)) {
      expect(theme, `Theme ${key}`).toHaveProperty("surfaceWarm");
      expect(theme, `Theme ${key}`).toHaveProperty("cardBg");
      expect(theme, `Theme ${key}`).toHaveProperty("borderSubtle");
      expect(theme, `Theme ${key}`).toHaveProperty("inkMuted");
      expect(theme, `Theme ${key}`).toHaveProperty("accentHover");
    }
  });

  it("defaults manifest.theme to magazine and accepts valid themes", () => {
    const m1 = parseManifest({
      version: 1,
      title: "Default Theme",
      pageSize: { width: 480, height: 679 },
      pages: [{ src: "a.webp" }],
    });
    expect(m1.theme).toBe("magazine");

    const m2 = buildManifest({
      title: "Campus Paper",
      theme: "newsprint",
      pages: samplePages,
    });
    expect(m2.theme).toBe("newsprint");
  });
});

describe("applyBulkDensity", () => {
  it("sets all pages to soft in all-soft mode", () => {
    const pages = applyBulkDensity(samplePages, "all-soft");
    expect(pages.map((p) => p.density)).toEqual(["soft", "soft", "soft", "soft"]);
  });

  it("sets first and last page to hard and inner pages to soft in hard-covers mode", () => {
    const pages = applyBulkDensity(samplePages, "hard-covers");
    expect(pages.map((p) => p.density)).toEqual(["hard", "soft", "soft", "hard"]);
  });

  it("sets all pages to hard in all-hard mode", () => {
    const pages = applyBulkDensity(samplePages, "all-hard");
    expect(pages.map((p) => p.density)).toEqual(["hard", "hard", "hard", "hard"]);
  });
});

describe("applyBookPreset", () => {
  it("configures newspaper preset as coverless, all-soft, newsprint theme", () => {
    const res = applyBookPreset("newspaper", samplePages);
    expect(res.hasCover).toBe(false);
    expect(res.theme).toBe("newsprint");
    expect(res.pages.map((p) => p.density)).toEqual(["soft", "soft", "soft", "soft"]);
  });

  it("configures hardcover preset with cover, hard front/back, classic theme", () => {
    expect(BOOK_PRESETS.hardcover.label).toBe("Hardcover Book");
    const res = applyBookPreset("hardcover", samplePages);
    expect(res.hasCover).toBe(true);
    expect(res.theme).toBe("classic");
    expect(res.pages.map((p) => p.density)).toEqual(["hard", "soft", "soft", "hard"]);
  });
});
