import { describe, expect, it, vi } from "vitest";
import { importImageFile } from "./image";

describe("importImageFile", () => {
  it("scales a large image, draws it to canvas, and returns an ImportedPage", async () => {
    const drawSpy = vi.fn();
    const file = new File(["img"], "cover-art.png", { type: "image/png" });

    // Mock HTMLCanvasElement getContext and toDataURL/toBlob in jsdom
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue("data:image/webp;base64,TEST");

    const page = await importImageFile(file, {
      maxDimension: 1000,
      loadImage: async () => ({
        width: 1500,
        height: 2000,
        draw: drawSpy,
      }),
    });

    expect(page.width).toBe(750);
    expect(page.height).toBe(1000);
    expect(page.alt).toBe("cover-art");
    expect(page.id).toBeTruthy();
    expect(page.src).toBeTruthy();
  });
});
