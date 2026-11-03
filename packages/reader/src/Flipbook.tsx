import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { KeyboardEvent } from "react";
import { PageFlip } from "page-flip";
import type { Manifest } from "@plif/core";
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
  className?: string;
}

export const Flipbook = forwardRef<FlipbookHandle, FlipbookProps>(function Flipbook(
  { manifest, onPageChange, reduceMotion = false, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // PageFlip.destroy() removes its root element, so give it a node React doesn't own.
    const host = document.createElement("div");
    container.appendChild(host);

    const flip = new PageFlip(host, toFlipSettings(manifest, { reduceMotion }));
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
  }, [manifest, reduceMotion]);

  useImperativeHandle(ref, () => ({
    next: () => flipRef.current?.flipNext(),
    prev: () => flipRef.current?.flipPrev(),
    goTo: (index) => flipRef.current?.flip(index),
  }));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") flipRef.current?.flipNext();
    if (e.key === "ArrowLeft") flipRef.current?.flipPrev();
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={manifest.title}
      tabIndex={0}
      className={className}
      onKeyDown={onKeyDown}
    />
  );
});
