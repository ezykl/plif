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

interface InternalImagePage {
  image?: CanvasImageSource;
  isLoad?: boolean;
  simpleDraw?: (orientation: number) => void;
  drawLoader?: (
    ctx: CanvasRenderingContext2D,
    pos: InternalPoint,
    width: number,
    height: number,
  ) => void;
  getDensity?: () => "soft" | "hard";
  setDensity?: (density: "soft" | "hard") => void;
  getDrawingDensity?: () => "soft" | "hard";
  setDrawingDensity?: (density: "soft" | "hard") => void;
}

interface InternalPageCollection {
  getPages?: () => InternalImagePage[];
}

interface InternalCalculation {
  getBottomClipArea?: () => Array<InternalPoint | null>;
  getPosition?: () => InternalPoint;
  getCorner?: () => string;
}

interface InternalFlipController {
  state?: string;
  start?: (pt: InternalPoint) => boolean;
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

interface InternalRect {
  left: number;
  top: number;
  width: number;
  height: number;
  pageWidth: number;
}

interface InternalCanvasRender {
  ctx?: CanvasRenderingContext2D;
  canvas?: HTMLCanvasElement;
  leftPage?: InternalImagePage | null;
  rightPage?: InternalImagePage | null;
  bottomPage?: InternalImagePage | null;
  flippingPage?: InternalImagePage | null;
  orientation?: string;
  animation?: unknown;
  getDirection?: () => number;
  getRect?: () => InternalRect;
  convertToGlobal?: (pt: InternalPoint | null, direction?: number) => InternalPoint | null;
  clear?: () => void;
  drawFrame?: () => void;
  drawBookShadow?: () => void;
  drawOuterShadow?: () => void;
  setFlippingPage?: (page: InternalImagePage | null) => void;
}

function drawStaticHardBoardRim(
  ctx: CanvasRenderingContext2D,
  rect: InternalRect,
  side: "left" | "right",
): void {
  if (!ctx.strokeRect) return;
  ctx.save();
  const x = side === "left" ? rect.left : rect.left + rect.pageWidth;
  ctx.strokeStyle = "rgba(28, 22, 19, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, rect.top + 1.5, rect.pageWidth - 3, rect.height - 3);
  ctx.restore();
}

function drawRigidHardcoverFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  render: InternalCanvasRender,
  flipController: InternalFlipController | undefined,
  origDrawBookShadow: (() => void) | undefined,
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const rect = render.getRect?.();
  if (!rect) return;

  const direction = render.getDirection?.() ?? 0;
  const pos = flipController?.getCalculation?.()?.getPosition?.();
  const rawProgress =
    rect.pageWidth > 0 ? (rect.pageWidth - (pos?.x ?? rect.pageWidth)) / (2 * rect.pageWidth) : 0;
  const progress = Math.max(0, Math.min(1, rawProgress));
  const theta = progress * Math.PI;
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  // 1. Draw stationary flat pages underneath the rigid board
  if (direction === 0) {
    if (render.orientation !== "portrait" && render.leftPage != null) {
      render.leftPage.simpleDraw?.(0);
      if (render.leftPage.getDensity?.() === "hard") {
        drawStaticHardBoardRim(ctx, rect, "left");
      }
    }
    if (render.bottomPage != null) {
      render.bottomPage.simpleDraw?.(1);
    }
  } else {
    if (render.orientation !== "portrait" && render.bottomPage != null) {
      render.bottomPage.simpleDraw?.(0);
    }
    if (render.rightPage != null) {
      render.rightPage.simpleDraw?.(1);
      if (render.rightPage.getDensity?.() === "hard") {
        drawStaticHardBoardRim(ctx, rect, "right");
      }
    }
  }

  // 2. Draw center spine shadow when pages sit on both sides or board is upright near spine
  const hasLeftUnderlying =
    render.orientation !== "portrait" &&
    (direction === 0 ? render.leftPage != null : render.bottomPage != null);
  const hasRightUnderlying = direction === 0 ? render.bottomPage != null : render.rightPage != null;
  if ((hasLeftUnderlying && hasRightUnderlying) || sinTheta > 0.15) {
    origDrawBookShadow?.();
  }

  // 3. Determine which side of the spine the rigid board is on and which face is visible
  const isFirstHalf = cosTheta >= 0;
  const boardSide: "left" | "right" = isFirstHalf
    ? direction === 0
      ? "right"
      : "left"
    : direction === 0
      ? "left"
      : "right";
  const boardPage = isFirstHalf
    ? ((direction === 0 ? render.rightPage : render.leftPage) ?? render.flippingPage)
    : render.flippingPage;

  if (!boardPage) return;

  const spineX = rect.left + rect.pageWidth;
  const topY = rect.top;
  const height = rect.height;
  const projectedWidth = Math.max(2, rect.pageWidth * Math.abs(cosTheta));
  const perspectiveLift = sinTheta * (height * 0.055);
  const outerX = boardSide === "right" ? spineX + projectedWidth : spineX - projectedWidth;
  const boardLeftX = boardSide === "right" ? spineX : spineX - projectedWidth;

  // 4. Cast a straight-edge drop shadow onto the underlying page if one is present on boardSide
  const hasSurfaceUnderBoard = boardSide === "left" ? hasLeftUnderlying : hasRightUnderlying;
  if (hasSurfaceUnderBoard && sinTheta > 0.01 && ctx.createLinearGradient) {
    const shadowReach = Math.min(rect.pageWidth, projectedWidth + 44 * sinTheta);
    const shadowEndX = boardSide === "right" ? spineX + shadowReach : spineX - shadowReach;
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      boardSide === "right" ? spineX : spineX - rect.pageWidth,
      topY,
      rect.pageWidth,
      height,
    );
    ctx.clip();
    const dropGrad = ctx.createLinearGradient(spineX, topY, shadowEndX, topY);
    const alpha = (0.38 * sinTheta).toFixed(3);
    dropGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    dropGrad.addColorStop(0.75, `rgba(0, 0, 0, ${(0.22 * sinTheta).toFixed(3)})`);
    dropGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = dropGrad;
    ctx.fillRect(boardSide === "right" ? spineX : shadowEndX, topY, shadowReach, height);
    ctx.restore();
  }

  // 5. Render the rigid hardcover board using vertical perspective slices (no corner curl)
  const slices = 24;
  if (boardPage.isLoad && boardPage.image && ctx.drawImage) {
    for (let i = 0; i < slices; i++) {
      const u0 = i / slices;
      const u1 = (i + 1) / slices;
      const uMid = (i + 0.5) / slices;
      const sliceLift = uMid * perspectiveLift;
      const sliceWidth = (u1 - u0) * projectedWidth + 0.8;
      const sliceX =
        boardSide === "right" ? spineX + u0 * projectedWidth : spineX - u1 * projectedWidth - 0.8;

      ctx.save();
      ctx.beginPath();
      ctx.rect(sliceX, topY - perspectiveLift - 2, sliceWidth, height + 2 * perspectiveLift + 4);
      ctx.clip();
      ctx.drawImage(
        boardPage.image,
        boardLeftX,
        topY - sliceLift,
        projectedWidth,
        height + 2 * sliceLift,
      );
      ctx.restore();
    }
  } else if (boardPage.drawLoader) {
    boardPage.drawLoader(ctx, { x: boardLeftX, y: topY }, projectedWidth, height);
  }

  // 6. Apply 3D board lighting and rigid bookbinder board thickness edge
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(spineX, topY);
  ctx.lineTo(outerX, topY - perspectiveLift);
  ctx.lineTo(outerX, topY + height + perspectiveLift);
  ctx.lineTo(spineX, topY + height);
  ctx.closePath();

  if (ctx.createLinearGradient && sinTheta > 0.01) {
    const surfaceGrad = ctx.createLinearGradient(spineX, topY, outerX, topY);
    surfaceGrad.addColorStop(0, `rgba(0, 0, 0, ${(0.26 * sinTheta).toFixed(3)})`);
    surfaceGrad.addColorStop(0.65, `rgba(0, 0, 0, ${(0.05 * sinTheta).toFixed(3)})`);
    surfaceGrad.addColorStop(1, `rgba(255, 255, 255, ${(0.09 * sinTheta).toFixed(3)})`);
    ctx.fillStyle = surfaceGrad;
    ctx.fill?.();
  }

  if (ctx.stroke) {
    ctx.strokeStyle = "rgba(28, 22, 19, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  // Outer bookbinder board thickness rim (visible as the rigid cover lifts in 3D)
  if (sinTheta > 0.04 && ctx.fill) {
    const rimThickness = Math.max(2.5, 5.5 * sinTheta);
    const rimDir = boardSide === "right" ? -1 : 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(outerX, topY - perspectiveLift);
    ctx.lineTo(outerX + rimDir * rimThickness, topY - perspectiveLift + 1);
    ctx.lineTo(outerX + rimDir * rimThickness, topY + height + perspectiveLift - 1);
    ctx.lineTo(outerX, topY + height + perspectiveLift);
    ctx.closePath();
    ctx.fillStyle = "#e6dfd5";
    ctx.fill();
    if (ctx.stroke) {
      ctx.strokeStyle = "#24201d";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }
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
    // 3. Hard-density covers/pages ("hard") pivot rigidly around the center spine in 3D
    //    perspective with a thick bookbinder board edge instead of curling like soft paper.
    // 4. Swiping/dragging a page at least halfway across completes the turn smoothly.
    const internalFlip = flip as unknown as {
      getRender?: () => InternalCanvasRender;
      getFlipController?: () => InternalFlipController;
      getPageCollection?: () => InternalPageCollection;
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
        render.setFlippingPage = (page: InternalImagePage | null) => {
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

      const origDrawFrame = render.drawFrame?.bind(render);
      if (origDrawFrame) {
        render.drawFrame = () => {
          const isHardFlip =
            render.orientation !== "portrait" &&
            render.flippingPage != null &&
            render.flippingPage.getDrawingDensity?.() === "hard";

          if (isHardFlip) {
            drawRigidHardcoverFrame(ctx, canvas, render, flipController, origDrawBookShadow);
            return;
          }

          origDrawFrame();

          const rect = render.getRect?.();
          if (rect && render.orientation !== "portrait" && render.flippingPage == null) {
            if (render.leftPage?.getDensity?.() === "hard") {
              drawStaticHardBoardRim(ctx, rect, "left");
            }
            if (render.rightPage?.getDensity?.() === "hard") {
              drawStaticHardBoardRim(ctx, rect, "right");
            }
          }
        };
      }
    }

    if (flipController) {
      const origStart = flipController.start?.bind(flipController);
      if (origStart) {
        flipController.start = (pt: InternalPoint) => {
          const pages = internalFlip.getPageCollection?.()?.getPages?.();
          if (pages) {
            for (const p of pages) {
              p.setDrawingDensity?.(p.getDensity?.() ?? "soft");
            }
          }
          return origStart(pt);
        };
      }

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
    const collectionPages = internalFlip.getPageCollection?.()?.getPages?.();
    if (collectionPages) {
      collectionPages.forEach((p, i) => {
        const targetDensity = manifest.pages[i]?.density ?? "soft";
        p.setDensity?.(targetDensity);
        p.setDrawingDensity?.(targetDensity);
      });
    }
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
