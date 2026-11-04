import {
  THEMES,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type ImportedPage,
} from "@plif/core";
import { BookSettingsPanel } from "./BookSettingsPanel";
import { PageOrganizer } from "./PageOrganizer";

export type WizardStep = "upload" | "arrange" | "publish";

export interface CreatorWizardProps {
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  pages: readonly ImportedPage[];
  isImporting?: boolean;
  progressText?: string | null;
  errorText?: string | null;
  onUploadFiles: (files: File[]) => void;
  onChangePages: (pages: ImportedPage[]) => void;
  onChangeTitle: (title: string) => void;
  onChangeHasCover: (hasCover: boolean) => void;
  onChangeTheme: (theme: BookTheme) => void;
  onSelectPreset: (presetId: BookPresetId) => void;
  onApplyBulkDensity: (mode: BulkDensityMode) => void;
  onResetToSample: () => void;
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "upload", label: "1. Upload" },
  { id: "arrange", label: "2. Arrange & Style" },
  { id: "publish", label: "3. Preview & Publish" },
];

export function CreatorWizard({
  step,
  onStepChange,
  title,
  hasCover,
  theme,
  pages,
  isImporting = false,
  progressText = null,
  errorText = null,
  onUploadFiles,
  onChangePages,
  onChangeTitle,
  onChangeHasCover,
  onChangeTheme,
  onSelectPreset,
  onApplyBulkDensity,
  onResetToSample,
}: CreatorWizardProps) {
  const themeTokens = THEMES[theme];

  return (
    <div
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 12,
      }}
    >
      <div
        role="tablist"
        aria-label="Flipbook creation steps"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fafaf9",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #d6d3d1",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {STEPS.map((s) => {
            const active = s.id === step;
            return (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onStepChange(s.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: active ? `2px solid ${themeTokens.accentColor}` : "1px solid #d6d3d1",
                  background: active ? "#1c1917" : "#ffffff",
                  color: active ? "#ffffff" : "#1c1917",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {step === "upload" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: themeTokens.accentColor,
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Next: Arrange & Style →
            </button>
          )}
          {step === "arrange" && (
            <>
              <button
                type="button"
                onClick={() => onStepChange("upload")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #d6d3d1",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                ← Back: Upload
              </button>
              <button
                type="button"
                onClick={() => onStepChange("publish")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: themeTokens.accentColor,
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Next: Preview & Publish →
              </button>
            </>
          )}
          {step === "publish" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d6d3d1",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              ← Back: Arrange & Style
            </button>
          )}
        </div>
      </div>

      {step === "upload" && (
        <PageOrganizer
          pages={pages}
          isImporting={isImporting}
          progressText={progressText}
          errorText={errorText}
          onUploadFiles={onUploadFiles}
          onChangePages={onChangePages}
        />
      )}

      {step === "arrange" && (
        <>
          <BookSettingsPanel
            title={title}
            hasCover={hasCover}
            theme={theme}
            onChangeTitle={onChangeTitle}
            onChangeHasCover={onChangeHasCover}
            onChangeTheme={onChangeTheme}
            onSelectPreset={onSelectPreset}
            onApplyBulkDensity={onApplyBulkDensity}
          />
          <PageOrganizer
            pages={pages}
            isImporting={isImporting}
            progressText={progressText}
            errorText={errorText}
            onUploadFiles={onUploadFiles}
            onChangePages={onChangePages}
          />
        </>
      )}

      {step === "publish" && (
        <section
          aria-label="Publish summary"
          style={{
            padding: 16,
            borderRadius: 8,
            border: "1px solid #d6d3d1",
            background: "#fafaf9",
            color: "#1c1917",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: 15 }}>
              Ready to Publish: {title.trim() || "Untitled Book"}
            </strong>
            <span style={{ fontSize: 13, color: "#57534e" }}>
              {pages.length > 0 ? `${pages.length} imported pages` : "12 sample pages"} •{" "}
              {hasCover ? "Standalone cover" : "Newspaper spread (no cover)"} • Theme:{" "}
              {themeTokens.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onResetToSample}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Load Sample Book
          </button>
        </section>
      )}
    </div>
  );
}
