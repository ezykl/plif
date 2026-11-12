import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { inlineManifestPages } from "./import/inline";
import {
  applyBookPreset,
  applyBulkDensity,
  BOOK_PRESETS,
  buildManifest,
  DEFAULT_COVER_DESIGN,
  formatPageHash,
  generateStandaloneHtml,
  MIN_ZOOM,
  parsePageHash,
  resolveCoverTitle,
  stepZoom,
  THEMES,
  ZOOM_STEP,
  type BookDirection,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type CoverDesign,
  type ImportedPage,
  type PageDimensions,
  type TocItem,
} from "@plif/core";
import { Flipbook, ReaderToolbar, type FlipbookHandle } from "@plif/reader";
import { CreatorWizard, type WizardStep } from "./components/CreatorWizard";
import { LandingPage } from "./components/LandingPage";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  DownloadExportIcon,
  HardcoverBookIcon,
  NewspaperSpreadIcon,
  UploadDocumentIcon,
  WifiOfflineIcon,
  ZineBookletIcon,
} from "./components/Icons";
import { importFiles } from "./import";
import { COVER_FONT_STACKS, loadImage, renderCoverDataUrl } from "./cover/renderCover";
import { getSamplePublication, sampleManifest } from "./sample";

export type ViewMode = "landing" | "studio";

const QUICK_PRESET_LIST = Object.values(BOOK_PRESETS);
const QUICK_THEME_LIST = Object.values(THEMES);

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined" && window.location.hash.toLowerCase().includes("studio")) {
      return "studio";
    }
    return "landing";
  });
  const [step, setStep] = useState<WizardStep>("upload");
  const [title, setTitle] = useState(sampleManifest.title);
  const [hasCover, setHasCover] = useState(sampleManifest.hasCover);
  const [theme, setTheme] = useState<BookTheme>(sampleManifest.theme);
  const [activePreset, setActivePreset] = useState<BookPresetId | undefined>("magazine");
  const [direction, setDirection] = useState<BookDirection>(sampleManifest.direction);
  const [toc, setToc] = useState<TocItem[]>(sampleManifest.toc);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [customPageSize, setCustomPageSize] = useState<PageDimensions | null>(null);
  const [originalUploadSize, setOriginalUploadSize] = useState<PageDimensions | null>(null);
  const [index, setIndex] = useState(() => {
    if (typeof window === "undefined") return 1;
    return parsePageHash(window.location.hash, 12) ?? 1;
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

  const samplePub = useMemo(() => getSamplePublication(activePreset ?? "magazine"), [activePreset]);
  const basePages = pages.length > 0 ? pages : samplePub.pages;
  const userPages = useMemo(() => pages.filter((p) => !p.id.startsWith("sample-")), [pages]);
  const [coverDesign, setCoverDesign] = useState<CoverDesign>(DEFAULT_COVER_DESIGN);
  const [coverImages, setCoverImages] = useState<{ front: string; back: string | null } | null>(
    null,
  );

  const activePageSize = useMemo<PageDimensions>(() => {
    if (customPageSize) return customPageSize;
    if (activePreset) return BOOK_PRESETS[activePreset].defaultPageSize;
    const first = basePages[0];
    return first ? { width: first.width, height: first.height } : sampleManifest.pageSize;
  }, [customPageSize, activePreset, basePages]);

  const coverTitle = resolveCoverTitle(coverDesign, title);
  const coverWidth = activePageSize.width;
  const coverHeight = activePageSize.height;
  const coverArtSrc = userPages[0]?.src;
  const wantsBack = coverDesign.backCover && hasCover && basePages.length > 1;

  useEffect(() => {
    if (!coverDesign.enabled) {
      setCoverImages(null);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const family = COVER_FONT_STACKS[coverDesign.font];
          await document.fonts?.load(`${family.weight} 32px ${family.family}`);
        } catch {
          // fall back to the system serif stack
        }
        const logo = coverDesign.logoSrc ? await loadImage(coverDesign.logoSrc) : null;
        const art =
          coverDesign.artMode !== "none" && coverArtSrc ? await loadImage(coverArtSrc) : null;
        if (cancelled) return;
        const size = { width: coverWidth, height: coverHeight, scale: 2 };
        const front = renderCoverDataUrl({ ...coverDesign, title: coverTitle }, size, {
          logo,
          art,
        });
        if (!front) {
          setCoverImages(null);
          return;
        }
        const back = wantsBack
          ? renderCoverDataUrl(coverDesign, { ...size, variant: "back" }, { logo, art })
          : null;
        setCoverImages({ front, back });
      })();
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [coverDesign, coverTitle, coverWidth, coverHeight, coverArtSrc, wantsBack]);

  const effectivePages = useMemo<ImportedPage[]>(() => {
    if (!coverDesign.enabled || !coverImages || basePages.length === 0) return basePages;
    const next = basePages.map((p, i) => {
      if (i === 0) {
        return { ...p, src: coverImages.front, alt: "Front cover", density: "hard" as const };
      }
      if (i === basePages.length - 1 && coverImages.back) {
        return { ...p, src: coverImages.back, alt: "Back cover", density: "hard" as const };
      }
      return p;
    });
    return next;
  }, [coverDesign.enabled, coverImages, basePages]);

  const activeManifest = useMemo(
    () => ({
      ...buildManifest({
        title,
        hasCover,
        theme,
        direction,
        toc,
        pages: effectivePages,
        pageSize: activePageSize,
      }),
      ...(coverDesign.enabled ? { coverDesign } : {}),
    }),
    [title, hasCover, theme, direction, toc, effectivePages, activePageSize, coverDesign],
  );

  const total = activeManifest.pages.length;
  const themeTokens = THEMES[theme];

  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    book.current?.goTo(indexRef.current);
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

  const handleChangeCoverDesign = useCallback(
    (next: CoverDesign) => {
      setCoverDesign(next);
      if (next.enabled) {
        handleGoToPage(0);
      }
    },
    [handleGoToPage],
  );

  const handleUploadFiles = async (files: File[]) => {
    setIsImporting(true);
    setErrorText(null);
    setProgressText("Importing files...");
    try {
      const imported = await importFiles(files, {
        onProgress: (cur, max) => setProgressText(`Rendering PDF page ${cur} / ${max}...`),
      });
      const isSingleImageFile =
        imported.length === 1 &&
        files.length === 1 &&
        Boolean(files[0]) &&
        !files[0]!.name.toLowerCase().endsWith(".pdf");

      if (imported.length > 0 && imported[0]) {
        const detected = { width: imported[0].width, height: imported[0].height };
        setOriginalUploadSize(detected);
        setCustomPageSize(detected);
      }

      if (isSingleImageFile && userPages.length === 0) {
        // User uploaded 1 single image while on the sample book -> detect as Cover Silhouette!
        const nextPreset = applyBookPreset("hardcover", samplePub.pages);
        setActivePreset("hardcover");
        setHasCover(nextPreset.hasCover);
        setTheme(nextPreset.theme);
        setPages(nextPreset.pages);
        setCoverDesign((prev) => ({
          ...prev,
          enabled: true,
          logoSrc: imported[0]!.src,
          artMode: "silhouette",
        }));
      } else {
        setPages((prev) => [...prev.filter((p) => !p.id.startsWith("sample-")), ...imported]);
        setCoverDesign((prev) =>
          prev.enabled && prev.artMode === "none" ? { ...prev, artMode: "silhouette" } : prev,
        );
      }
      handleGoToPage(0);
      setProgressText(null);
      setStep("arrange");
      setViewMode("studio");
      if (typeof window !== "undefined") {
        window.location.hash = "#/studio";
      }
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
    const prevPreset = activePreset ?? "magazine";
    const prevDefaultTitle = getSamplePublication(prevPreset).title;
    setActivePreset(presetId);
    setCustomPageSize(BOOK_PRESETS[presetId].defaultPageSize);

    if (userPages.length === 0) {
      const pub = getSamplePublication(presetId);
      if (title === prevDefaultTitle) {
        setTitle(pub.title);
      }
      setHasCover(pub.hasCover);
      setTheme(pub.theme);
      setDirection(pub.direction);
      setToc(pub.toc);
      setPages([]);
      setCoverDesign((prev) =>
        presetId === "hardcover"
          ? {
              ...prev,
              enabled: true,
              title: title === prevDefaultTitle ? pub.title : title,
              artMode: prev.logoSrc ? "silhouette" : "none",
            }
          : { ...prev, enabled: false },
      );
    } else {
      const base = userPages;
      const next = applyBookPreset(presetId, base);
      setHasCover(next.hasCover);
      setTheme(next.theme);
      setPages(next.pages);
      setCoverDesign((prev) =>
        presetId === "hardcover"
          ? {
              ...prev,
              enabled: true,
              artMode:
                (userPages.length > 0 || Boolean(prev.logoSrc)) && prev.artMode === "none"
                  ? "silhouette"
                  : prev.artMode,
            }
          : { ...prev, enabled: false },
      );
    }
    if (presetId === "hardcover") {
      setStep("arrange");
    }
    handleGoToPage(0);
  };

  const handleApplyBulkDensity = (mode: BulkDensityMode) => {
    const base = userPages.length > 0 ? userPages : samplePub.pages;
    setPages(applyBulkDensity(base, mode));
    handleGoToPage(0);
  };

  const handleResetToSample = () => {
    const pub = getSamplePublication("magazine");
    setTitle(pub.title);
    setHasCover(pub.hasCover);
    setTheme(pub.theme);
    setActivePreset("magazine");
    setCustomPageSize(null);
    setOriginalUploadSize(null);
    setDirection(pub.direction);
    setToc(pub.toc);
    setCoverDesign(DEFAULT_COVER_DESIGN);
    setPages([]);
    setZoom(1);
    handleGoToPage(1);
    setViewMode("landing");
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("studio")) {
        setViewMode("studio");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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

  if (viewMode === "landing") {
    return (
      <>
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
        <LandingPage
          manifest={activeManifest}
          theme={theme}
          themeTokens={themeTokens}
          activePreset={activePreset ?? "magazine"}
          index={index}
          zoom={zoom}
          soundEnabled={soundEnabled}
          isOnline={isOnline}
          isImporting={isImporting}
          bookRef={book}
          stageRef={stageRef}
          onSelectPreset={handleSelectPreset}
          onChangeTheme={setTheme}
          onToggleSound={handleToggleSound}
          onOpenStudio={() => {
            setViewMode("studio");
            if (typeof window !== "undefined") {
              window.location.hash = "#/studio";
            }
          }}
          onUploadClick={() => quickFileInputRef.current?.click()}
          onDownloadHtml={() => void handleDownloadHtml()}
          onPageChange={updatePageIndex}
          onGoToPage={handleGoToPage}
          onChangeZoom={setZoom}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </>
    );
  }

  return (
    <div className="studio-layout">
      <style>{`
        .studio-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fcfbf7;
          color: #24201d;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }
        .studio-header {
          flex: 0 0 auto;
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(20, 20, 19, 0.08);
          padding: 8px 20px;
        }
        .studio-workspace-grid {
          flex: 1 1 auto;
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(420px, 500px);
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }
        .studio-stage-section {
          min-width: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px 20px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }
        .studio-inspector-section {
          min-width: 0;
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 20px 24px 60px;
          background: #fdfbf7;
          border-left: 1px solid #e6dfd5;
        }
        @media (max-width: 1023px) {
          .studio-layout {
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
          }
          .studio-workspace-grid {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            overflow: visible !important;
          }
          .studio-stage-section {
            height: auto !important;
            overflow: visible !important;
            padding: 16px 12px !important;
          }
          .studio-inspector-section {
            height: auto !important;
            overflow: visible !important;
            border-left: none !important;
            border-top: 1px solid #e6dfd5 !important;
            padding: 16px 16px 60px !important;
          }
        }
      `}</style>

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

      {/* Studio Header Bar */}
      <header className="studio-header">
        <div
          style={{
            maxWidth: 1680,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Left: Back to Showcase + Book Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                setViewMode("landing");
                if (typeof window !== "undefined") {
                  window.location.hash = "";
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #e6dfd5",
                background: "#ffffff",
                color: "#24201d",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
              aria-label="Back to Showcase"
            >
              <ArrowLeftIcon size={14} />
              <span>Back to Showcase</span>
            </button>

            <span role="separator" style={{ width: 1, height: 20, background: "#e6dfd5" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                role="img"
                aria-label="Book logo"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#24201d",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpenIcon size={16} />
              </span>
              <div>
                <strong
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    display: "block",
                    lineHeight: 1.25,
                    color: "#24201d",
                  }}
                >
                  {title || "Untitled Flipbook"}
                </strong>
                <span style={{ fontSize: 11, color: "#6b635b", fontWeight: 500 }}>
                  Plif Flipbook Studio • {themeTokens.label} Edition • {activePageSize.width} ×{" "}
                  {activePageSize.height}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Quick Presets Switcher */}
          <div
            aria-label="Quick style switcher"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 3,
              padding: 3,
              borderRadius: 8,
              background: "#f4eee6",
              border: "1px solid #e6dfd5",
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
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: active ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid transparent",
                    background: active ? "#ffffff" : "transparent",
                    color: active ? "#24201d" : "#6b635b",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 4px rgba(36, 32, 29, 0.08)" : "none",
                    transition: "all 150ms ease",
                  }}
                >
                  {preset.id === "newspaper" ? (
                    <NewspaperSpreadIcon size={14} />
                  ) : preset.id === "magazine" ? (
                    <BookOpenIcon size={14} />
                  ) : preset.id === "hardcover" ? (
                    <HardcoverBookIcon size={14} />
                  ) : (
                    <ZineBookletIcon size={14} />
                  )}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {!isOnline && (
              <span
                role="status"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 6,
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  color: "#92400e",
                }}
              >
                <WifiOfflineIcon size={13} />
                <span>Offline</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => quickFileInputRef.current?.click()}
              disabled={isImporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 36,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid #e6dfd5",
                background: "#ffffff",
                color: "#24201d",
                fontSize: 12,
                fontWeight: 600,
                cursor: isImporting ? "wait" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              <UploadDocumentIcon size={14} />
              <span>{isImporting ? "Importing..." : "Upload Files"}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleDownloadHtml()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 36,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: "#c25e3e",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(194, 94, 62, 0.24)",
                transition: "background 150ms ease",
              }}
            >
              <DownloadExportIcon size={14} />
              <span>Export HTML</span>
            </button>
          </div>
        </div>
      </header>

      {/* Side-by-side Split View: Left (Interactive Book Stage) / Right (Scrollable Creator Wizard) */}
      <main className="studio-workspace-grid">
        {/* Left Column: Interactive Live Stage */}
        <section aria-label="Live book preview stage" className="studio-stage-section">
          {/* Stage Top Bar: Canvas status & Paper Backdrop Swatches */}
          <div
            style={{
              width: "100%",
              maxWidth: 860,
              boxSizing: "border-box",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "7px 14px",
              borderRadius: 8,
              background: "#ffffff",
              border: "1px solid #e6dfd5",
              boxShadow: "0 1px 4px rgba(36, 32, 29, 0.04)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: "#24201d",
                  color: "#ffffff",
                }}
              >
                Canvas
              </span>
              <h2
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                  color: "#24201d",
                }}
              >
                {activeManifest.title}
              </h2>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6b635b", marginRight: 2 }}>
                Paper Backdrop:
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
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: active ? "1.5px solid #c25e3e" : "1px solid rgba(20, 20, 19, 0.12)",
                      background: active ? "#ffffff" : "transparent",
                      color: active ? "#24201d" : "#6b635b",
                      fontSize: 11,
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 9,
                        height: 9,
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
              flex: "1 1 auto",
              minHeight: 0,
              width: "100%",
              maxWidth: 860,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: themeTokens.stageBg,
              padding: isFullscreen ? 24 : "16px 14px",
              outline: isDraggingOverStage
                ? "2px dashed #c25e3e"
                : "1px solid rgba(20, 20, 19, 0.08)",
              outlineOffset: -2,
              borderRadius: 12,
              boxShadow: isFullscreen
                ? "none"
                : "inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(20, 20, 19, 0.06)",
              transition: "filter 0.2s ease, outline 0.15s ease",
              marginTop: 10,
              position: "relative",
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
                    position: "relative",
                    width: "100%",
                    flex: "1 1 auto",
                    minHeight: 0,
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
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        background: "rgba(36, 32, 29, 0.82)",
                        color: "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        transition: "transform 150ms ease, background 150ms ease",
                      }}
                    >
                      <ArrowLeftIcon size={18} />
                    </button>
                  )}

                  <div
                    style={{
                      width: "100%",
                      maxWidth: 760,
                      display: "flex",
                      justifyContent: "center",
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
                  </div>

                  {canNext && (
                    <button
                      type="button"
                      aria-label="Turn to next page"
                      title="Next page (Right Arrow)"
                      onClick={() => book.current?.next()}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        background: "rgba(36, 32, 29, 0.82)",
                        color: "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        transition: "transform 150ms ease, background 150ms ease",
                      }}
                    >
                      <ArrowRightIcon size={18} />
                    </button>
                  )}
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

        {/* Right Column: Scrollable Creator Wizard Controls */}
        <section aria-label="Flipbook creator wizard" className="studio-inspector-section">
          <CreatorWizard
            step={step}
            onStepChange={setStep}
            activePreset={activePreset}
            title={title}
            hasCover={hasCover}
            theme={theme}
            pageSize={activePageSize}
            originalPageSize={originalUploadSize}
            onChangePageSize={setCustomPageSize}
            direction={direction}
            toc={toc}
            coverDesign={coverDesign}
            {...(coverArtSrc ? { coverArtSrc } : {})}
            onChangeCoverDesign={handleChangeCoverDesign}
            pages={userPages}
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
