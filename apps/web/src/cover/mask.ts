/**
 * Turns raw RGBA pixels into a one-color silhouette mask, in place.
 *
 * - Transparent artwork (logos, cutouts): the existing alpha is the shape.
 * - Opaque artwork (PDF pages, photos): the background color is estimated from the
 *   image corners and every pixel is scored by how far it is from that background.
 *
 * `threshold` is 5..95 (higher keeps only the strongest contrast). After the call
 * every pixel is black and carries the mask in its alpha channel.
 */
export function computeMaskAlpha(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  invert: boolean,
): void {
  const total = width * height;
  if (total === 0) return;

  const lum = (i: number) =>
    0.2126 * (data[i] ?? 0) + 0.7152 * (data[i + 1] ?? 0) + 0.0722 * (data[i + 2] ?? 0);

  const inset = Math.min(3, Math.max(0, Math.floor(Math.min(width, height) / 32)));
  const corners = [
    [inset, inset],
    [width - 1 - inset, inset],
    [inset, height - 1 - inset],
    [width - 1 - inset, height - 1 - inset],
  ] as const;

  const avgCornerAlpha =
    corners.reduce((sum, [x, y]) => sum + (data[(y * width + x) * 4 + 3] ?? 255), 0) /
    corners.length;
  const hasTransparentBackground = avgCornerAlpha < 128;

  let bgLum = 0;
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  if (!hasTransparentBackground) {
    for (const [x, y] of corners) {
      const idx = (y * width + x) * 4;
      bgR += data[idx] ?? 0;
      bgG += data[idx + 1] ?? 0;
      bgB += data[idx + 2] ?? 0;
      bgLum += lum(idx);
    }
    bgR /= corners.length;
    bgG /= corners.length;
    bgB /= corners.length;
    bgLum /= corners.length;
  }

  const edge0 = (Math.min(95, Math.max(5, threshold)) / 100) * 0.55;
  const edge1 = edge0 + 0.14;

  for (let p = 0; p < total; p += 1) {
    const i = p * 4;
    let a: number;
    if (hasTransparentBackground) {
      a = (data[i + 3] ?? 0) / 255;
    } else {
      const dLum = Math.abs(lum(i) - bgLum) / 255;
      const dChroma =
        (Math.max(
          Math.abs((data[i] ?? 0) - bgR),
          Math.abs((data[i + 1] ?? 0) - bgG),
          Math.abs((data[i + 2] ?? 0) - bgB),
        ) /
          255) *
        0.7;
      const d = Math.max(dLum, dChroma);
      const t = Math.min(1, Math.max(0, (d - edge0) / (edge1 - edge0)));
      a = t * t * (3 - 2 * t) * ((data[i + 3] ?? 255) / 255);
    }
    if (invert) a = 1 - a;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = Math.round(a * 255);
  }
}

/** Largest size that fits (srcW x srcH) inside (boxW x boxH) while keeping aspect ratio. */
export function containSize(
  srcW: number,
  srcH: number,
  boxW: number,
  boxH: number,
): { width: number; height: number } {
  if (srcW <= 0 || srcH <= 0) return { width: 1, height: 1 };
  const ratio = Math.min(boxW / srcW, boxH / srcH);
  return {
    width: Math.max(1, Math.round(srcW * ratio)),
    height: Math.max(1, Math.round(srcH * ratio)),
  };
}
