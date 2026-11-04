import { describe, expect, it, vi } from "vitest";
import type { ImportedPage } from "@plif/core";

const { importPdfFileMock, importImageFileMock } = vi.hoisted(() => ({
  importPdfFileMock: vi.fn<() => Promise<ImportedPage[]>>(),
  importImageFileMock: vi.fn<() => Promise<ImportedPage>>(),
}));

vi.mock("./pdf", () => ({
  importPdfFile: importPdfFileMock,
}));

vi.mock("./image", () => ({
  importImageFile: importImageFileMock,
}));

import { importFiles } from "./index";

describe("importFiles", () => {
  it("dispatches PDF and image files in order and flattens resulting pages", async () => {
    importPdfFileMock.mockResolvedValueOnce([
      { id: "pdf-1", src: "blob:p1", width: 600, height: 800, alt: "Doc — Page 1" },
      { id: "pdf-2", src: "blob:p2", width: 600, height: 800, alt: "Doc — Page 2" },
    ]);
    importImageFileMock.mockResolvedValueOnce({
      id: "img-1",
      src: "blob:i1",
      width: 600,
      height: 800,
      alt: "cover",
    });

    const pdf = new File(["%PDF"], "doc.pdf", { type: "application/pdf" });
    const img = new File(["png"], "cover.png", { type: "image/png" });

    const pages = await importFiles([pdf, img]);
    expect(pages.map((p) => p.id)).toEqual(["pdf-1", "pdf-2", "img-1"]);
  });

  it("throws a descriptive error for unsupported file types", async () => {
    const txt = new File(["hello"], "notes.txt", { type: "text/plain" });
    await expect(importFiles([txt])).rejects.toThrow(/unsupported file type/i);
  });
});
