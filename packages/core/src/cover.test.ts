import { describe, expect, it } from "vitest";
import {
  COVER_FOILS,
  FOIL_STYLES,
  coverDesignSchema,
  coverSeed,
  createRng,
  isLightColor,
  resolveCoverTitle,
} from "./cover";
import { parseManifest } from "./manifest";

describe("cover design", () => {
  it("parses with defaults and rejects non-hex colors", () => {
    const parsed = coverDesignSchema.parse({ color: "#112233" });
    expect(parsed).toMatchObject({ enabled: false, material: "cloth", foil: "gold", frame: true });
    expect(() => coverDesignSchema.parse({ color: "navy" })).toThrow();
  });

  it("defaults artwork off, with the back cover on", () => {
    const parsed = coverDesignSchema.parse({ color: "#112233" });
    expect(parsed).toMatchObject({
      artMode: "none",
      artThreshold: 45,
      artInvert: false,
      backCover: true,
    });
    expect(() => coverDesignSchema.parse({ color: "#112233", artThreshold: 120 })).toThrow();
  });

  it("stamps the book title only when no artwork is used, unless a cover title is typed", () => {
    expect(resolveCoverTitle({ title: "", artMode: "none" }, "My Book")).toBe("My Book");
    expect(resolveCoverTitle({ title: "", artMode: "silhouette" }, "My Book")).toBe("");
    expect(resolveCoverTitle({ title: "", artMode: "full" }, "My Book")).toBe("");
    expect(resolveCoverTitle({ title: "Typed", artMode: "silhouette" }, "My Book")).toBe("Typed");
  });

  it("defines a foil style for every foil, and blind deboss is unfilled", () => {
    for (const foil of COVER_FOILS) {
      expect(FOIL_STYLES[foil].stops.length).toBeGreaterThanOrEqual(2);
    }
    expect(FOIL_STYLES.blind.filled).toBe(false);
    expect(FOIL_STYLES.gold.filled).toBe(true);
  });

  it("is deterministic for the same design and differs for different titles", () => {
    const a = coverSeed({ color: "#112233", material: "cloth", title: "A" });
    expect(coverSeed({ color: "#112233", material: "cloth", title: "A" })).toBe(a);
    expect(coverSeed({ color: "#112233", material: "cloth", title: "B" })).not.toBe(a);
    const r1 = createRng(a);
    const r2 = createRng(a);
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });

  it("classifies light and dark cover colors", () => {
    expect(isLightColor("#e8dfcc")).toBe(true);
    expect(isLightColor("#16161a")).toBe(false);
  });

  it("keeps existing manifests valid and accepts an optional coverDesign", () => {
    const base = {
      version: 1,
      title: "T",
      pageSize: { width: 480, height: 679 },
      pages: [{ src: "a.webp" }],
    };
    expect(parseManifest(base).coverDesign).toBeUndefined();
    const withDesign = parseManifest({ ...base, coverDesign: { color: "#112233", enabled: true } });
    expect(withDesign.coverDesign?.enabled).toBe(true);
  });
});
