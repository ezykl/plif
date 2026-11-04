import { z } from "zod";

export const bookDirectionSchema = z.enum(["ltr", "rtl"]);
export type BookDirection = z.infer<typeof bookDirectionSchema>;

export const tocItemSchema = z.object({
  title: z.string().min(1),
  page: z.number().int().min(1),
});
export type TocItem = z.infer<typeof tocItemSchema>;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.25;

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return MIN_ZOOM;
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  return Math.round(clamped * 100) / 100;
}

export function stepZoom(current: number, delta: number): number {
  return clampZoom(current + delta);
}

export function formatPageHash(pageIndex: number): string {
  const pageNumber = Math.max(1, Math.floor(pageIndex) + 1);
  return `#/page/${pageNumber}`;
}

export function parsePageHash(hash: string, totalPages: number): number | null {
  if (totalPages <= 0) return null;
  const match = /^#\/?page\/(\d+)$/i.exec(hash.trim());
  if (!match || !match[1]) return null;
  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed)) return null;
  const zeroBased = parsed - 1;
  return Math.min(totalPages - 1, Math.max(0, zeroBased));
}

export function resolveArrowAction(
  key: string,
  direction: BookDirection = "ltr",
): "next" | "prev" | null {
  if (key === "ArrowRight") {
    return direction === "rtl" ? "prev" : "next";
  }
  if (key === "ArrowLeft") {
    return direction === "rtl" ? "next" : "prev";
  }
  return null;
}
