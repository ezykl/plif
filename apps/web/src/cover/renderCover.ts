import {
  FOIL_STYLES,
  coverSeed,
  createRng,
  isLightColor,
  type CoverDesign,
  type CoverFont,
} from "@plif/core";

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
}

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
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

/** Stamps a shape (drawn by `draw`) with deboss shading and optional foil fill. */
function stamp(
  ctx: CanvasRenderingContext2D,
  design: CoverDesign,
  w: number,
  h: number,
  px: number,
  draw: (fill: string | CanvasGradient, mode: "fill" | "stroke") => void,
): void {
  const light = isLightColor(design.color);
  // 1. recessed shadow (die pressed into the cover)
  ctx.save();
  ctx.shadowColor = light ? "rgba(60, 40, 20, 0.55)" : "rgba(0, 0, 0, 0.85)";
  ctx.shadowBlur = 4 * px;
  ctx.shadowOffsetX = 1.5 * px;
  ctx.shadowOffsetY = 2 * px;
  draw(light ? "rgba(60, 40, 20, 0.55)" : "rgba(0, 0, 0, 0.8)", "fill");
  ctx.restore();
  // 2. light rim on the lower edge of the impression
  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 255, 0.28)";
  ctx.shadowBlur = 1 * px;
  ctx.shadowOffsetY = -1 * px;
  ctx.lineWidth = 1 * px;
  draw(light ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.14)", "stroke");
  ctx.restore();
  // 3. foil fill sitting inside the pocket
  if (FOIL_STYLES[design.foil].filled) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 2 * px;
    ctx.shadowOffsetY = 1 * px;
    draw(foilGradient(ctx, design, w, h), "fill");
    ctx.restore();
  }
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
 * Draws a hardbound cover (material grain, debossed + foil stamped lettering,
 * optional frame and logo) onto the given canvas. Returns false if no 2D
 * context is available (for example in jsdom).
 */
export function drawCover(
  canvas: HTMLCanvasElement,
  design: CoverDesign,
  options: RenderCoverOptions,
  logo?: CanvasImageSource | null,
): boolean {
  const scale = options.scale ?? 2;
  const w = Math.round(options.width * scale);
  const h = Math.round(options.height * scale);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const px = scale;
  const rng = createRng(coverSeed(design));
  paintMaterial(ctx, design, w, h, rng);

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
      const y = inset;
      const fw = w - x - inset;
      const fh = h - inset * 2;
      if (mode === "stroke") {
        ctx.strokeStyle = fill;
        ctx.strokeRect(x, y, fw, fh);
      } else {
        ctx.lineWidth = 2.2 * px;
        ctx.strokeStyle = fill;
        ctx.strokeRect(x, y, fw, fh);
      }
    });
  }

  const centerX = innerLeft + maxText / 2;
  let cursorY = h * 0.34;

  if (logo) {
    const lw = (logo as { width?: number }).width ?? 100;
    const lh = (logo as { height?: number }).height ?? 100;
    const target = w * 0.26;
    const ratio = Math.min(target / lw, target / lh);
    const dw = lw * ratio;
    const dh = lh * ratio;
    const mask = document.createElement("canvas");
    mask.width = Math.max(1, Math.round(dw));
    mask.height = Math.max(1, Math.round(dh));
    const mctx = mask.getContext("2d");
    if (mctx) {
      mctx.drawImage(logo, 0, 0, mask.width, mask.height);
      mctx.globalCompositeOperation = "source-in";
      mctx.fillStyle = "#000";
      mctx.fillRect(0, 0, mask.width, mask.height);
      const lx = centerX - dw / 2;
      const ly = cursorY - dh / 2;
      stamp(ctx, design, w, h, px, (fill, mode) => {
        if (mode === "stroke") return;
        if (typeof fill === "string") {
          const tint = document.createElement("canvas");
          tint.width = mask.width;
          tint.height = mask.height;
          const tctx = tint.getContext("2d");
          if (tctx) {
            tctx.drawImage(mask, 0, 0);
            tctx.globalCompositeOperation = "source-in";
            tctx.fillStyle = fill;
            tctx.fillRect(0, 0, tint.width, tint.height);
            ctx.drawImage(tint, lx, ly);
          }
        } else {
          const tint = document.createElement("canvas");
          tint.width = w;
          tint.height = h;
          const tctx = tint.getContext("2d");
          if (tctx) {
            tctx.drawImage(mask, lx, ly);
            tctx.globalCompositeOperation = "source-in";
            tctx.fillStyle = fill;
            tctx.fillRect(0, 0, w, h);
            ctx.drawImage(tint, 0, 0);
          }
        }
      });
      cursorY += dh / 2 + h * 0.08;
    }
  }

  const title = design.title.trim();
  if (title) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const baseSize = Math.round(w * 0.115);
    ctx.font = fontFor(baseSize);
    const lines = wrapLines(ctx, title.toUpperCase(), maxText);
    const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "");
    const size = fitFontSize(ctx, longest, fontFor, maxText, baseSize);
    const lineHeight = size * 1.25;
    const startY = logo ? cursorY : h * 0.42 - ((lines.length - 1) * lineHeight) / 2;
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
  logo?: CanvasImageSource | null,
): string | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  if (!drawCover(canvas, design, options, logo)) return null;
  const webp = canvas.toDataURL("image/webp", 0.92);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}
