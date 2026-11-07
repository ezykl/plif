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
  const safeZoom = clampZoom(zoom);
  const zoomPercent = `${Math.round(safeZoom * 100)}%`;

  const buttonStyle = {
    minHeight: 44,
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${accentColor}`,
    background: "transparent",
    color: textColor,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  } as const;

  const isSoundOn = soundEnabled !== false;

  return (
    <div
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 10,
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
          padding: "10px 16px",
          borderRadius: 12,
          background: "rgba(0, 0, 0, 0.18)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" aria-label="Previous page" onClick={onPrev} style={buttonStyle}>
            Previous
          </button>
          <span style={{ fontWeight: 600, minWidth: 68, textAlign: "center" }}>
            {formatPageLabel(currentIndex, total, manifest.hasCover, false)}
          </span>
          <button type="button" aria-label="Next page" onClick={onNext} style={buttonStyle}>
            Next
          </button>
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
              style={buttonStyle}
            >
              Contents ({manifest.toc.length})
            </button>
          )}

          <button
            type="button"
            aria-label="Page thumbnails"
            aria-expanded={showThumbnails}
            onClick={() => setShowThumbnails((prev) => !prev)}
            style={buttonStyle}
          >
            Thumbnails
          </button>

          {onToggleSound && (
            <button
              type="button"
              aria-label={
                isSoundOn ? "Mute paper flip sound (press M)" : "Enable paper flip sound (press M)"
              }
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
              {isSoundOn ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
          )}

          <button
            type="button"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={onToggleFullscreen}
            style={buttonStyle}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
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
