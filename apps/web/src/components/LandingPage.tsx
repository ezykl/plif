import type { RefObject } from "react";
import {
  BOOK_PRESETS,
  THEMES,
  type BookPresetId,
  type BookTheme,
  type Manifest,
  type ThemeTokens,
} from "@plif/core";
import { Flipbook, ReaderToolbar, type FlipbookHandle } from "@plif/reader";
import {
  BookOpenIcon,
  DownloadExportIcon,
  HardcoverBookIcon,
  NewspaperSpreadIcon,
  ShieldPrivacyIcon,
  UploadDocumentIcon,
  WifiOfflineIcon,
  ZineBookletIcon,
} from "./Icons";

export interface LandingPageProps {
  manifest: Manifest;
  theme: BookTheme;
  themeTokens: ThemeTokens;
  activePreset: BookPresetId;
  index: number;
  zoom: number;
  soundEnabled: boolean;
  isOnline: boolean;
  isImporting: boolean;
  bookRef: RefObject<FlipbookHandle>;
  stageRef: RefObject<HTMLDivElement>;
  onSelectPreset: (presetId: BookPresetId) => void;
  onChangeTheme: (theme: BookTheme) => void;
  onToggleSound: () => void;
  onOpenStudio: () => void;
  onUploadClick: () => void;
  onDownloadHtml: () => void;
  onPageChange: (index: number) => void;
  onGoToPage: (targetIndex: number) => void;
  onChangeZoom: (zoom: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const PRESET_LIST = Object.values(BOOK_PRESETS);
const THEME_LIST = Object.values(THEMES);

export function LandingPage({
  manifest,
  theme,
  themeTokens,
  activePreset,
  index,
  zoom,
  soundEnabled,
  isOnline,
  isImporting,
  bookRef,
  stageRef,
  onSelectPreset,
  onChangeTheme,
  onToggleSound,
  onOpenStudio,
  onUploadClick,
  onDownloadHtml,
  onPageChange,
  onGoToPage,
  onChangeZoom,
  onToggleFullscreen,
  isFullscreen,
}: LandingPageProps) {
  const sceneryBgUrl = `${import.meta.env.BASE_URL}hero-scenery.jpg`;
  const total = manifest.pages.length;

  const remainingAfterCover = manifest.hasCover ? total - 1 : total;
  const lastSpreadSize = remainingAfterCover > 0 && remainingAfterCover % 2 === 0 ? 2 : 1;
  const lastSpreadStartIndex = Math.max(0, total - lastSpreadSize);
  const canPrev = index > 0;
  const canNext = index < lastSpreadStartIndex;

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
      {/* Top Landing Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(255, 255, 255, 0.94)",
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
          {/* Brand Logo & Tagline */}
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
                <span style={{ fontSize: 11, color: "#57534e", fontWeight: 600 }}>
                  Tactile Flipbook Studio
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#78716c" }}>
                100% Client-Side • Zero Cloud Upload
              </span>
            </div>
          </div>

          {/* Quick Format Switcher for the Landing Live Sample */}
          <div
            aria-label="Format preset samples"
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
            {PRESET_LIST.map((preset) => {
              const active = preset.id === activePreset;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-label={preset.label}
                  aria-pressed={active}
                  onClick={() => onSelectPreset(preset.id)}
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

          {/* Navigation Action Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            {!isOnline && (
              <span
                role="status"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  color: "#92400e",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <WifiOfflineIcon size={14} />
                <span>Offline Mode</span>
              </span>
            )}

            <button
              type="button"
              onClick={onOpenStudio}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                padding: "8px 20px",
                borderRadius: 9999,
                border: "none",
                background: "#c25e3e",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(194, 94, 62, 0.28)",
                transition: "all 150ms ease",
              }}
            >
              <span>Open Studio</span>
            </button>

            <button
              type="button"
              onClick={onDownloadHtml}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                padding: "8px 16px",
                borderRadius: 9999,
                border: "1px solid rgba(20, 20, 19, 0.14)",
                background: "#ffffff",
                color: "#141413",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <DownloadExportIcon size={14} />
              <span>Export HTML</span>
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "grid", gap: 0 }}>
        {/* Scenic Landscape Hero with Live Interactive Flipbook Display */}
        <section
          aria-label="Interactive flipbook scenery hero"
          style={{
            width: "100%",
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 22%, rgba(255,255,255,0) 65%, #ffffff 100%), url("${sceneryBgUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
            padding: "36px 16px 54px",
            display: "grid",
            placeItems: "center",
            gap: 24,
          }}
        >
          {/* Headline, Subtitle, and Primary CTAs */}
          <div
            style={{
              maxWidth: 720,
              textAlign: "center",
              display: "grid",
              placeItems: "center",
              gap: 16,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                fontSize: "clamp(34px, 5vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                color: "#141413",
                textShadow: "0 1px 2px rgba(255, 255, 255, 0.6)",
              }}
            >
              Turn your PDFs into
              <br />
              living, tactile books
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 580,
                fontSize: 16,
                lineHeight: 1.55,
                color: "#292524",
                textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)",
              }}
            >
              Plif transforms static documents into interactive, dual-page flipbooks with realistic
              3D paper curl, hardbound debossed covers, and 1-click offline HTML export.
            </p>

            {/* Call-to-action buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginTop: 6,
              }}
            >
              <button
                type="button"
                onClick={onOpenStudio}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 28px",
                  borderRadius: 9999,
                  border: "none",
                  background: "#141413",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(20, 20, 19, 0.24)",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
              >
                <span>Open Flipbook Studio</span>
              </button>

              <button
                type="button"
                onClick={onUploadClick}
                disabled={isImporting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 26px",
                  borderRadius: 9999,
                  border: "1.5px solid #141413",
                  background: "rgba(255, 255, 255, 0.94)",
                  color: "#141413",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isImporting ? "wait" : "pointer",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(20, 20, 19, 0.08)",
                }}
              >
                <UploadDocumentIcon size={16} />
                <span>{isImporting ? "Importing files..." : "Upload PDF or Images"}</span>
              </button>
            </div>
          </div>

          {/* Active Sample Masthead & Theme Switcher */}
          <div
            style={{
              width: "min(960px, 94vw)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 9999,
              background: "rgba(255, 255, 255, 0.90)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(20, 20, 19, 0.1)",
              boxShadow: "0 8px 24px rgba(20, 20, 19, 0.08)",
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
                Sample Preview
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
                {manifest.title}
              </h2>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#57534e", marginRight: 2 }}>
                Paper &amp; Stage:
              </span>
              {THEME_LIST.map((t) => {
                const active = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTheme(t.id)}
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

          {/* Interactive Dual-Page Flipbook Stage on the Landing Page */}
          <div
            ref={stageRef}
            style={{
              display: "grid",
              placeItems: "center",
              gap: 18,
              width: "100%",
              background: isFullscreen ? themeTokens.stageBg : "transparent",
              padding: isFullscreen ? 24 : "4px 0",
              borderRadius: 16,
              filter: isFullscreen ? "none" : "drop-shadow(0 24px 48px rgba(20, 20, 19, 0.24))",
            }}
          >
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
                    onClick={() => bookRef.current?.prev()}
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
                  ref={bookRef}
                  manifest={manifest}
                  initialPage={index}
                  zoom={zoom}
                  soundEnabled={soundEnabled}
                  onPageChange={onPageChange}
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
                    onClick={() => bookRef.current?.next()}
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

            <ReaderToolbar
              manifest={manifest}
              currentIndex={index}
              zoom={zoom}
              isFullscreen={isFullscreen}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              onPrev={() => bookRef.current?.prev()}
              onNext={() => bookRef.current?.next()}
              onGoToPage={onGoToPage}
              onChangeZoom={onChangeZoom}
              onToggleFullscreen={onToggleFullscreen}
              accentColor={themeTokens.accentColor}
              textColor="#ffffff"
            />
          </div>
        </section>

        {/* Authentic Publication Format Showcase */}
        <section
          aria-label="Publication formats"
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "54px 20px 64px",
            width: "100%",
            display: "grid",
            gap: 36,
          }}
        >
          <div style={{ textAlign: "center", display: "grid", gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
                color: "#24201d",
              }}
            >
              Four publication formats, rendered with physical fidelity
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                color: "#6b635b",
                maxWidth: 620,
                justifySelf: "center",
                lineHeight: 1.5,
              }}
            >
              Select any format to instantly re-bind your publication with tailored paper physics,
              dimensions, and acoustic page turn resonance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            {PRESET_LIST.map((p) => {
              const active = p.id === activePreset;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPreset(p.id)}
                  style={{
                    padding: "24px 22px",
                    borderRadius: 12,
                    background: active ? "#ffffff" : "#fdfbf7",
                    border: active ? "1.5px solid #c25e3e" : "1px solid #e6dfd5",
                    display: "grid",
                    gap: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 8px 24px rgba(194, 94, 62, 0.12)"
                      : "0 2px 6px rgba(36, 32, 29, 0.04)",
                    transition: "all 150ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: active ? "#c25e3e" : "#f3efea",
                        color: active ? "#ffffff" : "#24201d",
                        display: "grid",
                        placeItems: "center",
                        transition: "background 150ms ease, color 150ms ease",
                      }}
                    >
                      {p.id === "newspaper" ? (
                        <NewspaperSpreadIcon size={20} />
                      ) : p.id === "magazine" ? (
                        <BookOpenIcon size={20} />
                      ) : p.id === "hardcover" ? (
                        <HardcoverBookIcon size={20} />
                      ) : (
                        <ZineBookletIcon size={20} />
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: active ? "#c25e3e" : "#8a8278",
                      }}
                    >
                      {p.defaultPageSize.width} × {p.defaultPageSize.height}
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 4 }}>
                    <strong style={{ fontSize: 16, color: "#24201d", fontWeight: 700 }}>
                      {p.label}
                    </strong>
                    <span style={{ fontSize: 12, color: "#6b635b", fontWeight: 500 }}>
                      {p.description}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#6b635b" }}>
                    {p.id === "magazine" &&
                      "Double-page glossy spreads, soft folio margins, and dynamic paper curl physics."}
                    {p.id === "newspaper" &&
                      "High-density multi-column newsprint reading with ink absorption tones and broadsheet spreads."}
                    {p.id === "hardcover" &&
                      "Rigid binder board with metallic debossed or embossed gold and silver foil titles."}
                    {p.id === "zine" &&
                      "Edge-to-edge square spreads with crisp card-stock page curl acoustics."}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Craftsman Statement & Client-Side Privacy */}
          <div
            style={{
              padding: "28px 32px",
              borderRadius: 12,
              background: "#fdfbf7",
              border: "1px solid #e6dfd5",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 20,
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#f3efea",
                color: "#3e6b5c",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ShieldPrivacyIcon size={26} />
            </span>
            <div style={{ flex: "1 1 300px", display: "grid", gap: 4 }}>
              <strong style={{ fontSize: 16, color: "#24201d", fontWeight: 700 }}>
                100% In-Memory Architecture
              </strong>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#6b635b" }}>
                All document parsing, image extraction, and canvas rasterization execute locally in
                your browser memory. When you export, Plif packages the complete reader and assets
                into a single self-contained HTML file. Double-click to open in any web browser
                without internet access.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenStudio}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minHeight: 44,
                padding: "10px 22px",
                borderRadius: 8,
                border: "none",
                background: "#c25e3e",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(194, 94, 62, 0.24)",
                transition: "background 150ms ease",
              }}
            >
              <span>Launch Studio</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e7e2da",
          padding: "24px 20px",
          background: "#faf9f6",
          fontSize: 13,
          color: "#78716c",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong>Plif Flipbook Studio</strong>
            <span>• Free and Open Source Under MIT License</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={onOpenStudio}
              style={{
                border: "none",
                background: "none",
                color: "#c25e3e",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Open Studio
            </button>
            <a
              href="https://github.com/ezykl/plif"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#78716c", textDecoration: "underline" }}
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
