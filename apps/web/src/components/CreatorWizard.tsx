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
  type TocItem,
} from "@plif/core";
import { BookSettingsPanel } from "./BookSettingsPanel";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  DownloadExportIcon,
  ShieldPrivacyIcon,
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
  bg: string;
  activeBorder: string;
  iconBg: string;
  icon: ReactNode;
}[] = [
  {
    id: "upload",
    label: "1. Upload",
    subtitle: "Drop PDFs or images & reorder pages",
    bg: "#fdebd2",
    activeBorder: "#141413",
    iconBg: "rgba(255, 255, 255, 0.75)",
    icon: <UploadDocumentIcon size={18} />,
  },
  {
    id: "arrange",
    label: "2. Arrange & Style",
    subtitle: "Format presets, backdrops & chapters",
    bg: "#dce8dc",
    activeBorder: "#141413",
    iconBg: "rgba(255, 255, 255, 0.75)",
    icon: <SlidersStyleIcon size={18} />,
  },
  {
    id: "publish",
    label: "3. Preview & Publish",
    subtitle: "1-click offline HTML & embed code",
    bg: "#d8ecfa",
    activeBorder: "#141413",
    iconBg: "rgba(255, 255, 255, 0.75)",
    icon: <DownloadExportIcon size={18} />,
  },
];

export function CreatorWizard({
  step,
  onStepChange,
  title,
  hasCover,
  theme,
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
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 18,
      }}
    >
      {/* Option C Pastel Bento Step Switcher Cards */}
      <div
        role="tablist"
        aria-label="Flipbook creation steps"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
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
                gap: 14,
                padding: "16px 18px",
                borderRadius: 18,
                border: active ? `2px solid ${s.activeBorder}` : "2px solid transparent",
                background: s.bg,
                color: "#141413",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: active
                  ? "0 10px 24px rgba(20, 20, 19, 0.10)"
                  : "0 2px 8px rgba(20, 20, 19, 0.04)",
                transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: active ? "#141413" : s.iconBg,
                  color: active ? "#ffffff" : "#141413",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </span>
              <span style={{ display: "grid", gap: 2 }}>
                <strong style={{ fontSize: 15, fontWeight: 700, color: "#141413" }}>
                  {s.label}
                </strong>
                <span style={{ fontSize: 12, color: "#44403c", lineHeight: 1.35 }}>
                  {s.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Guidance & Quick Pill Navigation Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 18px",
          borderRadius: 9999,
          background: "#ffffff",
          border: "1px solid #e7e5e4",
          boxShadow: "0 2px 10px rgba(20, 20, 19, 0.04)",
          fontSize: 13,
          color: "#44403c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#e0f2fe",
              color: "#0369a1",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {step === "upload" ? (
              <ShieldPrivacyIcon size={15} />
            ) : step === "arrange" ? (
              <BookOpenIcon size={15} />
            ) : (
              <DownloadExportIcon size={15} />
            )}
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

        <div style={{ display: "flex", gap: 8 }}>
          {step === "upload" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 9999,
                border: "none",
                background: "#141413",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 150ms ease",
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
                  padding: "8px 16px",
                  borderRadius: 9999,
                  border: "1.5px solid #141413",
                  background: "#ffffff",
                  color: "#141413",
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
                  padding: "8px 18px",
                  borderRadius: 9999,
                  border: "none",
                  background: "#141413",
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
                padding: "8px 16px",
                borderRadius: 9999,
                border: "1.5px solid #141413",
                background: "#ffffff",
                color: "#141413",
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
