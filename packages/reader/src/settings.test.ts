import { describe, expect, it } from "vitest";
import { parseManifest } from "@plif/core";
import { toFlipSettings } from "./settings";

const manifest = parseManifest({
  version: 1,
  title: "T",
  pageSize: { width: 480, height: 679 },
  pages: [{ src: "a" }, { src: "b" }],
});

describe("toFlipSettings", () => {
  it("maps page size and responsive bounds", () => {
    const s = toFlipSettings(manifest, { reduceMotion: false });
    expect(s).toMatchObject({
      width: 480,
      height: 679,
      size: "stretch",
      maxWidth: 480,
      maxHeight: 679,
      minWidth: 288,
      minHeight: 407,
      showCover: true,
      usePortrait: true,
    });
  });

  it("animates with shadows by default", () => {
    const s = toFlipSettings(manifest, { reduceMotion: false });
    expect(s.flippingTime).toBe(700);
    expect(s.drawShadow).toBe(true);
  });

  it("disables animation and shadows for reduced motion", () => {
    const s = toFlipSettings(manifest, { reduceMotion: true });
    expect(s.flippingTime).toBe(1);
    expect(s.drawShadow).toBe(false);
  });

  it("respects hasCover=false", () => {
    const s = toFlipSettings({ ...manifest, hasCover: false }, { reduceMotion: false });
    expect(s.showCover).toBe(false);
  });

  it("caps minWidth/minHeight on high-res pages so dual-page landscape mode fits desktop stages", () => {
    const hiRes = parseManifest({
      version: 1,
      title: "HiRes",
      pageSize: { width: 1400, height: 1980 },
      pages: [{ src: "a" }, { src: "b" }],
    });
    const s = toFlipSettings(hiRes, { reduceMotion: false, startPage: 2 });
    expect(s.minWidth).toBe(288);
    expect(s.minHeight).toBe(407);
    expect(s.maxWidth).toBe(1400);
    expect(s.startPage).toBe(2);
  });
});
