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
    <div
      style={{
        minHeight: "100vh",
        background: "#fcfbf7",
        color: "#141413",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
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
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(14px)",
          color: "#141413",
          borderBottom: "1px solid rgba(20, 20, 19, 0.08)",
          padding: "10px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1680,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
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
                borderRadius: 9999,
                border: "1px solid rgba(20, 20, 19, 0.12)",
                background: "#ffffff",
                color: "#141413",
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

            <span
              role="separator"
              style={{ width: 1, height: 20, background: "rgba(20, 20, 19, 0.12)" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                role="img"
                aria-label="Book logo"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#141413",
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
                  style={{ fontSize: 14, fontWeight: 700, display: "block", lineHeight: 1.2 }}
                >
                  {title || "Untitled Flipbook"}
                </strong>
                <span style={{ fontSize: 11, color: "#78716c", fontWeight: 500 }}>
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
              gap: 4,
              padding: 4,
              borderRadius: 9999,
              background: "#f5f4f0",
              border: "1px solid rgba(20, 20, 19, 0.08)",
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
                    padding: "6px 12px",
                    borderRadius: 9999,
                    border: "none",
                    background: active ? "#141413" : "transparent",
                    color: active ? "#ffffff" : "#44403c",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: active ? "0 2px 6px rgba(20, 20, 19, 0.14)" : "none",
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
                  borderRadius: 9999,
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
                borderRadius: 9999,
                border: "none",
                background: "#141413",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
                cursor: isImporting ? "wait" : "pointer",
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
                borderRadius: 9999,
                border: "1.5px solid #141413",
                background: "#ffffff",
                color: "#141413",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <DownloadExportIcon size={14} />
              <span>Export HTML</span>
            </button>
          </div>
        </div>
      </header>

      {/* Side-by-side Split View: Left (Sticky Book Stage) / Right (Scrollable Creator Wizard) */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 28,
          alignItems: "start",
          padding: "24px 28px 64px",
          maxWidth: 1680,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left Column: Sticky Interactive Flipbook Stage */}
        <section
          aria-label="Live book preview stage"
          style={{
            position: "sticky",
            top: 76,
            zIndex: 10,
            display: "grid",
            gap: 14,
          }}
        >
          {/* Active Book Masthead Pill + Backdrop Swatches */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 14,
              background: "#ffffff",
              border: "1px solid rgba(20, 20, 19, 0.08)",
              boxShadow: "0 2px 8px rgba(20, 20, 19, 0.04)",
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
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                  color: "#141413",
                }}
              >
                {activeManifest.title}
              </h2>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#57534e", marginRight: 2 }}>
                Paper:
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
                      padding: "4px 8px",
                      borderRadius: 9999,
                      border: active ? "1.5px solid #141413" : "1px solid rgba(20, 20, 19, 0.12)",
                      background: active ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                      color: "#141413",
                      fontSize: 11,
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 10,
                        height: 10,
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
              gap: 16,
              width: "100%",
              boxSizing: "border-box",
              background: themeTokens.stageBg,
              padding: isFullscreen ? 24 : "18px 10px",
              outline: isDraggingOverStage
                ? "3px dashed #141413"
                : "1px solid rgba(20, 20, 19, 0.08)",
              outlineOffset: -4,
              borderRadius: 18,
              boxShadow: isFullscreen ? "none" : "0 12px 32px rgba(20, 20, 19, 0.08)",
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
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      flex: "0 0 40px",
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
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: "1px solid rgba(255, 255, 255, 0.22)",
                          background: "rgba(20, 20, 19, 0.88)",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 6px 16px rgba(20, 20, 19, 0.2)",
                        }}
                      >
                        <svg
                          width={18}
                          height={18}
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

                  <div style={{ flex: "1 1 auto", maxWidth: 760, minWidth: 0 }}>
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
                      width: 40,
                      flex: "0 0 40px",
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
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: "1px solid rgba(255, 255, 255, 0.22)",
                          background: "rgba(20, 20, 19, 0.88)",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 6px 16px rgba(20, 20, 19, 0.2)",
                        }}
                      >
                        <svg
                          width={18}
                          height={18}
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

        {/* Right Column: Scrollable Creator Wizard Controls */}
        <section aria-label="Flipbook creator wizard" style={{ minWidth: 0 }}>
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
