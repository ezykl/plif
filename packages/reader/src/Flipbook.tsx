import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { KeyboardEvent } from "react";
import { PageFlip } from "page-flip";
import { clampZoom, resolveArrowAction, type Manifest } from "@plif/core";
import { toFlipSettings } from "./settings";
import { playPaperTurnSound } from "./audio";

export interface FlipbookHandle {
  next(): void;
  prev(): void;
  goTo(index: number): void;
}

export interface FlipbookProps {
  manifest: Manifest;
  initialPage?: number;
  onPageChange?: (index: number) => void;
  reduceMotion?: boolean;
  zoom?: number;
  className?: string;
  soundEnabled?: boolean;
}

interface InternalCanvasRender {
  ctx?: CanvasRenderingContext2D;
  canvas?: HTMLCanvasElement;
  leftPage?: unknown;
  rightPage?: unknown;
  flippingPage?: unknown;
  clear?: () => void;
  drawBookShadow?: () => void;
}

export const Flipbook = forwardRef<FlipbookHandle, FlipbookProps>(function Flipbook(
  {
    manifest,
    initialPage = 0,
    onPageChange,
    reduceMotion,
    zoom = 1,
    className,
    soundEnabled = true,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const currentPageRef = useRef<number>(initialPage);
  currentPageRef.current = Math.min(initialPage, Math.max(0, manifest.pages.length - 1));
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

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
    host.style.margin = "0 auto";
    container.appendChild(host);

    const startPage = Math.min(currentPageRef.current, Math.max(0, manifest.pages.length - 1));
    const flip = new PageFlip(
      host,
      toFlipSettings(manifest, {
        reduceMotion: effectiveReduceMotion,
        ...(startPage > 0 ? { startPage } : {}),
      }),
    );
    flip.loadFromImages(manifest.pages.map((p) => p.src));

    // Patch PageFlip's canvas clear() so closed covers don't paint an opaque white rectangle
    // over the empty half of the dual-page stage.
    const render = (flip as unknown as { getRender?: () => InternalCanvasRender }).getRender?.();
    if (render && render.ctx && render.canvas) {
      const ctx = render.ctx;
      const canvas = render.canvas;
      render.clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
      const origDrawBookShadow = render.drawBookShadow?.bind(render);
      if (origDrawBookShadow) {
        render.drawBookShadow = () => {
          if ((render.leftPage && render.rightPage) || render.flippingPage) {
            origDrawBookShadow();
          }
        };
      }
    }

    manifest.pages.forEach((page, i) => {
      if (page.density) flip.getPage(i)?.setDensity(page.density);
    });
    flip.on("flip", (e) => {
      const nextIndex = e.data as number;
      currentPageRef.current = nextIndex;
      if (soundEnabledRef.current !== false && !effectiveReduceMotion) {
        playPaperTurnSound();
      }
      onPageChangeRef.current?.(nextIndex);
    });
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
      goTo: (index) => {
        currentPageRef.current = index;
        flipRef.current?.flip(index);
      },
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
        width: "100%",
        transform: `scale(${safeZoom})`,
        transformOrigin: "center top",
        transition: effectiveReduceMotion ? "none" : "transform 0.15s ease",
      }}
    />
  );
});
