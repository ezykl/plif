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
}

export function toFlipSettings(manifest: Manifest, opts: { reduceMotion: boolean }): FlipSettings {
  const { width, height } = manifest.pageSize;
  return {
    width,
    height,
    size: "stretch",
    minWidth: Math.round(width * 0.6),
    maxWidth: width,
    minHeight: Math.round(height * 0.6),
    maxHeight: height,
    showCover: manifest.hasCover,
    usePortrait: true,
    drawShadow: !opts.reduceMotion,
    flippingTime: opts.reduceMotion ? 1 : 700,
    maxShadowOpacity: 0.35,
    mobileScrollSupport: true,
    swipeDistance: 24,
  };
}
