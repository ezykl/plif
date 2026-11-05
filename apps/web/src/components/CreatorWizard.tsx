import {
  THEMES,
  type BookDirection,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type ImportedPage,
  type Manifest,
  type TocItem,
} from "@plif/core";
import { BookSettingsPanel } from "./BookSettingsPanel";
import { PageOrganizer } from "./PageOrganizer";
import { PublishPanel } from "./PublishPanel";

export type WizardStep = "upload" | "arrange" | "publish";

export interface CreatorWizardProps {
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  pages: readonly ImportedPage[];
  manifest?: Manifest;
  direction?: BookDirection;
  toc?: readonly TocItem[];
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
  onChangeDirection?: (direction: BookDirection) => void;
  onChangeToc?: (toc: TocItem[]) => void;
  onResetToSample: () => void;
  onDownloadHtml?: () => void;
  onDownloadManifest?: () => void;
}

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: "upload", label: "1. Upload", icon: "📄" },
  { id: "arrange", label: "2. Arrange & Style", icon: "🎨" },
  { id: "publish", label: "3. Preview & Publish", icon: "🚀" },
];

export function CreatorWizard({
  step,
  onStepChange,
  title,
  hasCover,
  theme,
  pages,
  manifest,
  direction = "ltr",
  toc = [],
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
  onChangeDirection,
  onChangeToc,
  onResetToSample,
  onDownloadHtml,
  onDownloadManifest,
}: CreatorWizardProps) {
  const themeTokens = THEMES[theme];

  return (
    <div
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 16,
      }}
    >
      {/* Top Stationery Nav Bar */}
      <div
        role="tablist"
        aria-label="Flipbook creation steps"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fdfbf7",
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #e6dfd5",
          boxShadow: "0 2px 6px rgba(36, 32, 29, 0.04)",
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
                aria-label={s.label}
                aria-selected={active}
                onClick={() => onStepChange(s.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 9999,
                  border: active ? "2px solid #c25e3e" : "1px solid #e6dfd5",
                  background: active ? "#c25e3e" : "#ffffff",
                  color: active ? "#ffffff" : "#24201d",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: active ? "0 2px 8px rgba(194, 94, 62, 0.25)" : "none",
                  transition: "all 150ms ease",
                }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
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
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#c25e3e",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(194, 94, 62, 0.25)",
                transition: "all 150ms ease",
              }}
            >
              <span>Next: Arrange & Style</span>
              <span>→</span>
            </button>
          )}
          {step === "arrange" && (
            <>
              <button
                type="button"
                onClick={() => onStepChange("upload")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #e6dfd5",
                  background: "#ffffff",
                  color: "#24201d",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Back: Upload
              </button>
              <button
                type="button"
                onClick={() => onStepChange("publish")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#c25e3e",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(194, 94, 62, 0.25)",
                }}
              >
                <span>Next: Preview & Publish</span>
                <span>→</span>
              </button>
            </>
          )}
          {step === "publish" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #e6dfd5",
                background: "#ffffff",
                color: "#24201d",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ← Back: Arrange & Style
            </button>
          )}
        </div>
      </div>

      {/* Step Reassuring Guidance Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 8,
          background: "#f5efe6",
          border: "1px solid #e6dfd5",
          fontSize: 13,
          color: "#6b635b",
        }}
      >
        <span style={{ fontSize: 16 }}>
          {step === "upload" ? "🔒" : step === "arrange" ? "📖" : "🚀"}
        </span>
        <span>
          {step === "upload" &&
            "100% Client-Side: Drop in your PDF or images. Files process in-memory and never leave your browser."}
          {step === "arrange" &&
            "Book Binding & Style: Customize page density, standalone covers, themes, and reading direction."}
          {step === "publish" &&
            "Ready to Share: Download a portable standalone flipbook or grab embed code for your website."}
        </span>
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
            direction={direction}
            toc={toc}
            onChangeTitle={onChangeTitle}
            onChangeHasCover={onChangeHasCover}
            onChangeTheme={onChangeTheme}
            onSelectPreset={onSelectPreset}
            onApplyBulkDensity={onApplyBulkDensity}
            onChangeDirection={onChangeDirection}
            onChangeToc={onChangeToc}
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
        <div style={{ display: "grid", gap: 16 }}>
          <section
            aria-label="Publish summary"
            style={{
              padding: 16,
              borderRadius: 10,
              border: "1px solid #e6dfd5",
              background: "#ffffff",
              color: "#24201d",
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(36, 32, 29, 0.05)",
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "#3e6b5c",
                    color: "#ffffff",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Ready
                </span>
                <strong style={{ fontSize: 16, fontFamily: "Charter, Georgia, serif" }}>
                  Ready to Publish: {title.trim() || "Untitled Book"}
                </strong>
              </div>
              <span style={{ fontSize: 13, color: "#6b635b" }}>
                {pages.length > 0 ? `${pages.length} imported pages` : "12 sample pages"} •{" "}
                {hasCover ? "Standalone cover" : "Newspaper spread (no cover)"} • Theme:{" "}
                {themeTokens.label} •{" "}
                {direction === "rtl" ? "Right-to-Left (RTL)" : "Left-to-Right (LTR)"} • {toc.length}{" "}
                TOC chapters
              </span>
            </div>
            <button
              type="button"
              onClick={onResetToSample}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #e6dfd5",
                background: "#fdfbf7",
                color: "#24201d",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              Load Sample Book
            </button>
          </section>

          {manifest && onDownloadHtml && onDownloadManifest && (
            <PublishPanel
              manifest={manifest}
              onDownloadHtml={onDownloadHtml}
              onDownloadManifest={onDownloadManifest}
            />
          )}
        </div>
      )}
    </div>
  );
}
