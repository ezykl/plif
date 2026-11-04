import {
  BOOK_PRESETS,
  THEMES,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
} from "@plif/core";

export interface BookSettingsPanelProps {
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  onChangeTitle: (title: string) => void;
  onChangeHasCover: (hasCover: boolean) => void;
  onChangeTheme: (theme: BookTheme) => void;
  onSelectPreset: (presetId: BookPresetId) => void;
  onApplyBulkDensity: (mode: BulkDensityMode) => void;
}

const PRESET_LIST = Object.values(BOOK_PRESETS);
const THEME_LIST = Object.values(THEMES);

export function BookSettingsPanel({
  title,
  hasCover,
  theme,
  onChangeTitle,
  onChangeHasCover,
  onChangeTheme,
  onSelectPreset,
  onApplyBulkDensity,
}: BookSettingsPanelProps) {
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
