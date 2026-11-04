import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canvasToWebpUrl, scaleToFitMaxDimension } from "./canvas";

describe("scaleToFitMaxDimension", () => {
  it("keeps dimensions unchanged when within maxDimension", () => {
    expect(scaleToFitMaxDimension(800, 1200, 1600)).toEqual({
      width: 800,
      height: 1200,
      scale: 1,
    });
  });

  it("scales down proportionally when longest edge exceeds maxDimension", () => {
    const res = scaleToFitMaxDimension(2400, 3200, 1600);
    expect(res.width).toBe(1200);
    expect(res.height).toBe(1600);
    expect(res.scale).toBeCloseTo(0.5);
  });

  it("throws when width or height is non-positive", () => {
    expect(() => scaleToFitMaxDimension(0, 500)).toThrow(/positive/i);
  });
});

describe("canvasToWebpUrl", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/webp;base64,AAA",
    );
    if (typeof URL.createObjectURL !== "function") {
      URL.createObjectURL = () => "";
    }
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:webp-test");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an object URL when toBlob yields a non-empty Blob", async () => {
    const canvas = document.createElement("canvas");
    canvas.toBlob = (cb: BlobCallback) => cb(new Blob(["webp-bytes"], { type: "image/webp" }));

    const url = await canvasToWebpUrl(canvas, 0.85);
    expect(url).toBe("blob:webp-test");
  });

  it("falls back to toDataURL when toBlob returns null", async () => {
    const canvas = document.createElement("canvas");
    canvas.toBlob = (cb: BlobCallback) => cb(null);

    const url = await canvasToWebpUrl(canvas, 0.8);
    expect(url).toBe("data:image/webp;base64,AAA");
  });
});
