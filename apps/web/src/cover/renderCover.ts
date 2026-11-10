import {
  FOIL_STYLES,
  coverSeed,
  createRng,
  isLightColor,
  type CoverDesign,
  type CoverFont,
} from "@plif/core";
import { computeMaskAlpha, containSize } from "./mask";

export const COVER_FONT_STACKS: Record<CoverFont, { family: string; weight: number }> = {
  cinzel: { family: '"Cinzel", "Trajan Pro", Georgia, serif', weight: 600 },
  playfair: { family: '"Playfair Display", Georgia, serif', weight: 600 },
  cormorant: { family: '"Cormorant Garamond", Georgia, serif', weight: 600 },
};

export interface RenderCoverOptions {
  width: number;
  height: number;
  /** Pixel density multiplier for crisp output. */
  scale?: number;
  /** The back cover reuses the material and frame with a small foil mark. */
  variant?: "front" | "back";
}

export interface CoverAssets {
  /** Single-color logo, used when no artwork mode is active. */
  logo?: CanvasImageSource | null;
  /** The imported page 1 artwork used by the silhouette and full-wrap modes. */
  art?: CanvasImageSource | null;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function sourceSize(source: CanvasImageSource): { width: number; height: number } {
  const s = source as {
    naturalWidth?: number;
    width?: number;
    naturalHeight?: number;
    height?: number;
  };
  return {
    width: s.naturalWidth || s.width || 1,
    height: s.naturalHeight || s.height || 1,
  };
}

function paintMaterial(
  ctx: CanvasRenderingContext2D,
  design: CoverDesign,
  w: number,
  h: number,
  rng: () => number,
): void {
  ctx.fillStyle = design.color;
  ctx.fillRect(0, 0, w, h);
  if (design.material === "smooth") return;

  const [r, g, b] = hexToRgb(design.color);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const weave = design.material === "cloth" ? 3 : design.material === "linen" ? 2 : 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      let shade = (rng() - 0.5) * 18;
      if (weave > 0) {
        const warp = Math.sin((x / weave) * Math.PI) * 6;
        const weft = Math.sin((y / weave) * Math.PI) * 6;
        shade += warp + weft;
      } else {
        // leather pebble: low frequency undulation
        shade += Math.sin(x * 0.09 + Math.sin(y * 0.05) * 3) * Math.cos(y * 0.09) * 12;
      }
      d[i] = Math.min(255, Math.max(0, r + shade));
      d[i + 1] = Math.min(255, Math.max(0, g + shade));
      d[i + 2] = Math.min(255, Math.max(0, b + shade));
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function foilGradient(
  ctx: CanvasRenderingContext2D,
  design: CoverDesign,
  w: number,
  h: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(w * 0.15, h * 0.2, w * 0.85, h * 0.8);
  for (const [offset, color] of FOIL_STYLES[design.foil].stops) {
    gradient.addColorStop(offset, color);
  }
  return gradient;
}

type StampDraw = (fill: string | CanvasGradient, mode: "fill" | "stroke") => void;

/** Stamps a shape (drawn by `draw`) with deboss (sunken) or emboss (raised) shading and optional foil fill. */
function stamp(
  ctx: CanvasRenderingContext2D,
  design: CoverDesign,
  w: number,
  h: number,
  px: number,
  draw: StampDraw,
): void {
  const light = isLightColor(design.color);
  const emboss = design.relief === "emboss";

  if (emboss) {
    // EMBOSS (Raised relief): top-left specular highlight + bottom-right cast drop shadow
    ctx.save();
    ctx.shadowColor = light ? "rgba(60, 40, 20, 0.5)" : "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 4 * px;
    ctx.shadowOffsetX = 2 * px;
    ctx.shadowOffsetY = 2.5 * px;
    draw(light ? "rgba(60, 40, 20, 0.45)" : "rgba(0, 0, 0, 0.75)", "fill");
    ctx.restore();

    ctx.save();
    ctx.shadowColor = light ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.35)";
    ctx.shadowBlur = 1.2 * px;
    ctx.shadowOffsetX = -1.2 * px;
    ctx.shadowOffsetY = -1.5 * px;
    ctx.lineWidth = 1 * px;
    draw(light ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.22)", "fill");
    ctx.restore();

    if (FOIL_STYLES[design.foil].filled) {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 2 * px;
      ctx.shadowOffsetX = 1 * px;
      ctx.shadowOffsetY = 1.5 * px;
      draw(foilGradient(ctx, design, w, h), "fill");
      ctx.restore();
    }
    return;
  }

  // DEBOSS (Pressed in / Sunken):
  // 1. Bottom-right bevel catchlight where overhead light hits the lower lip of the cavity
  ctx.save();
  ctx.shadowColor = light ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.34)";
  ctx.shadowBlur = 1.2 * px;
  ctx.shadowOffsetX = 1.2 * px;
  ctx.shadowOffsetY = 1.8 * px;
  draw(light ? "rgba(255, 255, 255, 0.55)" : "rgba(255, 255, 255, 0.18)", "fill");
  ctx.restore();

  // 2. Deep recessed cavity floor + top-left inner wall shadow cast downward into the groove
  ctx.save();
  ctx.shadowColor = light ? "rgba(45, 28, 12, 0.7)" : "rgba(0, 0, 0, 0.92)";
  ctx.shadowBlur = 2.8 * px;
  ctx.shadowOffsetX = -1.5 * px;
  ctx.shadowOffsetY = -2 * px;
  draw(light ? "rgba(55, 36, 18, 0.62)" : "rgba(0, 0, 0, 0.82)", "fill");
  ctx.restore();

  // 3. Foil fill recessed inside the pocket (inner top-left shadow from cavity lip)
  if (FOIL_STYLES[design.foil].filled) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.68)";
    ctx.shadowBlur = 1.8 * px;
    ctx.shadowOffsetX = -1 * px;
    ctx.shadowOffsetY = -1.5 * px;
    draw(foilGradient(ctx, design, w, h), "fill");
    ctx.restore();
  }
}

/** Stamps an alpha mask (black shape on transparent) at (x, y) through the deboss/emboss + foil passes. */
function stampMask(
  ctx: CanvasRenderingContext2D,
  design: CoverDesign,
  w: number,
  h: number,
  px: number,
  mask: HTMLCanvasElement,
  x: number,
  y: number,
): void {
  stamp(ctx, design, w, h, px, (fill, mode) => {
    if (mode === "stroke") return;
    const tint = document.createElement("canvas");
    const full = typeof fill !== "string";
    tint.width = full ? w : mask.width;
    tint.height = full ? h : mask.height;
    const tctx = tint.getContext("2d");
    if (!tctx) return;
    tctx.drawImage(mask, full ? x : 0, full ? y : 0);
    tctx.globalCompositeOperation = "source-in";
    tctx.fillStyle = fill;
    tctx.fillRect(0, 0, tint.width, tint.height);
    ctx.drawImage(tint, full ? 0 : x, full ? 0 : y);
  });
}

/** Builds a one-color silhouette of `source` that fits inside the box. */
function buildMask(
  source: CanvasImageSource,
  boxW: number,
  boxH: number,
  threshold: number,
  invert: boolean,
): HTMLCanvasElement | null {
  const src = sourceSize(source);
  const size = containSize(src.width, src.height, boxW, boxH);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const mctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!mctx) return null;
  mctx.drawImage(source, 0, 0, size.width, size.height);
  const img = mctx.getImageData(0, 0, size.width, size.height);
  computeMaskAlpha(img.data, size.width, size.height, threshold, invert);
  mctx.putImageData(img, 0, 0);
  return canvas;
}

/** Draws the source scaled to cover the whole board (like a printed case wrap). */
function drawCoverFit(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  w: number,
  h: number,
) {
  const src = sourceSize(source);
  const ratio = Math.max(w / src.width, h / src.height);
  const dw = src.width * ratio;
  const dh = src.height * ratio;
  ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFor: (size: number) => string,
  maxWidth: number,
  start: number,
): number {
  let size = start;
  ctx.font = fontFor(size);
  while (size > 8 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = fontFor(size);
  }
  return size;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

/**
 * Draws a hardbound cover (material grain, debossed + foil stamped lettering or
 * artwork silhouette, optional frame and logo) onto the given canvas. Returns
 * false if no 2D context is available (for example in jsdom).
 */
export function drawCover(
  canvas: HTMLCanvasElement,
  design: CoverDesign,
  options: RenderCoverOptions,
  assets: CoverAssets = {},
): boolean {
  const scale = options.scale ?? 2;
  const back = options.variant === "back";
  const w = Math.round(options.width * scale);
  const h = Math.round(options.height * scale);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const px = scale;
  const rng = createRng(coverSeed(design));
  const art = assets.logo ?? assets.art ?? null;
  const wrapArt = !back && design.artMode === "full" && art !== null;
  const silhouetteArt = design.artMode === "silhouette" && art !== null;

  if (wrapArt && art) {
    drawCoverFit(ctx, art, w, h);
    // a faint weave over the print so it reads as cloth-wrapped board, not a flat image
    if (design.material !== "smooth") {
      const grain = document.createElement("canvas");
      grain.width = w;
      grain.height = h;
      const gctx = grain.getContext("2d", { willReadFrequently: true });
      if (gctx) {
        paintMaterial(gctx, { ...design, color: "#808080" }, w, h, rng);
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(grain, 0, 0);
        ctx.restore();
      }
    }
  } else {
    paintMaterial(ctx, design, w, h, rng);
  }

  // spine hinge bevel and vignette
  const hinge = ctx.createLinearGradient(0, 0, w * 0.09, 0);
  hinge.addColorStop(0, "rgba(0,0,0,0.38)");
  hinge.addColorStop(0.45, "rgba(255,255,255,0.08)");
  hinge.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = hinge;
  ctx.fillRect(0, 0, w * 0.09, h);
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.85);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const font = COVER_FONT_STACKS[design.font];
  const fontFor = (size: number) => `${font.weight} ${size}px ${font.family}`;
  const margin = w * 0.14;
  const innerLeft = margin + w * 0.03;
  const maxText = w - innerLeft - margin;

  if (design.frame) {
    const inset = w * 0.07;
    stamp(ctx, design, w, h, px, (fill, mode) => {
      const x = inset + w * 0.02;
      const fw = w - x - inset;
      const fh = h - inset * 2;
      if (mode === "fill") ctx.lineWidth = 2.2 * px;
      ctx.strokeStyle = fill;
      ctx.strokeRect(x, inset, fw, fh);
    });
  }

  const centerX = innerLeft + maxText / 2;
  const title = back ? "" : design.title.trim();
  let titleY = h * 0.42;
  let centerTitle = true;

  if (silhouetteArt && art) {
    const box = back
      ? { w: w * 0.22, h: h * 0.14, cy: h * 0.5 }
      : title
        ? { w: w * 0.62, h: h * 0.42, cy: h * 0.34 }
        : { w: w * 0.72, h: h * 0.72, cy: h * 0.5 };
    const mask = buildMask(art, box.w, box.h, design.artThreshold, design.artInvert);
    if (mask) {
      stampMask(ctx, design, w, h, px, mask, centerX - mask.width / 2, box.cy - mask.height / 2);
      if (!back && title) {
        titleY = h * 0.7;
        centerTitle = false;
      }
    }
  } else if (!back && !wrapArt && assets.logo) {
    const mask = buildMask(assets.logo, w * 0.26, w * 0.26, 50, false);
    if (mask) {
      stampMask(ctx, design, w, h, px, mask, centerX - mask.width / 2, h * 0.34 - mask.height / 2);
      titleY = h * 0.34 + mask.height / 2 + h * 0.08;
      centerTitle = false;
    }
  } else if (wrapArt) {
    titleY = h * 0.78;
    centerTitle = false;
  }

  if (title) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const baseSize = Math.round(w * 0.115);
    ctx.font = fontFor(baseSize);
    const lines = wrapLines(ctx, title.toUpperCase(), maxText);
    const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "");
    const size = fitFontSize(ctx, longest, fontFor, maxText, baseSize);
    const lineHeight = size * 1.25;
    const startY = centerTitle ? titleY - ((lines.length - 1) * lineHeight) / 2 : titleY;
    stamp(ctx, design, w, h, px, (fill, mode) => {
      ctx.font = fontFor(size);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        if (mode === "stroke") {
          ctx.strokeStyle = fill;
          ctx.strokeText(line, centerX, y);
        } else {
          ctx.fillStyle = fill;
          ctx.fillText(line, centerX, y);
        }
      });
    });

    const subtitle = design.subtitle?.trim();
    if (subtitle) {
      const subSize = Math.max(12 * px, Math.round(size * 0.34));
      const subY = startY + (lines.length - 1) * lineHeight + size * 0.95;
      stamp(ctx, design, w, h, px, (fill, mode) => {
        ctx.font = fontFor(subSize);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const text = subtitle.toUpperCase();
        if (mode === "stroke") {
          ctx.strokeStyle = fill;
          ctx.strokeText(text, centerX, subY);
        } else {
          ctx.fillStyle = fill;
          ctx.fillText(text, centerX, subY);
        }
      });
    }
  }
  return true;
}

/** Renders a cover to a WebP (or PNG fallback) data URL, or null when canvas is unavailable. */
export function renderCoverDataUrl(
  design: CoverDesign,
  options: RenderCoverOptions,
  assets: CoverAssets = {},
): string | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  if (!drawCover(canvas, design, options, assets)) return null;
  const webp = canvas.toDataURL("image/webp", 0.92);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}

/** Loads an image from a URL/data URL, resolving null on failure. */
export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
