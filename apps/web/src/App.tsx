import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { inlineManifestPages } from "./import/inline";
import {
  applyBookPreset,
  applyBulkDensity,
  BOOK_PRESETS,
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
import {
  BookOpenIcon,
  DownloadExportIcon,
  HardcoverBookIcon,
  NewspaperSpreadIcon,
  ShieldPrivacyIcon,
  UploadDocumentIcon,
  WifiOfflineIcon,
  ZineBookletIcon,
} from "./components/Icons";
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

const QUICK_PRESET_LIST = Object.values(BOOK_PRESETS);
const QUICK_THEME_LIST = Object.values(THEMES);

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<WizardStep>("upload");
  const [title, setTitle] = useState(sampleManifest.title);
  const [hasCover, setHasCover] = useState(sampleManifest.hasCover);
  const [theme, setTheme] = useState<BookTheme>(sampleManifest.theme);
  const [activePreset, setActivePreset] = useState<BookPresetId | undefined>("magazine");
  const [direction, setDirection] = useState<BookDirection>(sampleManifest.direction);
  const [toc, setToc] = useState<TocItem[]>(sampleManifest.toc);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [index, setIndex] = useState(() => {
    if (typeof window === "undefined") return 1;
    return parsePageHash(window.location.hash, SAMPLE_IMPORTED_PAGES.length) ?? 1;
  });
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDraggingOverStage, setIsDraggingOverStage] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("plif_sound_enabled") !== "false";
  });
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== "undefined") return navigator.onLine;
    return true;
  });

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("plif_sound_enabled", String(next));
        } catch {
          // ignore quota/storage restrictions
        }
      }
      return next;
    });
  }, []);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "m") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          Boolean(target.isContentEditable))
      ) {
        return;
      }
      e.preventDefault();
      handleToggleSound();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggleSound]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
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

  const handleStageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOverStage(false);
    if (isImporting) return;
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (list.length > 0) {
      void handleUploadFiles(list);
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
    updatePageIndex(1);
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

  const handleDownloadHtml = async () => {
    try {
      const portable = await inlineManifestPages(activeManifest);
      const html = generateStandaloneHtml(portable);
      downloadFile(`${sanitizeFilename(activeManifest.title)}.html`, html, "text/html");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Failed to export standalone HTML");
    }
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
          color: "#fdfbf7",
          borderBottom: `1px solid ${themeTokens.borderSubtle}`,
          padding: "12px 24px",
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
              <span
                role="img"
                aria-label="Book logo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: themeTokens.accentColor,
                }}
              >
                <BookOpenIcon size={20} />
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
                margin: "2px 0 0",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                letterSpacing: "-0.01em",
                color: "#fdfbf7",
              }}
            >
              {activeManifest.title}
            </h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            {!isOnline && (
              <span
                role="status"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: "rgba(194, 94, 62, 0.2)",
                  border: "1px solid #c25e3e",
                  color: "#fdfbf7",
                  backdropFilter: "blur(4px)",
                }}
              >
                <WifiOfflineIcon size={15} />
                <span>Offline Mode • Local Storage</span>
              </span>
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 9999,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fdfbf7",
                backdropFilter: "blur(4px)",
              }}
            >
              {hasCover ? "Cover + Spread Mode" : "Newspaper Spread Mode"} •{" "}
              {direction.toUpperCase()}
            </span>

            <input
              ref={quickFileInputRef}
              type="file"
              aria-label="Quick upload PDF or images"
              accept="application/pdf,image/*"
              multiple
              disabled={isImporting}
              onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                if (list.length > 0) {
                  void handleUploadFiles(list);
                  e.target.value = "";
                }
              }}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => quickFileInputRef.current?.click()}
              disabled={isImporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 38,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.22)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fdfbf7",
                fontSize: 13,
                fontWeight: 600,
                cursor: isImporting ? "wait" : "pointer",
              }}
            >
              <UploadDocumentIcon size={15} />
              <span>{isImporting ? "Importing..." : "Upload PDF / Images"}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadHtml()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 38,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: "#c25e3e",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(194, 94, 62, 0.3)",
              }}
            >
              <DownloadExportIcon size={15} />
              <span>Export HTML</span>
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          gap: 24,
          padding: "16px 0 40px",
        }}
      >
        {/* 1-Click Style & Format Bar (Above the Fold, right over the Stage) */}
        <div
          aria-label="Quick style switcher"
          style={{
            width: "min(960px, 92vw)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 16px",
            borderRadius: 12,
            background: "#fdfbf7",
            color: "#24201d",
            border: "1px solid #e6dfd5",
            boxShadow: "0 4px 14px rgba(36, 32, 29, 0.06)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#6b635b",
                marginRight: 4,
              }}
            >
              Format:
            </span>
            {QUICK_PRESET_LIST.map((preset) => {
              const active = preset.id === activePreset;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: active ? "2px solid #c25e3e" : "1px solid #e6dfd5",
                    background: active ? "#c25e3e" : "#ffffff",
                    color: active ? "#ffffff" : "#24201d",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {preset.id === "newspaper" ? (
                    <NewspaperSpreadIcon size={15} />
                  ) : preset.id === "magazine" ? (
                    <BookOpenIcon size={15} />
                  ) : preset.id === "hardcover" ? (
                    <HardcoverBookIcon size={15} />
                  ) : (
                    <ZineBookletIcon size={15} />
                  )}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#6b635b",
              }}
            >
              Backdrop:
            </span>
            {QUICK_THEME_LIST.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  title={`${t.label} backdrop`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 9999,
                    border: active ? "2px solid #c25e3e" : "1px solid #e6dfd5",
                    background: active ? "#f5efe6" : "#ffffff",
                    color: "#24201d",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: t.stageBg,
                      border: `2px solid ${t.accentColor}`,
                    }}
                  />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STAGE-FIRST: Interactive Dual-Page Flipbook Stage right at the top! */}
        <div
          ref={stageRef}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDraggingOverStage) setIsDraggingOverStage(true);
          }}
          onDragLeave={() => setIsDraggingOverStage(false)}
          onDrop={handleStageDrop}
          style={{
            display: "grid",
            placeItems: "center",
            gap: 16,
            width: "100%",
            background: isFullscreen ? themeTokens.stageBg : "transparent",
            padding: isFullscreen ? 24 : 0,
            outline: isDraggingOverStage ? "3px dashed #c25e3e" : "none",
            outlineOffset: -8,
            borderRadius: 12,
            filter: isFullscreen ? "none" : "drop-shadow(0 16px 40px rgba(36, 32, 29, 0.18))",
            transition: "filter 0.2s ease, outline 0.15s ease",
          }}
        >
          <Flipbook
            ref={book}
            manifest={activeManifest}
            initialPage={index}
            zoom={zoom}
            soundEnabled={soundEnabled}
            onPageChange={updatePageIndex}
          />

          <ReaderToolbar
            manifest={activeManifest}
            currentIndex={index}
            zoom={zoom}
            isFullscreen={isFullscreen}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onPrev={() => book.current?.prev()}
            onNext={() => book.current?.next()}
            onGoToPage={handleGoToPage}
            onChangeZoom={setZoom}
            onToggleFullscreen={handleToggleFullscreen}
            accentColor={themeTokens.accentColor}
            textColor={themeTokens.textColor}
          />
        </div>

        {/* Privacy & Differentiator Strip */}
        <div
          style={{
            width: "min(960px, 92vw)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(253, 251, 247, 0.92)",
            color: "#24201d",
            border: "1px solid #e6dfd5",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
            <span style={{ color: "#3e6b5c", display: "inline-flex" }}>
              <ShieldPrivacyIcon size={16} />
            </span>
            <span>Zero Cloud Upload • Mix PDFs &amp; Images Locally • No Signup or Watermarks</span>
          </div>
          <span style={{ color: "#6b635b" }}>
            Tip: Drag &amp; drop any PDF or images directly onto the book above, or customize below.
          </span>
        </div>

        {/* Creator Studio (Below the Interactive Stage) */}
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
            updatePageIndex(Math.min(index, Math.max(0, next.length - 1)));
          }}
          onChangeTitle={setTitle}
          onChangeHasCover={(next) => {
            setHasCover(next);
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
      </main>
    </div>
  );
}
