import { type ReactNode } from "react";
import {
  THEMES,
  type BookDirection,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type CoverDesign,
  type ImportedPage,
  type Manifest,
  type PageDimensions,
  type TocItem,
} from "@plif/core";
import { BookSettingsPanel } from "./BookSettingsPanel";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadExportIcon,
  SlidersStyleIcon,
  UploadDocumentIcon,
} from "./Icons";
import { PageOrganizer } from "./PageOrganizer";
import { PublishPanel } from "./PublishPanel";

export type WizardStep = "upload" | "arrange" | "publish";

export interface CreatorWizardProps {
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  pageSize?: PageDimensions;
  originalPageSize?: PageDimensions | null;
  onChangePageSize?: (size: PageDimensions) => void;
  pages: readonly ImportedPage[];
  manifest?: Manifest;
  activePreset?: BookPresetId;
  direction?: BookDirection;
  toc?: readonly TocItem[];
  coverDesign?: CoverDesign;
  coverArtSrc?: string;
  onChangeCoverDesign?: (design: CoverDesign) => void;
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

const STEPS: {
  id: WizardStep;
  label: string;
  subtitle: string;
  icon: ReactNode;
}[] = [
  {
    id: "upload",
    label: "1. Upload",
    subtitle: "Import & Page Order",
    icon: <UploadDocumentIcon size={18} />,
  },
  {
    id: "arrange",
    label: "2. Arrange & Style",
    subtitle: "Presets & Cover Binding",
    icon: <SlidersStyleIcon size={18} />,
  },
  {
    id: "publish",
    label: "3. Preview & Publish",
    subtitle: "Offline HTML & Embed",
    icon: <DownloadExportIcon size={18} />,
  },
];

export function CreatorWizard({
  step,
  onStepChange,
  title,
  hasCover,
  theme,
  pageSize,
  originalPageSize,
  onChangePageSize,
  pages,
  manifest,
  activePreset,
  direction = "ltr",
  toc = [],
  coverDesign,
  coverArtSrc,
  onChangeCoverDesign,
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
        width: "100%",
        boxSizing: "border-box",
        display: "grid",
        gap: 16,
      }}
    >
      {/* Studio Step Switcher Tabs */}
      <div
        role="tablist"
        aria-label="Flipbook creation steps"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          padding: 4,
          borderRadius: 10,
          background: "#f4eee6",
          border: "1px solid #e6dfd5",
        }}
      >
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
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 7,
                border: active ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid transparent",
                background: active ? "#ffffff" : "transparent",
                color: active ? "#24201d" : "#6b635b",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: active ? "0 1px 4px rgba(36, 32, 29, 0.08)" : "none",
                minHeight: 44,
                transition: "all 150ms ease",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: active ? "#c25e3e" : "#eadecc",
                  color: active ? "#ffffff" : "#6b635b",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  transition: "background 150ms ease, color 150ms ease",
                }}
              >
                {s.icon}
              </span>
              <span style={{ display: "grid", gap: 1, minWidth: 0, overflow: "hidden" }}>
                <strong
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: active ? "#24201d" : "#6b635b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.label}
                </strong>
                <span
                  style={{
                    fontSize: 10,
                    color: active ? "#6b635b" : "#8a8278",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Studio Step Action Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 16px",
          borderRadius: 8,
          background: "#fdfbf7",
          border: "1px solid #e6dfd5",
          fontSize: 13,
          color: "#24201d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#c25e3e",
            }}
          >
            {step === "upload" && "Step 1 of 3"}
            {step === "arrange" && "Step 2 of 3"}
            {step === "publish" && "Step 3 of 3"}
          </span>
          <span style={{ color: "#6b635b" }}>•</span>
          <span style={{ fontWeight: 600, color: "#24201d" }}>
            {step === "upload" && "100% Client-Side: Document Source & Page Order"}
            {step === "arrange" && "Book Binding & Style: Format Presets & Covers"}
            {step === "publish" && "Ready to Share: Export Standalone HTML & Embed"}
          </span>
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
                minHeight: 40,
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "#c25e3e",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "background 150ms ease",
              }}
            >
              <span>Next: Arrange & Style</span>
              <ArrowRightIcon size={14} />
            </button>
          )}
          {step === "arrange" && (
            <>
              <button
                type="button"
                onClick={() => onStepChange("upload")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 40,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e6dfd5",
                  background: "#ffffff",
                  color: "#24201d",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <ArrowLeftIcon size={14} />
                <span>Back: Upload</span>
              </button>
              <button
                type="button"
                onClick={() => onStepChange("publish")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 40,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#c25e3e",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <span>Next: Preview & Publish</span>
                <ArrowRightIcon size={14} />
              </button>
            </>
          )}
          {step === "publish" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #e6dfd5",
                background: "#ffffff",
                color: "#24201d",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <ArrowLeftIcon size={14} />
              <span>Back: Arrange & Style</span>
            </button>
          )}
        </div>
      </div>

      {step === "upload" && (
        <PageOrganizer
          pages={pages}
          hasCover={hasCover}
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
            {...(pageSize ? { pageSize } : {})}
            {...(originalPageSize !== undefined ? { originalPageSize } : {})}
            {...(onChangePageSize ? { onChangePageSize } : {})}
            activePreset={activePreset}
            direction={direction}
            toc={toc}
            {...(coverDesign ? { coverDesign } : {})}
            {...(coverArtSrc ? { coverArtSrc } : {})}
            {...(onChangeCoverDesign ? { onChangeCoverDesign } : {})}
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
            hasCover={hasCover}
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
