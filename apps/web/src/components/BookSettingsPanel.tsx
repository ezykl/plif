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
        gap: 16,
        padding: 16,
        border: "1px solid #d6d3d1",
        borderRadius: 8,
        background: "#fafaf9",
        color: "#1c1917",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label style={{ display: "grid", gap: 4, flex: "1 1 260px" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Book title</span>
          <input
            type="text"
            aria-label="Book title"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Untitled Book"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #a8a29e",
              fontSize: 14,
            }}
          />
        </label>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={hasCover}
            onChange={(e) => onChangeHasCover(e.target.checked)}
          />
          <span>Standalone front & back cover</span>
        </label>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Reading Direction</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            aria-pressed={direction === "ltr"}
            onClick={() => onChangeDirection?.("ltr")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: direction === "ltr" ? "2px solid #1c1917" : "1px solid #d6d3d1",
              background: "#ffffff",
              fontSize: 13,
              fontWeight: direction === "ltr" ? 700 : 400,
              cursor: "pointer",
            }}
          >
            Left to Right (LTR)
          </button>
          <button
            type="button"
            aria-pressed={direction === "rtl"}
            onClick={() => onChangeDirection?.("rtl")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: direction === "rtl" ? "2px solid #1c1917" : "1px solid #d6d3d1",
              background: "#ffffff",
              fontSize: 13,
              fontWeight: direction === "rtl" ? 700 : 400,
              cursor: "pointer",
            }}
          >
            Right to Left (RTL)
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Table of Contents</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            aria-label="Chapter title"
            placeholder="Chapter title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              fontSize: 13,
              flex: "1 1 160px",
            }}
          />
          <input
            type="number"
            aria-label="Chapter page"
            min={1}
            value={chapterPage}
            onChange={(e) => setChapterPage(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              fontSize: 13,
              width: 80,
            }}
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = chapterTitle.trim();
              const pageNum = Math.max(1, Number.parseInt(chapterPage, 10) || 1);
              if (!trimmed) return;
              onChangeToc?.([...toc, { title: trimmed, page: pageNum }]);
              setChapterTitle("");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add chapter
          </button>
        </div>
        {toc.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {toc.map((item, idx) => (
              <span
                key={`${item.title}-${item.page}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "#ffffff",
                  border: "1px solid #d6d3d1",
                  fontSize: 12,
                }}
              >
                <span>
                  {item.title} (p. {item.page})
                </span>
                <button
                  type="button"
                  aria-label={`Remove chapter ${item.title}`}
                  onClick={() => onChangeToc?.(toc.filter((_, i) => i !== idx))}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#b91c1c",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>One-Click Book Presets</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
          }}
        >
          {PRESET_LIST.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-label={`Preset: ${preset.label}`}
              onClick={() => onSelectPreset(preset.id)}
              style={{
                textAlign: "left",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #d6d3d1",
                background: "#ffffff",
                cursor: "pointer",
                display: "grid",
                gap: 2,
              }}
            >
              <strong style={{ fontSize: 13 }}>{preset.label}</strong>
              <span style={{ fontSize: 12, color: "#57534e" }}>{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Page Stiffness (Density)</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("all-soft")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            All Soft Pages (Newspaper)
          </button>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("hard-covers")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Hard Front & Back Cover
          </button>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("all-hard")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            All Hard Pages (Board Book)
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Stage Theme</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
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
                  padding: 10,
                  borderRadius: 6,
                  border: active ? `2px solid ${t.accentColor}` : "1px solid #d6d3d1",
                  background: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
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
                  }}
                />
                <span style={{ display: "grid", gap: 2 }}>
                  <strong style={{ fontSize: 13 }}>{t.label}</strong>
                  <span style={{ fontSize: 11, color: "#57534e" }}>{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
