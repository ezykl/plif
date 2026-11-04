export interface ScaledDimensions {
  width: number;
  height: number;
  scale: number;
}

export function scaleToFitMaxDimension(
  width: number,
  height: number,
  maxDimension = 1600,
): ScaledDimensions {
  if (width <= 0 || height <= 0) {
    throw new Error("Dimensions must be positive");
  }
  const longest = Math.max(width, height);
  const scale = longest > maxDimension ? maxDimension / longest : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

export function canvasToWebpUrl(canvas: HTMLCanvasElement, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === "function") {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0 && typeof URL.createObjectURL === "function") {
              resolve(URL.createObjectURL(blob));
            } else {
              resolve(canvas.toDataURL("image/webp", quality));
            }
          },
          "image/webp",
          quality,
        );
        return;
      } catch {
        // Fallback if toBlob throws in jsdom without canvas package
      }
    }
    resolve(canvas.toDataURL("image/webp", quality));
  });
}
