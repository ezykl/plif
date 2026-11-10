import { describe, expect, it } from "vitest";
import { computeMaskAlpha, containSize } from "./mask";

function pixels(rows: number[][]): { data: Uint8ClampedArray; w: number; h: number } {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const data = new Uint8ClampedArray(w * h * 4);
  rows.forEach((row, y) =>
    row.forEach((v, x) => {
      const i = (y * w + x) * 4;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }),
  );
  return { data, w, h };
}

describe("computeMaskAlpha", () => {
  it("keeps dark artwork on a light page as the shape and clears the background", () => {
    const { data, w, h } = pixels([
      [255, 255, 255, 255, 255],
      [255, 0, 0, 0, 255],
      [255, 0, 0, 0, 255],
      [255, 0, 0, 0, 255],
      [255, 255, 255, 255, 255],
    ]);
    computeMaskAlpha(data, w, h, 45, false);
    expect(data[(2 * w + 2) * 4 + 3]).toBe(255);
    expect(data[0 * 4 + 3]).toBe(0);
    expect(data[0]).toBe(0);
  });

  it("detects light artwork on a dark page the same way", () => {
    const { data, w, h } = pixels([
      [10, 10, 10, 10, 10],
      [10, 240, 240, 240, 10],
      [10, 240, 240, 240, 10],
      [10, 240, 240, 240, 10],
      [10, 10, 10, 10, 10],
    ]);
    computeMaskAlpha(data, w, h, 45, false);
    expect(data[(2 * w + 2) * 4 + 3]).toBe(255);
    expect(data[0 * 4 + 3]).toBe(0);
  });

  it("inverts the mask on request", () => {
    const { data, w, h } = pixels([
      [255, 255, 255],
      [255, 0, 255],
      [255, 255, 255],
    ]);
    computeMaskAlpha(data, w, h, 45, true);
    expect(data[(1 * w + 1) * 4 + 3]).toBe(0);
    expect(data[0 * 4 + 3]).toBe(255);
  });

  it("uses existing transparency as the shape for logos and cutouts", () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    for (let p = 0; p < 16; p += 1) {
      data[p * 4] = 200;
      data[p * 4 + 3] = p === 5 || p === 6 ? 255 : 0;
    }
    computeMaskAlpha(data, 4, 4, 45, false);
    expect(data[5 * 4 + 3]).toBe(255);
    expect(data[0 * 4 + 3]).toBe(0);
    expect(data[5 * 4]).toBe(0);
  });

  it("a higher threshold drops weaker contrast", () => {
    const rows = [
      [255, 255, 255, 255],
      [255, 170, 170, 255],
      [255, 170, 170, 255],
      [255, 255, 255, 255],
    ];
    const low = pixels(rows);
    const high = pixels(rows);
    computeMaskAlpha(low.data, low.w, low.h, 10, false);
    computeMaskAlpha(high.data, high.w, high.h, 90, false);
    const centre = (1 * low.w + 1) * 4 + 3;
    expect(low.data[centre]).toBeGreaterThan(high.data[centre] ?? 0);
  });

  it("extracts silhouette from opaque white background even if a few interior pixels have alpha < 245", () => {
    const { data, w, h } = pixels([
      [255, 255, 255, 255, 255],
      [255, 0, 0, 0, 255],
      [255, 0, 0, 0, 255],
      [255, 0, 0, 0, 255],
      [255, 255, 255, 255, 255],
    ]);
    data[(1 * w + 1) * 4 + 3] = 220;
    computeMaskAlpha(data, w, h, 45, false);
    expect(data[0 * 4 + 3]).toBe(0);
    expect(data[(2 * w + 2) * 4 + 3]).toBe(255);
  });
});

describe("containSize", () => {
  it("fits inside the box preserving aspect ratio", () => {
    expect(containSize(200, 100, 100, 100)).toEqual({ width: 100, height: 50 });
    expect(containSize(100, 200, 100, 100)).toEqual({ width: 50, height: 100 });
    expect(containSize(0, 0, 100, 100)).toEqual({ width: 1, height: 1 });
  });
});
