import { useState } from "react";
import {
  clampZoom,
  formatPageLabel,
  MAX_ZOOM,
  MIN_ZOOM,
  stepZoom,
  ZOOM_STEP,
  type Manifest,
} from "@plif/core";

export interface ReaderToolbarProps {
  manifest: Manifest;
  currentIndex: number;
  zoom: number;
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (index: number) => void;
  onChangeZoom: (nextZoom: number) => void;
  onToggleFullscreen: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  accentColor?: string;
  textColor?: string;
}

export function ReaderToolbar({
  manifest,
  currentIndex,
  zoom,
  isFullscreen,
  onPrev,
  onNext,
  onGoToPage,
  onChangeZoom,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
  accentColor = "#d97706",
  textColor = "#f5f5f4",
}: ReaderToolbarProps) {
  const [showToc, setShowToc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  const total = manifest.pages.length;
  const remainingAfterCover = manifest.hasCover ? total - 1 : total;
  const lastSpreadSize = remainingAfterCover > 0 && remainingAfterCover % 2 === 0 ? 2 : 1;
  const lastSpreadStartIndex = Math.max(0, total - lastSpreadSize);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < lastSpreadStartIndex;
  const safeZoom = clampZoom(zoom);
  const zoomPercent = `${Math.round(safeZoom * 100)}%`;

  const buttonStyle = {
    minHeight: 44,
    padding: "6px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255, 255, 255, 0.16)",
    background: "rgba(255, 255, 255, 0.08)",
    color: textColor,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "background 150ms ease, border-color 150ms ease",
  } as const;

  const isSoundOn = soundEnabled !== false;

  return (
    <div
      style={{
        width: "min(920px, 94vw)",
        display: "grid",
        gap: 12,
      }}
    >
      <div
        role="toolbar"
        aria-label="Reader controls"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderRadius: 999,
          background: "rgba(20, 20, 19, 0.92)",
          color: "#ffffff",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "0 14px 34px rgba(20, 20, 19, 0.22)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {canPrev && (
            <button
              type="button"
              aria-label="Previous page"
              title="Previous page (Left Arrow)"
              onClick={onPrev}
              style={{
                ...buttonStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
          )}
          <span style={{ fontWeight: 600, minWidth: 68, textAlign: "center" }}>
            {formatPageLabel(currentIndex, total, manifest.hasCover, false)}
          </span>
          {canNext && (
            <button
              type="button"
              aria-label="Next page"
              title="Next page (Right Arrow)"
              onClick={onNext}
              style={{
                ...buttonStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>Next</span>
              <svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            flex: "1 1 160px",
            maxWidth: 260,
          }}
        >
          <span>Page</span>
          <input
            type="range"
            aria-label="Go to page"
            min={1}
            max={Math.max(1, total)}
            value={Math.min(total, Math.max(1, currentIndex + 1))}
            onChange={(e) => {
              const pageNumber = Number.parseInt(e.target.value, 10);
              if (Number.isFinite(pageNumber)) {
                onGoToPage(pageNumber - 1);
              }
            }}
            style={{ width: "100%", accentColor }}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            aria-label="Zoom out"
            title="Zoom out (-)"
            disabled={safeZoom <= MIN_ZOOM}
            onClick={() => onChangeZoom(stepZoom(safeZoom, -ZOOM_STEP))}
            style={buttonStyle}
          >
            −
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 44, textAlign: "center" }}>
            {zoomPercent}
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            title="Zoom in (+)"
            disabled={safeZoom >= MAX_ZOOM}
            onClick={() => onChangeZoom(stepZoom(safeZoom, ZOOM_STEP))}
            style={buttonStyle}
          >
            +
          </button>
          {safeZoom > MIN_ZOOM && (
            <button
              type="button"
              aria-label="Reset zoom"
              title="Reset zoom (0)"
              onClick={() => onChangeZoom(MIN_ZOOM)}
              style={buttonStyle}
            >
              Reset
            </button>
          )}

          {manifest.toc.length > 0 && (
            <button
              type="button"
              aria-label="Table of contents"
              aria-expanded={showToc}
              onClick={() => setShowToc((prev) => !prev)}
              style={{
                ...buttonStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Contents ({manifest.toc.length})</span>
            </button>
          )}

          <button
            type="button"
            aria-label="Page thumbnails"
            aria-expanded={showThumbnails}
            onClick={() => setShowThumbnails((prev) => !prev)}
            style={{
              ...buttonStyle,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Thumbnails</span>
          </button>

          {onToggleSound && (
            <button
              type="button"
              aria-label={
                isSoundOn ? "Mute paper flip sound (press M)" : "Enable paper flip sound (press M)"
              }
              title={isSoundOn ? "Mute sound (M)" : "Enable sound (M)"}
              onClick={onToggleSound}
              style={{
                ...buttonStyle,
                minWidth: 44,
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {isSoundOn ? (
                <>
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>Sound on</span>
                </>
              ) : (
                <>
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span>Sound off</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
            onClick={onToggleFullscreen}
            style={{
              ...buttonStyle,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isFullscreen ? (
                <>
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </>
              ) : (
                <>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </>
              )}
            </svg>
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts & Arrow Navigation Legend */}
      <div
        aria-label="Keyboard shortcuts"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontSize: 12,
          fontWeight: 600,
          color: "#141413",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(10px)",
          padding: "6px 16px",
          borderRadius: 999,
          border: "1px solid rgba(20, 20, 19, 0.12)",
          justifySelf: "center",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <kbd
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px 6px",
              borderRadius: 5,
              background: "#141413",
              color: "#ffffff",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            <svg
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </kbd>
          <kbd
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px 6px",
              borderRadius: 5,
              background: "#141413",
              color: "#ffffff",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            <svg
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </kbd>
          <span>Arrow keys to flip</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <kbd
            style={{
              padding: "1px 6px",
              borderRadius: 5,
              background: "#141413",
              color: "#ffffff",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            M
          </kbd>
          <span>Sound</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <kbd
            style={{
              padding: "1px 6px",
              borderRadius: 5,
              background: "#141413",
              color: "#ffffff",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            F
          </kbd>
          <span>Fullscreen</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <kbd
            style={{
              padding: "1px 6px",
              borderRadius: 5,
              background: "#141413",
              color: "#ffffff",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          >
            + / −
          </kbd>
          <span>Zoom</span>
        </span>
      </div>

      {showToc && manifest.toc.length > 0 && (
        <nav
          aria-label="Table of contents list"
          style={{
            background: "#fafaf9",
            color: "#1c1917",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #d6d3d1",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {manifest.toc.map((item, idx) => (
            <button
              key={`${item.title}-${item.page}-${idx}`}
              type="button"
              onClick={() => onGoToPage(Math.max(0, Math.min(total - 1, item.page - 1)))}
              style={{
                minHeight: 44,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #d6d3d1",
                background: "#ffffff",
                color: "#1c1917",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {item.title} (p. {item.page})
            </button>
          ))}
        </nav>
      )}

      {showThumbnails && (
        <div
          aria-label="Page thumbnails strip"
          style={{
            background: "#fafaf9",
            color: "#1c1917",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #d6d3d1",
            display: "flex",
            gap: 10,
            overflowX: "auto",
          }}
        >
          {manifest.pages.map((page, i) => {
            const active = i === currentIndex;
            return (
              <button
                key={`${page.src}-${i}`}
                type="button"
                aria-label={`Thumbnail page ${i + 1}`}
                onClick={() => onGoToPage(i)}
                style={{
                  display: "grid",
                  gap: 4,
                  padding: 6,
                  borderRadius: 6,
                  border: active ? `2px solid ${accentColor}` : "1px solid #d6d3d1",
                  background: "#ffffff",
                  cursor: "pointer",
                  flex: "0 0 auto",
                }}
              >
                <img
                  src={page.src}
                  alt={page.alt ?? `Page ${i + 1}`}
                  style={{ width: 56, height: 78, objectFit: "cover", borderRadius: 4 }}
                />
                <span style={{ fontSize: 11, fontWeight: 600 }}>#{i + 1}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
