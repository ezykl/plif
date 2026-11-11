import { describe, expect, it } from "vitest";
import { getSamplePublication, sampleManifest, SAMPLE_PUBLICATIONS } from "./index";
import { BOOK_PRESETS } from "@plif/core";

describe("Sample publications", () => {
  it("provides rich curated publications for every book format preset", () => {
    for (const presetId of Object.keys(BOOK_PRESETS) as (keyof typeof BOOK_PRESETS)[]) {
      const pub = getSamplePublication(presetId);
      expect(pub).toBeDefined();
      expect(pub.id).toBe(presetId);
      expect(pub.title.length).toBeGreaterThan(0);
      expect(pub.pages.length).toBe(12);
      expect(pub.toc.length).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < pub.pages.length; i += 1) {
        const page = pub.pages[i];
        expect(page).toBeDefined();
        expect(page!.width).toBe(480);
        expect(page!.height).toBe(679);
        expect(page!.src.startsWith("data:image/svg+xml;utf8,")).toBe(true);
      }
    }
  });

  it("magazine publication features editorial architecture spreads", () => {
    const mag = SAMPLE_PUBLICATIONS.magazine;
    expect(mag.title).toBe("Sample Magazine");
    const coverSvg = decodeURIComponent(mag.pages[0]!.src);
    expect(coverSvg).toContain("APERTURE");
    expect(coverSvg).toContain("The Concrete Pavilion");
  });

  it("newspaper publication features broadsheet masthead and multi-column articles", () => {
    const news = SAMPLE_PUBLICATIONS.newspaper;
    expect(news.title).toBe("The Morning Chronicle");
    const frontSvg = decodeURIComponent(news.pages[0]!.src);
    expect(frontSvg).toContain("THE MORNING CHRONICLE");
    expect(frontSvg).toContain("FINAL CITY EDITION");
    expect(frontSvg).toContain("TODAY'S INDEX");
    const backSvg = decodeURIComponent(news.pages[11]!.src);
    expect(backSvg).toContain("The Daily Crossword");
  });

  it("hardcover publication features classical frontispiece, chapter drop cap, and nautical chart", () => {
    const book = SAMPLE_PUBLICATIONS.hardcover;
    expect(book.title).toBe("The Cartographer's Compass");
    const p1Svg = decodeURIComponent(book.pages[0]!.src);
    expect(p1Svg).toContain("THE CARTOGRAPHER'S COMPASS");
    const p2Svg = decodeURIComponent(book.pages[1]!.src);
    expect(p2Svg).toContain("Plate I. Navigational astrolabe");
    const p6Svg = decodeURIComponent(book.pages[5]!.src);
    expect(p6Svg).toContain("THE SILENT MERIDIAN");
  });

  it("zine publication features risograph brutalist typography and schematics", () => {
    const zine = SAMPLE_PUBLICATIONS.zine;
    expect(zine.title).toBe("Kinetic Risograph & Sound");
    const p1Svg = decodeURIComponent(zine.pages[0]!.src);
    expect(p1Svg).toContain("KINETIC");
    expect(p1Svg).toContain("LIMITED RUN OF 250");
  });

  it("sampleManifest defaults to magazine issue and preserves backwards compatibility", () => {
    expect(sampleManifest.title).toBe("Sample Magazine");
    expect(sampleManifest.pages.length).toBe(12);
    expect(sampleManifest.pageSize).toEqual({ width: 480, height: 679 });
  });
});
