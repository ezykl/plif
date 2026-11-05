import { useState } from "react";
import {
  BOOK_PRESETS,
  THEMES,
  type BookDirection,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type TocItem,
} from "@plif/core";

export interface BookSettingsPanelProps {
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  direction?: BookDirection;
  toc?: readonly TocItem[];
  onChangeTitle: (title: string) => void;
  onChangeHasCover: (hasCover: boolean) => void;
  onChangeTheme: (theme: BookTheme) => void;
  onSelectPreset: (presetId: BookPresetId) => void;
  onApplyBulkDensity: (mode: BulkDensityMode) => void;
  onChangeDirection?: (direction: BookDirection) => void;
  onChangeToc?: (toc: TocItem[]) => void;
}

const PRESET_LIST = Object.values(BOOK_PRESETS);
const THEME_LIST = Object.values(THEMES);

export function BookSettingsPanel({
  title,
  hasCover,
  theme,
  direction = "ltr",
  toc = [],
  onChangeTitle,
  onChangeHasCover,
  onChangeTheme,
  onSelectPreset,
  onApplyBulkDensity,
  onChangeDirection,
  onChangeToc,
}: BookSettingsPanelProps) {
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterPage, setChapterPage] = useState("1");

  return (
    <section
      aria-label="Book style and cover settings"
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 20,
        padding: 20,
        border: "1px solid #e6dfd5",
        borderRadius: 10,
        background: "#fdfbf7",
        color: "#24201d",
        boxShadow: "0 2px 8px rgba(36, 32, 29, 0.04)",
      }}
    >
      {/* Title & Cover Mode */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 16,
          borderBottom: "1px solid #e6dfd5",
        }}
      >
        <label style={{ display: "grid", gap: 6, flex: "1 1 280px" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#24201d" }}>Book Title</span>
          <input
            type="text"
            aria-label="Book title"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Untitled Book"
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid #d6ccc2",
              fontSize: 14,
              color: "#24201d",
              background: "#ffffff",
              outline: "none",
            }}
          />
        </label>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            background: "#ffffff",
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #e6dfd5",
          }}
        >
          <input
            type="checkbox"
            checked={hasCover}
            onChange={(e) => onChangeHasCover(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#c25e3e" }}
          />
          <span>Standalone front & back cover</span>
        </label>
      </div>

      {/* Preset Pickers */}
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#24201d" }}>
            Book Format Preset
          </span>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b635b" }}>
            Preconfigured page bindings and spread styles
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          {PRESET_LIST.map((preset) => {
            return (
              <button
                key={preset.id}
                type="button"
                aria-label={`Preset: ${preset.label}`}
                onClick={() => onSelectPreset(preset.id)}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid #e6dfd5",
                  background: "#ffffff",
                  cursor: "pointer",
                  display: "grid",
                  gap: 4,
                  boxShadow: "0 2px 6px rgba(36, 32, 29, 0.04)",
                  transition: "all 150ms ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 14, color: "#24201d" }}>{preset.label}</strong>
                  <span style={{ fontSize: 14 }}>
                    {preset.id === "newspaper"
                      ? "📰"
                      : preset.id === "magazine"
                        ? "📖"
                        : preset.id === "hardcover"
                          ? "📕"
                          : "📄"}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#6b635b", lineHeight: 1.4 }}>
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Paper Density */}
      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#24201d" }}>
          Paper Weight & Density
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("all-soft")}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid #e6dfd5",
              background: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All Soft Pages
          </button>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("hard-covers")}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid #e6dfd5",
              background: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Hard Front & Back Cover
          </button>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("all-hard")}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid #e6dfd5",
              background: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All Hard Pages
          </button>
        </div>
      </div>

      {/* Reading Direction */}
      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#24201d" }}>Reading Direction</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            aria-label="Left to Right (LTR)"
            aria-pressed={direction === "ltr"}
            onClick={() => onChangeDirection?.("ltr")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: direction === "ltr" ? "2px solid #c25e3e" : "1px solid #e6dfd5",
              background: direction === "ltr" ? "#c25e3e" : "#ffffff",
              color: direction === "ltr" ? "#ffffff" : "#24201d",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Left to Right (LTR)</span>
            <span>→</span>
          </button>
          <button
            type="button"
            aria-label="Right to Left (RTL)"
            aria-pressed={direction === "rtl"}
            onClick={() => onChangeDirection?.("rtl")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: direction === "rtl" ? "2px solid #c25e3e" : "1px solid #e6dfd5",
              background: direction === "rtl" ? "#c25e3e" : "#ffffff",
              color: direction === "rtl" ? "#ffffff" : "#24201d",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>←</span>
            <span>Right to Left (RTL)</span>
          </button>
        </div>
      </div>

      {/* Table of Contents Chapter Editor */}
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#24201d" }}>
            Table of Contents ({toc.length} Chapters)
          </span>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b635b" }}>
            Create chapter shortcuts for readers
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>Title:</span>
            <input
              type="text"
              aria-label="Chapter title"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="e.g. Chapter 1"
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #d6ccc2",
                fontSize: 13,
              }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>Page #:</span>
            <input
              type="number"
              min={1}
              aria-label="Chapter page"
              value={chapterPage}
              onChange={(e) => setChapterPage(e.target.value)}
              style={{
                width: 70,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #d6ccc2",
                fontSize: 13,
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const pageNum = parseInt(chapterPage, 10);
              if (chapterTitle.trim() && !Number.isNaN(pageNum)) {
                onChangeToc?.([...toc, { title: chapterTitle.trim(), page: pageNum }]);
                setChapterTitle("");
              }
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: "#3e6b5c",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add chapter
          </button>
        </div>

        {toc.length > 0 && (
          <ul
            aria-label="Chapter list"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 6,
            }}
          >
            {toc.map((item, idx) => (
              <li
                key={`${item.title}-${item.page}-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#ffffff",
                  border: "1px solid #e6dfd5",
                  fontSize: 12,
                }}
              >
                <span>
                  <strong>{item.title}</strong> — Page {item.page}
                </span>
                <button
                  type="button"
                  aria-label={`Remove chapter ${item.title}`}
                  onClick={() => onChangeToc?.(toc.filter((_, i) => i !== idx))}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: "1px solid #fee2e2",
                    background: "#fff5f5",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stage Theme Picker */}
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#24201d" }}>
            Reading Stage Theme
          </span>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b635b" }}>
            Tactile ambiance and stage backdrop for reader immersion
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          {THEME_LIST.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                aria-label={`Theme: ${t.label}`}
                aria-pressed={active}
                onClick={() => onChangeTheme(t.id)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: active ? "2px solid #c25e3e" : "1px solid #e6dfd5",
                  background: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: active
                    ? "0 2px 8px rgba(194, 94, 62, 0.2)"
                    : "0 2px 4px rgba(36, 32, 29, 0.04)",
                  transition: "all 150ms ease",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: t.stageBg,
                    border: `2px solid ${t.accentColor}`,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <span style={{ display: "grid", gap: 2 }}>
                  <strong style={{ fontSize: 13, color: "#24201d" }}>{t.label}</strong>
                  <span style={{ fontSize: 11, color: "#6b635b" }}>{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
