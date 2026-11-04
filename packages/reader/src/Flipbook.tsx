import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { KeyboardEvent } from "react";
import { PageFlip } from "page-flip";
import { clampZoom, resolveArrowAction, type Manifest } from "@plif/core";
import { toFlipSettings } from "./settings";

export interface FlipbookHandle {
  next(): void;
  prev(): void;
  goTo(index: number): void;
}

export interface FlipbookProps {
  manifest: Manifest;
  onPageChange?: (index: number) => void;
  reduceMotion?: boolean;
  zoom?: number;
  className?: string;
}

export const Flipbook = forwardRef<FlipbookHandle, FlipbookProps>(function Flipbook(
  { manifest, onPageChange, reduceMotion, zoom = 1, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const effectiveReduceMotion =
    reduceMotion ??
    (typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false);

  const safeZoom = clampZoom(zoom);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // PageFlip.destroy() removes its root element, so give it a node React doesn't own.
    const host = document.createElement("div");
    container.appendChild(host);

    const flip = new PageFlip(
      host,
      toFlipSettings(manifest, { reduceMotion: effectiveReduceMotion }),
    );
    flip.loadFromImages(manifest.pages.map((p) => p.src));
    manifest.pages.forEach((page, i) => {
      if (page.density) flip.getPage(i)?.setDensity(page.density);
    });
    flip.on("flip", (e) => onPageChangeRef.current?.(e.data as number));
    flipRef.current = flip;

    return () => {
      flip.destroy();
      flipRef.current = null;
    };
  }, [manifest, effectiveReduceMotion]);

  useImperativeHandle(
    ref,
    () => ({
      next: () => flipRef.current?.flipNext(),
      prev: () => flipRef.current?.flipPrev(),
      goTo: (index) => flipRef.current?.flip(index),
    }),
    [],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const action = resolveArrowAction(e.key, manifest.direction);
    if (action === "next") {
      e.preventDefault();
      flipRef.current?.flipNext();
    } else if (action === "prev") {
      e.preventDefault();
      flipRef.current?.flipPrev();
    }
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={manifest.title}
      dir={manifest.direction}
      tabIndex={0}
      className={className}
      onKeyDown={onKeyDown}
      style={{
        transform: `scale(${safeZoom})`,
        transformOrigin: "center top",
        transition: effectiveReduceMotion ? "none" : "transform 0.15s ease",
      }}
    />
  );
});
