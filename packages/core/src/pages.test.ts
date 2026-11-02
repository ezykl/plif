import { describe, expect, it } from "vitest";
import { formatPageLabel, visiblePages } from "./pages";

describe("visiblePages", () => {
  it("shows the cover alone", () => {
    expect(visiblePages(0, 12, true, false)).toEqual([0]);
  });

  it("shows a pair in the middle", () => {
    expect(visiblePages(1, 12, true, false)).toEqual([1, 2]);
    expect(visiblePages(9, 12, true, false)).toEqual([9, 10]);
  });

  it("shows the back cover alone when total is even", () => {
    expect(visiblePages(11, 12, true, false)).toEqual([11]);
  });

  it("shows the last pair when total is odd", () => {
    expect(visiblePages(9, 11, true, false)).toEqual([9, 10]);
  });

  it("pairs from index 0 without a cover", () => {
    expect(visiblePages(0, 4, false, false)).toEqual([0, 1]);
  });

  it("always shows one page in portrait mode", () => {
    expect(visiblePages(5, 12, true, true)).toEqual([5]);
  });
});

describe("formatPageLabel", () => {
  it("formats single pages", () => {
    expect(formatPageLabel(0, 12, true, false)).toBe("1 / 12");
  });

  it("formats spreads with an en dash", () => {
    expect(formatPageLabel(1, 12, true, false)).toBe("2–3 / 12");
  });
});
