import type { ImportedPage } from "@plif/core";
import { importImageFile } from "./image";
import { importPdfFile } from "./pdf";

export * from "./canvas";
export * from "./image";
export * from "./pdf";

export interface ImportFilesOptions {
  maxDimension?: number;
  quality?: number;
  onProgress?: (current: number, total: number) => void;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(file.name);
}

export async function importFiles(
  files: readonly File[],
  opts: ImportFilesOptions = {},
): Promise<ImportedPage[]> {
  const results: ImportedPage[] = [];

  for (const file of files) {
    if (isPdfFile(file)) {
      const pdfPages = await importPdfFile(file, opts);
      results.push(...pdfPages);
    } else if (isImageFile(file)) {
      const imagePage = await importImageFile(file, opts);
      results.push(imagePage);
    } else {
      throw new Error(`Unsupported file type: ${file.name || file.type}`);
    }
  }

  return results;
}
