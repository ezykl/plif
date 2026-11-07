import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { ImportedPage } from "@plif/core";
import { canvasToWebpUrl } from "./canvas";
import { generatePageId } from "./id";

export const PDF_WORKER_URL = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

if (!GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
}

export interface ImportPdfOptions {
  maxDimension?: number;
  quality?: number;
  onProgress?: (current: number, total: number) => void;
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "") || filename;
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === "function") {
    return new Uint8Array(await file.arrayBuffer());
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error(`Failed to read file bytes: ${file.name}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

export async function importPdfFile(
  file: File,
  opts: ImportPdfOptions = {},
): Promise<ImportedPage[]> {
  const maxDimension = opts.maxDimension ?? 1600;
  const data = await readFileBytes(file);
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;
  const baseName = stripExtension(file.name);
  const pages: ImportedPage[] = [];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      const longest = Math.max(baseViewport.width, baseViewport.height, 1);
      const scale = maxDimension / longest;
      const viewport = page.getViewport({ scale });
      const width = Math.max(1, Math.round(viewport.width));
      const height = Math.max(1, Math.round(viewport.height));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
      } else {
        await page.render({
          canvasContext: {} as CanvasRenderingContext2D,
          viewport,
        }).promise;
      }
      const src = await canvasToWebpUrl(canvas, opts.quality);
      page.cleanup();

      pages.push({
        id: generatePageId(),
        src,
        width,
        height,
        alt: `${baseName} — Page ${i}`,
      });
      opts.onProgress?.(i, pdf.numPages);
    }
  } finally {
    await pdf.destroy();
  }

  return pages;
}
