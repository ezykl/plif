import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getDocumentMock, destroyMock, cleanupMock, renderMock } = vi.hoisted(() => {
  const render = vi.fn(() => ({ promise: Promise.resolve() }));
  const cleanup = vi.fn();
  const destroy = vi.fn(() => Promise.resolve());
  const getPage = vi.fn(async (pageNum: number) => ({
    getViewport: ({ scale }: { scale: number }) => ({
      width: 600 * scale,
      height: 800 * scale,
    }),
    render,
    cleanup,
    pageNumber: pageNum,
  }));
  const getDocument = vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage,
      destroy,
    }),
  }));
  return {
    getDocumentMock: getDocument,
    destroyMock: destroy,
    cleanupMock: cleanup,
    renderMock: render,
  };
});

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: getDocumentMock,
}));

import { importPdfFile } from "./pdf";

describe("importPdfFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/webp;base64,PDF",
    );
    HTMLCanvasElement.prototype.toBlob = (cb: BlobCallback) => cb(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders every PDF page at scaled viewport, reports progress, and cleans up", async () => {
    const progress: Array<[number, number]> = [];
    const file = new File([new Uint8Array([37, 80, 68, 70])], "magazine.pdf", {
      type: "application/pdf",
    });

    const pages = await importPdfFile(file, {
      maxDimension: 1600,
      onProgress: (cur, total) => progress.push([cur, total]),
    });

    expect(getDocumentMock).toHaveBeenCalledTimes(1);
    expect(pages).toHaveLength(2);
    expect(pages[0]?.width).toBe(1200);
    expect(pages[0]?.height).toBe(1600);
    expect(pages[0]?.alt).toBe("magazine: Page 1");
    expect(pages[1]?.alt).toBe("magazine: Page 2");
    expect(progress).toEqual([
      [1, 2],
      [2, 2],
    ]);
    expect(cleanupMock).toHaveBeenCalledTimes(2);
    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(2);
  });
});
