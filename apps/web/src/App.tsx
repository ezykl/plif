import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { inlineManifestPages } from "./import/inline";
import {
  applyBookPreset,
  applyBulkDensity,
  BOOK_PRESETS,
  buildManifest,
  formatPageHash,
  generateStandaloneHtml,
  MIN_ZOOM,
  parsePageHash,
  stepZoom,
  THEMES,
  ZOOM_STEP,
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

  const updatePageIndex = useCallback((nextIndex: number) => {
    setIndex(nextIndex);
    if (typeof window !== "undefined") {
      window.location.hash = formatPageHash(nextIndex);
    }
  }, []);

  const handleGoToPage = useCallback(
    (targetIndex: number) => {
      book.current?.goTo(targetIndex);
      updatePageIndex(targetIndex);
    },
    [updatePageIndex],
  );

  const handleToggleFullscreen = useCallback(() => {
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
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          Boolean(target.isContentEditable))
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "m") {
        e.preventDefault();
        handleToggleSound();
      } else if (key === "f") {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => stepZoom(z, ZOOM_STEP));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom((z) => stepZoom(z, -ZOOM_STEP));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoom(MIN_ZOOM);
      } else if (e.key === "Home") {
        e.preventDefault();
        handleGoToPage(0);
      } else if (e.key === "End") {
        e.preventDefault();
        handleGoToPage(Math.max(0, total - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleToggleSound, handleToggleFullscreen, handleGoToPage, total]);

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

  const heroBgUrl = `${import.meta.env.BASE_URL}hero-valley.jpg`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#141413",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Option A + C: Crisp White Top Navigation Bar with Floating SVG Format Switcher */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(14px)",
          color: "#141413",
          borderBottom: "1px solid rgba(20, 20, 19, 0.08)",
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Left Brand & Edition Metadata */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              role="img"
              aria-label="Book logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#141413",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpenIcon size={20} />
            </span>
            <div style={{ display: "grid", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Plif
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    color: "#57534e",
                    fontWeight: 600,
                  }}
                >
                  Plif Flipbook Studio • {themeTokens.label} Edition
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#78716c",
                }}
              >
                {hasCover ? "Cover + Spread Mode" : "Newspaper Spread Mode"} •{" "}
                {direction.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Center: Option C Floating SVG Icon Format Pill Bar */}
          <div
            aria-label="Quick style switcher"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 4,
              padding: 5,
              borderRadius: 9999,
              background: "#f5f4f0",
              border: "1px solid rgba(20, 20, 19, 0.08)",
              boxShadow: "inset 0 1px 2px rgba(20, 20, 19, 0.04)",
            }}
          >
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
                    padding: "7px 14px",
                    borderRadius: 9999,
                    border: "none",
                    background: active ? "#141413" : "transparent",
                    color: active ? "#ffffff" : "#44403c",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: active ? "0 2px 8px rgba(20, 20, 19, 0.18)" : "none",
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

          {/* Right: Option A Pill Action Buttons */}
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
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  color: "#92400e",
                }}
              >
                <WifiOfflineIcon size={15} />
                <span>Offline Mode • Local Storage</span>
              </span>
            )}

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
                minHeight: 40,
                padding: "8px 18px",
                borderRadius: 9999,
                border: "none",
                background: "#141413",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: isImporting ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(20, 20, 19, 0.15)",
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
                minHeight: 40,
                padding: "8px 18px",
                borderRadius: 9999,
                border: "1.5px solid #141413",
                background: "#ffffff",
                color: "#141413",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <DownloadExportIcon size={15} />
              <span>Export HTML</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "grid", gap: 0 }}>
        {/* Option A Painted Canyon Valley Hero + Editorial Headline + Interactive Dual-Page Stage */}
        <section
          aria-label="Interactive flipbook hero"
          style={{
            width: "100%",
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 78%, #ffffff 100%), url("${heroBgUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            padding: "28px 16px 44px",
            display: "grid",
            placeItems: "center",
            gap: 22,
          }}
        >
          {/* Centered Editorial Hero Copy & Pill CTAs */}
          <div
            style={{
              maxWidth: 680,
              textAlign: "center",
              display: "grid",
              placeItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                borderRadius: 9999,
                background: "#e0f2fe",
                color: "#075985",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              <ShieldPrivacyIcon size={14} />
              <span>100% Local &amp; Private • Zero Cloud Upload</span>
            </div>

            <div
              style={{
                fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                color: "#141413",
              }}
            >
              Turn your PDFs into
              <br />
              living, tactile books
            </div>

            <p
              style={{
                margin: 0,
                maxWidth: 540,
                fontSize: 15,
                lineHeight: 1.55,
                color: "#44403c",
              }}
            >
              Plif Flipbook Studio transforms static PDFs and images into interactive, dual-page
              flipbooks with realistic paper curl and 1-click offline HTML export.
            </p>

            {/* Option A Black & White Pill CTA Pair */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginTop: 4,
              }}
            >
              <button
                type="button"
                onClick={() => quickFileInputRef.current?.click()}
                disabled={isImporting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 9999,
                  border: "none",
                  background: "#141413",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isImporting ? "wait" : "pointer",
                  boxShadow: "0 8px 20px rgba(20, 20, 19, 0.2)",
                }}
              >
                <span>{isImporting ? "Importing..." : "Upload PDF or Images →"}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDownloadHtml()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 9999,
                  border: "1.5px solid #141413",
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "#141413",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span>Export Offline HTML</span>
              </button>
            </div>
          </div>

          {/* Active Book Masthead Pill + Backdrop Swatches */}
          <div
            style={{
              width: "min(920px, 94vw)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 9999,
              background: "rgba(255, 255, 255, 0.86)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(20, 20, 19, 0.1)",
              boxShadow: "0 8px 24px rgba(20, 20, 19, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  background: "#141413",
                  color: "#ffffff",
                }}
              >
                Live Preview
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                  color: "#141413",
                }}
              >
                {activeManifest.title}
              </h1>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#57534e", marginRight: 2 }}>
                Paper &amp; Stage:
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
                      padding: "4px 10px",
                      borderRadius: 9999,
                      border: active ? "1.5px solid #141413" : "1px solid rgba(20, 20, 19, 0.12)",
                      background: active ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                      color: "#141413",
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 11,
                        height: 11,
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

          {/* Interactive Dual-Page Flipbook Stage */}
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
              gap: 18,
              width: "100%",
              background: isFullscreen ? themeTokens.stageBg : "transparent",
              padding: isFullscreen ? 24 : "4px 0",
              outline: isDraggingOverStage ? "3px dashed #141413" : "none",
              outlineOffset: -8,
              borderRadius: 16,
              filter: isFullscreen ? "none" : "drop-shadow(0 24px 48px rgba(20, 20, 19, 0.24))",
              transition: "filter 0.2s ease, outline 0.15s ease",
            }}
          >
            {(() => {
              const remainingAfterCover = activeManifest.hasCover ? total - 1 : total;
              const lastSpreadSize =
                remainingAfterCover > 0 && remainingAfterCover % 2 === 0 ? 2 : 1;
              const lastSpreadStartIndex = Math.max(0, total - lastSpreadSize);
              const canPrev = index > 0;
              const canNext = index < lastSpreadStartIndex;

              return (
                <div
                  style={{
                    width: "min(1180px, 98vw)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "clamp(16px, 3vw, 36px)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      flex: "0 0 48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {canPrev && (
                      <button
                        type="button"
                        aria-label="Turn to previous page"
                        title="Previous page (Left Arrow)"
                        onClick={() => book.current?.prev()}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          border: "1px solid rgba(255, 255, 255, 0.22)",
                          background: "rgba(20, 20, 19, 0.88)",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 8px 24px rgba(20, 20, 19, 0.28)",
                          transition: "transform 150ms ease, background 150ms ease",
                        }}
                      >
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 12H5" />
                          <path d="m12 19-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div style={{ flex: "1 1 auto", maxWidth: 960, minWidth: 0 }}>
                    <Flipbook
                      ref={book}
                      manifest={activeManifest}
                      initialPage={index}
                      zoom={zoom}
                      soundEnabled={soundEnabled}
                      onPageChange={updatePageIndex}
                    />
                  </div>

                  <div
                    style={{
                      width: 48,
                      flex: "0 0 48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {canNext && (
                      <button
                        type="button"
                        aria-label="Turn to next page"
                        title="Next page (Right Arrow)"
                        onClick={() => book.current?.next()}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          border: "1px solid rgba(255, 255, 255, 0.22)",
                          background: "rgba(20, 20, 19, 0.88)",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 8px 24px rgba(20, 20, 19, 0.28)",
                          transition: "transform 150ms ease, background 150ms ease",
                        }}
                      >
                        <svg
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

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
              textColor="#ffffff"
            />
          </div>
        </section>

        {/* Option C Pastel Bento Studio Workspace Below the Valley Hero */}
        <section
          aria-label="Flipbook studio workspace"
          style={{
            background: "#ffffff",
            padding: "12px 16px 56px",
            display: "grid",
            placeItems: "center",
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
        </section>
      </main>
    </div>
  );
}
