import type { ImportedPage } from "@plif/core";
import { canvasToWebpUrl, scaleToFitMaxDimension } from "./canvas";

export interface LoadedImageSource {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface ImportImageOptions {
  maxDimension?: number;
  quality?: number;
  loadImage?: (file: File) => Promise<LoadedImageSource>;
}

function defaultLoadImage(file: File): Promise<LoadedImageSource> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image: ${file.name}`));
    };
    img.src = objectUrl;
  });
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "") || filename;
}

export async function importImageFile(
  file: File,
  opts: ImportImageOptions = {},
): Promise<ImportedPage> {
  const loader = opts.loadImage ?? defaultLoadImage;
  const source = await loader(file);
  const { width, height } = scaleToFitMaxDimension(source.width, source.height, opts.maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    source.draw(ctx, width, height);
  }
  const src = await canvasToWebpUrl(canvas, opts.quality);
  return {
    id: crypto.randomUUID(),
    src,
    width,
    height,
    alt: stripExtension(file.name),
  };
}
