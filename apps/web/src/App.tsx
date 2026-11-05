import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyBookPreset,
  applyBulkDensity,
  buildManifest,
  formatPageHash,
  generateStandaloneHtml,
  parsePageHash,
  THEMES,
  type BookDirection,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type ImportedPage,
  type TocItem,
} from "@plif/core";
import { Flipbook, ReaderToolbar, type FlipbookHandle } from "@plif/reader";
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
  const stageRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<WizardStep>("upload");
  const [title, setTitle] = useState(sampleManifest.title);
  const [hasCover, setHasCover] = useState(sampleManifest.hasCover);
  const [theme, setTheme] = useState<BookTheme>(sampleManifest.theme);
  const [activePreset, setActivePreset] = useState<BookPresetId | undefined>("magazine");
  const [direction, setDirection] = useState<BookDirection>(sampleManifest.direction);
  const [toc, setToc] = useState<TocItem[]>(sampleManifest.toc);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [index, setIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    return parsePageHash(window.location.hash, SAMPLE_IMPORTED_PAGES.length) ?? 0;
  });
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        direction,
        toc,
        pages: effectivePages,
      }),
    [title, hasCover, theme, direction, toc, effectivePages],
  );

  const total = activeManifest.pages.length;
  const themeTokens = THEMES[theme];

  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (indexRef.current > 0) {
      book.current?.goTo(indexRef.current);
    }
  }, [activeManifest]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const parsed = parsePageHash(window.location.hash, total);
      if (parsed !== null) {
        setIndex(parsed);
        book.current?.goTo(parsed);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [total]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const updatePageIndex = (nextIndex: number) => {
    setIndex(nextIndex);
    if (typeof window !== "undefined") {
      window.location.hash = formatPageHash(nextIndex);
    }
  };

  const handleGoToPage = (targetIndex: number) => {
    book.current?.goTo(targetIndex);
    updatePageIndex(targetIndex);
  };

  const handleToggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      setIsFullscreen(false);
    } else if (stageRef.current?.requestFullscreen) {
      void stageRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    setIsImporting(true);
    setErrorText(null);
    setProgressText("Importing files...");
    try {
      const imported = await importFiles(files, {
        onProgress: (cur, max) => setProgressText(`Rendering PDF page ${cur} / ${max}...`),
      });
      setPages((prev) => [...prev, ...imported]);
      updatePageIndex(0);
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
    setActivePreset(presetId);
    const base = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;
    const next = applyBookPreset(presetId, base);
    setHasCover(next.hasCover);
    setTheme(next.theme);
    setPages(next.pages);
    updatePageIndex(0);
  };

  const handleApplyBulkDensity = (mode: BulkDensityMode) => {
    const base = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;
    setPages(applyBulkDensity(base, mode));
    updatePageIndex(0);
  };

  const handleResetToSample = () => {
    setTitle(sampleManifest.title);
    setHasCover(sampleManifest.hasCover);
    setTheme(sampleManifest.theme);
    setActivePreset("magazine");
    setDirection(sampleManifest.direction);
    setToc(sampleManifest.toc);
    setPages([]);
    setZoom(1);
    updatePageIndex(0);
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sanitizeFilename = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "flipbook";

  const handleDownloadHtml = () => {
    const html = generateStandaloneHtml(activeManifest);
    downloadFile(`${sanitizeFilename(activeManifest.title)}.html`, html, "text/html");
  };

  const handleDownloadManifest = () => {
    const json = JSON.stringify(activeManifest, null, 2);
    downloadFile(
      `${sanitizeFilename(activeManifest.title)}-manifest.json`,
      json,
      "application/json",
    );
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
          borderBottom: `1px solid ${themeTokens.borderSubtle}`,
          padding: "14px 24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
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
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }} role="img" aria-label="Book logo">
                📖
              </span>
              <span
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: themeTokens.accentColor,
                  fontWeight: 700,
                }}
              >
                Plif Flipbook Studio • {themeTokens.label} Edition
              </span>
            </div>
            <h1
              style={{
                margin: "4px 0 0",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                letterSpacing: "-0.01em",
              }}
            >
              {activeManifest.title}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 9999,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(4px)",
              }}
            >
              {hasCover ? "Cover + Spread Mode" : "Newspaper Spread Mode"} •{" "}
              {direction.toUpperCase()}
            </span>
          </div>
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
          activePreset={activePreset}
          title={title}
          hasCover={hasCover}
          theme={theme}
          direction={direction}
          toc={toc}
          pages={pages}
          manifest={activeManifest}
          isImporting={isImporting}
          progressText={progressText}
          errorText={errorText}
          onUploadFiles={handleUploadFiles}
          onChangePages={(next) => {
            setPages(next);
            updatePageIndex(0);
          }}
          onChangeTitle={setTitle}
          onChangeHasCover={(next) => {
            setHasCover(next);
            updatePageIndex(0);
          }}
          onChangeTheme={setTheme}
          onChangeDirection={setDirection}
          onChangeToc={setToc}
          onSelectPreset={handleSelectPreset}
          onApplyBulkDensity={handleApplyBulkDensity}
          onResetToSample={handleResetToSample}
          onDownloadHtml={handleDownloadHtml}
          onDownloadManifest={handleDownloadManifest}
        />

        <div
          ref={stageRef}
          style={{
            display: "grid",
            placeItems: "center",
            gap: 16,
            width: "100%",
            background: isFullscreen ? themeTokens.stageBg : "transparent",
            padding: isFullscreen ? 24 : 0,
            filter: isFullscreen ? "none" : "drop-shadow(0 16px 40px rgba(36, 32, 29, 0.18))",
            transition: "filter 0.2s ease",
          }}
        >
          <Flipbook
            ref={book}
            manifest={activeManifest}
            zoom={zoom}
            onPageChange={updatePageIndex}
          />

          <ReaderToolbar
            manifest={activeManifest}
            currentIndex={index}
            zoom={zoom}
            isFullscreen={isFullscreen}
            onPrev={() => book.current?.prev()}
            onNext={() => book.current?.next()}
            onGoToPage={handleGoToPage}
            onChangeZoom={setZoom}
            onToggleFullscreen={handleToggleFullscreen}
            accentColor={themeTokens.accentColor}
            textColor={themeTokens.textColor}
          />
        </div>
      </main>
    </div>
  );
}
