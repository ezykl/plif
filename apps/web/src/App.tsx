import { useMemo, useRef, useState } from "react";
import {
  applyBookPreset,
  applyBulkDensity,
  buildManifest,
  formatPageLabel,
  THEMES,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type ImportedPage,
} from "@plif/core";
import { Flipbook, type FlipbookHandle } from "@plif/reader";
import { CreatorWizard, type WizardStep } from "./components/CreatorWizard";
import { importFiles } from "./import";
import { sampleManifest } from "./sample";

const SAMPLE_IMPORTED_PAGES: ImportedPage[] = sampleManifest.pages.map((p, idx) => ({
  id: `sample-${idx + 1}`,
  src: p.src,
  width: sampleManifest.pageSize.width,
  height: sampleManifest.pageSize.height,
  alt: p.alt ?? `Page ${idx + 1}`,
  ...(p.density !== undefined ? { density: p.density } : {}),
}));

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const [step, setStep] = useState<WizardStep>("upload");
  const [title, setTitle] = useState(sampleManifest.title);
  const [hasCover, setHasCover] = useState(sampleManifest.hasCover);
  const [theme, setTheme] = useState<BookTheme>(sampleManifest.theme);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [index, setIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const effectivePages = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;

  const activeManifest = useMemo(
    () =>
      buildManifest({
        title,
        hasCover,
        theme,
        pages: effectivePages,
      }),
    [title, hasCover, theme, effectivePages],
  );

  const total = activeManifest.pages.length;
  const themeTokens = THEMES[theme];

  const handleUploadFiles = async (files: File[]) => {
    setIsImporting(true);
    setErrorText(null);
    setProgressText("Importing files...");
    try {
      const imported = await importFiles(files, {
        onProgress: (cur, max) => setProgressText(`Rendering PDF page ${cur} / ${max}...`),
      });
      setPages((prev) => [...prev, ...imported]);
      setIndex(0);
      setProgressText(null);
      setStep("arrange");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Failed to import files");
      setProgressText(null);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSelectPreset = (presetId: BookPresetId) => {
    const base = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;
    const next = applyBookPreset(presetId, base);
    setHasCover(next.hasCover);
    setTheme(next.theme);
    setPages(next.pages);
    setIndex(0);
  };

  const handleApplyBulkDensity = (mode: BulkDensityMode) => {
    const base = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;
    setPages(applyBulkDensity(base, mode));
    setIndex(0);
  };

  const handleResetToSample = () => {
    setTitle(sampleManifest.title);
    setHasCover(sampleManifest.hasCover);
    setTheme(sampleManifest.theme);
    setPages([]);
    setIndex(0);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: themeTokens.stageBg,
        color: themeTokens.textColor,
        display: "flex",
        flexDirection: "column",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <header
        style={{
          background: themeTokens.headerBg,
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: themeTokens.accentColor,
                fontWeight: 700,
              }}
            >
              Plif Flipbook Studio • {themeTokens.label}
            </span>
            <h1 style={{ margin: "2px 0 0", fontSize: 22 }}>{activeManifest.title}</h1>
          </div>
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            {hasCover ? "Cover + Spread Mode" : "Newspaper Spread Mode"}
          </span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          gap: 20,
          padding: "20px 0 32px",
        }}
      >
        <CreatorWizard
          step={step}
          onStepChange={setStep}
          title={title}
          hasCover={hasCover}
          theme={theme}
          pages={pages}
          isImporting={isImporting}
          progressText={progressText}
          errorText={errorText}
          onUploadFiles={handleUploadFiles}
          onChangePages={(next) => {
            setPages(next);
            setIndex(0);
          }}
          onChangeTitle={setTitle}
          onChangeHasCover={(next) => {
            setHasCover(next);
            setIndex(0);
          }}
          onChangeTheme={setTheme}
          onSelectPreset={handleSelectPreset}
          onApplyBulkDensity={handleApplyBulkDensity}
          onResetToSample={handleResetToSample}
        />

        <Flipbook ref={book} manifest={activeManifest} onPageChange={setIndex} />

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => book.current?.prev()}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${themeTokens.accentColor}`,
              background: "transparent",
              color: themeTokens.textColor,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Previous
          </button>
          <span style={{ fontWeight: 600 }}>
            {formatPageLabel(index, total, activeManifest.hasCover, false)}
          </span>
          <button
            type="button"
            onClick={() => book.current?.next()}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${themeTokens.accentColor}`,
              background: "transparent",
              color: themeTokens.textColor,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
