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

interface InternalPoint {
  x: number;
  y: number;
}

interface InternalCalculation {
  getBottomClipArea?: () => Array<InternalPoint | null>;
  getPosition?: () => InternalPoint;
  getCorner?: () => string;
}

interface InternalFlipController {
  state?: string;
  getCalculation?: () => InternalCalculation | null;
  getBoundsRect?: () => { pageWidth: number; height: number };
  animateFlippingTo?: (
    start: InternalPoint,
    end: InternalPoint,
    isTurned: boolean,
    needReset?: boolean,
  ) => void;
  fold?: (pt: InternalPoint) => void;
  stopMove?: () => void;
}

interface InternalCanvasRender {
  ctx?: CanvasRenderingContext2D;
  canvas?: HTMLCanvasElement;
  leftPage?: unknown;
  rightPage?: unknown;
  bottomPage?: unknown;
  flippingPage?: unknown;
  orientation?: string;
  animation?: unknown;
  getRect?: () => {
    left: number;
    top: number;
    width: number;
    height: number;
    pageWidth: number;
  };
  convertToGlobal?: (pt: InternalPoint | null, direction?: number) => InternalPoint | null;
  clear?: () => void;
  drawBookShadow?: () => void;
  drawOuterShadow?: () => void;
  setFlippingPage?: (page: unknown) => void;
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

    // Patch PageFlip's canvas renderer and flip controller so:
    // 1. Closed covers don't paint an opaque white rectangle over the empty half of the stage.
    // 2. Flipping Page 2 back to the standalone Front Cover (or flipping the last spread to a
    //    standalone Back Cover) erases the lifted page region (getBottomClipArea) instead of
    //    leaving Page 2 visible underneath on the left half of the dual-page stage.
    // 3. Swiping/dragging a page at least halfway across completes the turn smoothly.
    const internalFlip = flip as unknown as {
      getRender?: () => InternalCanvasRender;
      getFlipController?: () => InternalFlipController;
    };
    const render = internalFlip.getRender?.();
    const flipController = internalFlip.getFlipController?.();

    if (render && render.ctx && render.canvas) {
      const ctx = render.ctx;
      const canvas = render.canvas;
      render.clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };

      const origSetFlippingPage = render.setFlippingPage?.bind(render);
      if (origSetFlippingPage) {
        render.setFlippingPage = (page: unknown) => {
          if (
            page != null &&
            render.orientation !== "portrait" &&
            render.bottomPage != null &&
            render.bottomPage === page
          ) {
            render.bottomPage = null;
          }
          origSetFlippingPage(page);
        };
      }

      const origDrawBookShadow = render.drawBookShadow?.bind(render);
      if (origDrawBookShadow) {
        render.drawBookShadow = () => {
          const isSingleCoverFlip =
            render.orientation !== "portrait" &&
            render.flippingPage != null &&
            render.bottomPage == null;

          if (isSingleCoverFlip) {
            const calc = flipController?.getCalculation?.();
            const area = calc?.getBottomClipArea?.();
            const rect = render.getRect?.();
            if (area && area.length > 0 && rect && render.convertToGlobal) {
              ctx.save();
              ctx.beginPath();
              let started = false;
              for (const pt of area) {
                if (!pt) continue;
                const padded: InternalPoint = {
                  x: pt.x >= rect.pageWidth - 0.5 ? pt.x + 2 : pt.x,
                  y: pt.y <= 0.5 ? pt.y - 2 : pt.y >= rect.height - 0.5 ? pt.y + 2 : pt.y,
                };
                const globalPt = render.convertToGlobal(padded);
                if (!globalPt) continue;
                if (!started) {
                  ctx.moveTo(globalPt.x, globalPt.y);
                  started = true;
                } else {
                  ctx.lineTo(globalPt.x, globalPt.y);
                }
              }
              if (started) {
                ctx.closePath();
                ctx.clip();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              ctx.restore();
            }
          }

          const pos = flipController?.getCalculation?.()?.getPosition?.();
          const shouldDrawSpineShadow =
            (render.leftPage != null && render.rightPage != null && !isSingleCoverFlip) ||
            (render.flippingPage != null && (!isSingleCoverFlip || (pos != null && pos.x > 0)));

          if (shouldDrawSpineShadow) {
            origDrawBookShadow();
          }
        };
      }

      const origDrawOuterShadow = render.drawOuterShadow?.bind(render);
      if (origDrawOuterShadow) {
        render.drawOuterShadow = () => {
          if (render.orientation === "portrait" || render.bottomPage != null) {
            origDrawOuterShadow();
          }
        };
      }
    }

    if (flipController) {
      const origFold = flipController.fold?.bind(flipController);
      if (origFold) {
        flipController.fold = (pt: InternalPoint) => {
          if (flipController.state !== "user_fold" && render?.animation) {
            render.animation = null;
          }
          origFold(pt);
        };
      }

      const origStopMove = flipController.stopMove?.bind(flipController);
      if (origStopMove) {
        flipController.stopMove = () => {
          const calc = flipController.getCalculation?.();
          const bounds = flipController.getBoundsRect?.();
          if (
            flipController.state === "user_fold" &&
            calc &&
            bounds &&
            flipController.animateFlippingTo
          ) {
            const pos = calc.getPosition?.();
            if (pos && pos.x > 0 && pos.x <= bounds.pageWidth * 0.5) {
              const y = calc.getCorner?.() === "bottom" ? bounds.height : 0;
              flipController.animateFlippingTo(pos, { x: -bounds.pageWidth, y }, true);
              return;
            }
          }
          origStopMove();
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
