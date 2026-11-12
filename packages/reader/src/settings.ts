import type { Manifest } from "@plif/core";

export interface FlipSettings {
  width: number;
  height: number;
  size: "stretch";
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  showCover: boolean;
  usePortrait: boolean;
  drawShadow: boolean;
  flippingTime: number;
  maxShadowOpacity: number;
  mobileScrollSupport: boolean;
  swipeDistance: number;
  startPage?: number;
}

export function toFlipSettings(
  manifest: Manifest,
  opts: { reduceMotion: boolean; startPage?: number },
): FlipSettings {
  const { width, height } = manifest.pageSize;
  return {
    width,
    height,
    size: "stretch",
    minWidth: Math.min(Math.round(width * 0.6), 288),
    maxWidth: width,
    minHeight: Math.min(Math.round(height * 0.6), Math.round(288 * (height / width))),
    maxHeight: height,
    showCover: manifest.hasCover,
    usePortrait: true,
    drawShadow: !opts.reduceMotion,
    flippingTime: opts.reduceMotion ? 1 : 700,
    maxShadowOpacity: 0.35,
    mobileScrollSupport: true,
    swipeDistance: 24,
    ...(opts.startPage !== undefined ? { startPage: opts.startPage } : {}),
  };
}
