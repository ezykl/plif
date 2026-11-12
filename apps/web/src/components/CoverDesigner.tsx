import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  COVER_COLOR_SWATCHES,
  COVER_FONTS,
  COVER_FOILS,
  COVER_MATERIALS,
  COVER_RELIEFS,
  FOIL_STYLES,
  resolveCoverTitle,
  type CoverArtMode,
  type CoverDesign,
  type CoverFont,
  type CoverMaterial,
  type CoverRelief,
} from "@plif/core";
import { drawCover, loadImage } from "../cover/renderCover";

export interface CoverDesignerProps {
  design: CoverDesign;
  /** Used for the lettering when the cover title field is left empty and no artwork is stamped. */
  fallbackTitle: string;
  /** The imported page 1 image. When present the designer can stamp or wrap it. */
  coverArtSrc?: string;
  onChange: (next: CoverDesign) => void;
}

const MATERIAL_LABELS: Record<CoverMaterial, string> = {
  cloth: "Book cloth",
  leather: "Leather",
  linen: "Linen",
  smooth: "Smooth",
};

const RELIEF_LABELS: Record<CoverRelief, { label: string; hint: string }> = {
  deboss: {
    label: "Debossed (Pressed in)",
    hint: "Sunken into the cover board with recessed inner shadow",
  },
  emboss: {
    label: "Embossed (Raised)",
    hint: "Raised above the cover board with cast drop shadow",
  },
};

const FONT_LABELS: Record<CoverFont, string> = {
  cinzel: "Cinzel (classic capitals)",
  playfair: "Playfair Display",
  cormorant: "Cormorant Garamond",
};

const ART_LABELS: Record<CoverArtMode, { label: string; hint: string }> = {
  silhouette: {
    label: "Stamp my cover as silhouette",
    hint: "Detects the shape and stamps it as a one-color foil or blind impression",
  },
  full: {
    label: "Wrap my cover artwork",
    hint: "Wraps the full-color image onto the textured cover board",
  },
  none: { label: "Lettering only", hint: "Stamp just the title and border" },
};

const PREVIEW_SIZE = { width: 240, height: 340 };

export function CoverDesigner({
  design,
  fallbackTitle,
  coverArtSrc,
  onChange,
}: CoverDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [art, setArt] = useState<HTMLImageElement | null>(null);
  const resolvedTitle = resolveCoverTitle(design, fallbackTitle);
  const hasGraphic = Boolean(design.logoSrc || coverArtSrc);
  const patch = (partial: Partial<CoverDesign>) => onChange({ ...design, ...partial });

  useEffect(() => {
    let alive = true;
    if (!design.logoSrc) {
      setLogo(null);
      return;
    }
    void loadImage(design.logoSrc).then((img) => alive && setLogo(img));
    return () => {
      alive = false;
    };
  }, [design.logoSrc]);

  useEffect(() => {
    let alive = true;
    if (!coverArtSrc) {
      setArt(null);
      return;
    }
    void loadImage(coverArtSrc).then((img) => alive && setArt(img));
    return () => {
      alive = false;
    };
  }, [coverArtSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const paint = () => {
      if (cancelled) return;
      try {
        drawCover(
          canvas,
          { ...design, title: resolvedTitle },
          { ...PREVIEW_SIZE, scale: 1.5 },
          { logo, art },
        );
      } catch {
        // canvas unsupported in this environment
      }
    };
    paint();
    // repaint once the stamped web fonts finish loading
    void document.fonts?.ready.then(paint);
    return () => {
      cancelled = true;
    };
  }, [design, resolvedTitle, logo, art]);

  const onLogoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patch({ logoSrc: reader.result, artMode: "silhouette" });
      }
    };
    reader.readAsDataURL(file);
  };

  const tile = (active: boolean) =>
    ({
      padding: "8px 12px",
      minHeight: 44,
      borderRadius: 8,
      border: active ? "2px solid #c25e3e" : "1px solid #e6dfd5",
      background: active ? "#fcf7f4" : "#ffffff",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      color: "#24201d",
    }) as const;

  const sectionCard = {
    display: "grid",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ece5dc",
    background: "#faf7f2",
  } as const;

  const sectionHeading = {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#7a5c49",
  } as const;

  const fieldLabel = { fontSize: 13, fontWeight: 700, color: "#24201d" } as const;
  const input = {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #d6ccc2",
    fontSize: 14,
    background: "#ffffff",
    color: "#24201d",
  } as const;

  return (
    <div
      role="group"
      aria-label="Hardbound cover designer"
      style={{ display: "grid", gap: 14, paddingTop: 16, borderTop: "1px solid #e6dfd5" }}
    >
      <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          aria-label="Use designed hardbound cover"
          checked={design.enabled}
          onChange={(e) =>
            patch({
              enabled: e.target.checked,
              ...(e.target.checked && hasGraphic && design.artMode === "none"
                ? { artMode: "silhouette" as const }
                : {}),
            })
          }
          style={{ width: 18, height: 18, accentColor: "#c25e3e" }}
        />
        <span style={{ display: "grid", gap: 2 }}>
          <span style={fieldLabel}>Hardbound cover studio</span>
          <span style={{ fontSize: 12, color: "#6b635b", fontWeight: 400 }}>
            {hasGraphic
              ? "Detected cover artwork: stamp it as a debossed foil silhouette or wrap it on the board"
              : "Design a textured bookcloth or leather cover with debossed foil lettering or a custom silhouette"}
          </span>
        </span>
      </label>

      {design.enabled && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
          <div style={{ display: "grid", gap: 8, justifyItems: "center", flexShrink: 0 }}>
            <canvas
              ref={canvasRef}
              aria-label="Hardbound cover preview"
              role="img"
              style={{
                width: PREVIEW_SIZE.width,
                height: PREVIEW_SIZE.height,
                borderRadius: "3px 8px 8px 3px",
                boxShadow: "-6px 10px 22px rgba(36, 32, 29, 0.35)",
              }}
            />
            <span style={{ fontSize: 11, color: "#6b635b", fontWeight: 600 }}>
              Front Cover (Page 1) : Live Preview
            </span>
          </div>

          <div style={{ display: "grid", gap: 12, flex: "1 1 320px" }}>
            {/* Step 1: Cover Graphic / Silhouette */}
            <div style={sectionCard}>
              <span style={sectionHeading}>1. Cover Silhouette / Artwork</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <label
                  style={{
                    ...tile(Boolean(design.logoSrc)),
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>
                    {design.logoSrc
                      ? "Replace silhouette / logo image"
                      : "Upload silhouette or logo image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    aria-label="Cover logo"
                    onChange={onLogoFile}
                    style={{ fontSize: 12, maxWidth: 190 }}
                  />
                </label>
                {design.logoSrc && (
                  <button
                    type="button"
                    aria-label="Remove cover logo"
                    onClick={() => {
                      const { logoSrc: _omit, ...rest } = design;
                      void _omit;
                      onChange({
                        ...rest,
                        artMode: coverArtSrc ? rest.artMode : "none",
                      });
                    }}
                    style={tile(false)}
                  >
                    Remove logo
                  </button>
                )}
              </div>

              {hasGraphic && (
                <div style={{ display: "grid", gap: 8 }}>
                  <span style={fieldLabel}>Your cover artwork</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(["silhouette", "full", "none"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        aria-label={`Artwork: ${ART_LABELS[mode].label}`}
                        aria-pressed={design.artMode === mode}
                        title={ART_LABELS[mode].hint}
                        onClick={() => patch({ artMode: mode })}
                        style={tile(design.artMode === mode)}
                      >
                        {ART_LABELS[mode].label}
                      </button>
                    ))}
                  </div>
                  {design.artMode === "silhouette" && (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}
                    >
                      <label
                        style={{
                          display: "inline-flex",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 13,
                        }}
                      >
                        <span>Contrast threshold</span>
                        <input
                          type="range"
                          aria-label="Silhouette detail"
                          min={5}
                          max={95}
                          value={design.artThreshold}
                          onChange={(e) => patch({ artThreshold: Number(e.target.value) })}
                          style={{ width: 140, accentColor: "#c25e3e" }}
                        />
                      </label>
                      <label
                        style={{
                          display: "inline-flex",
                          gap: 8,
                          alignItems: "center",
                          fontSize: 13,
                        }}
                      >
                        <input
                          type="checkbox"
                          aria-label="Invert silhouette"
                          checked={design.artInvert}
                          onChange={(e) => patch({ artInvert: e.target.checked })}
                          style={{ width: 16, height: 16, accentColor: "#c25e3e" }}
                        />
                        Invert silhouette
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Stamp Depth (Deboss vs Emboss) & Foil Finish */}
            <div style={sectionCard}>
              <span style={sectionHeading}>2. Stamp Depth & Foil Finish</span>
              <div style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Stamp depth</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {COVER_RELIEFS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-label={`Depth: ${RELIEF_LABELS[r].label}`}
                      aria-pressed={design.relief === r}
                      title={RELIEF_LABELS[r].hint}
                      onClick={() => patch({ relief: r })}
                      style={tile(design.relief === r)}
                    >
                      {RELIEF_LABELS[r].label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Lettering finish</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {COVER_FOILS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-label={`Finish: ${FOIL_STYLES[f].label}`}
                      aria-pressed={design.foil === f}
                      onClick={() => patch({ foil: f })}
                      style={tile(design.foil === f)}
                    >
                      {FOIL_STYLES[f].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Cover Board Color & Material */}
            <div style={sectionCard}>
              <span style={sectionHeading}>3. Cover Color & Material</span>
              <div style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Cover color</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {COVER_COLOR_SWATCHES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Cover color: ${s.label}`}
                      aria-pressed={design.color.toLowerCase() === s.color}
                      onClick={() => patch({ color: s.color })}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: s.color,
                        cursor: "pointer",
                        border:
                          design.color.toLowerCase() === s.color
                            ? "3px solid #c25e3e"
                            : "2px solid #e6dfd5",
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    aria-label="Custom cover color"
                    value={design.color}
                    onChange={(e) => patch({ color: e.target.value })}
                    style={{
                      width: 44,
                      height: 44,
                      padding: 0,
                      border: "none",
                      background: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Material</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {COVER_MATERIALS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-label={`Material: ${MATERIAL_LABELS[m]}`}
                      aria-pressed={design.material === m}
                      onClick={() => patch({ material: m })}
                      style={tile(design.material === m)}
                    >
                      {MATERIAL_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Cover Lettering & Borders */}
            <div style={sectionCard}>
              <span style={sectionHeading}>4. Cover Lettering & Borders</span>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Cover title</span>
                <input
                  type="text"
                  aria-label="Cover title"
                  value={design.title}
                  placeholder={
                    design.artMode === "none" ? fallbackTitle || "Uses the book title" : "Optional"
                  }
                  onChange={(e) => patch({ title: e.target.value })}
                  style={input}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Subtitle (optional)</span>
                <input
                  type="text"
                  aria-label="Cover subtitle"
                  value={design.subtitle ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const { subtitle: _omit, ...rest } = design;
                    void _omit;
                    onChange(value ? { ...rest, subtitle: value } : rest);
                  }}
                  style={input}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={fieldLabel}>Typeface</span>
                <select
                  aria-label="Cover typeface"
                  value={design.font}
                  onChange={(e) => patch({ font: e.target.value as CoverFont })}
                  style={input}
                >
                  {COVER_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {FONT_LABELS[f]}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <label
                  style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13 }}
                >
                  <input
                    type="checkbox"
                    aria-label="Stamped border frame"
                    checked={design.frame}
                    onChange={(e) => patch({ frame: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#c25e3e" }}
                  />
                  Stamped border
                </label>
                <label
                  style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13 }}
                >
                  <input
                    type="checkbox"
                    aria-label="Matching back cover"
                    checked={design.backCover}
                    onChange={(e) => patch({ backCover: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#c25e3e" }}
                  />
                  Matching back cover
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
