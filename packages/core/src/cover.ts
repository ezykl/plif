import { z } from "zod";

export const COVER_MATERIALS = ["cloth", "leather", "linen", "smooth"] as const;
export const COVER_FOILS = ["gold", "silver", "white", "blind"] as const;
export const COVER_FONTS = ["cinzel", "playfair", "cormorant"] as const;
/** none: lettering only. silhouette: page 1 artwork stamped as one color. full: artwork wrapped on the board. */
export const COVER_ART_MODES = ["none", "silhouette", "full"] as const;

export type CoverMaterial = (typeof COVER_MATERIALS)[number];
export type CoverFoil = (typeof COVER_FOILS)[number];
export type CoverFont = (typeof COVER_FONTS)[number];
export type CoverArtMode = (typeof COVER_ART_MODES)[number];

export const coverDesignSchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #rrggbb color"),
  material: z.enum(COVER_MATERIALS).default("cloth"),
  foil: z.enum(COVER_FOILS).default("gold"),
  title: z.string().default(""),
  subtitle: z.string().optional(),
  font: z.enum(COVER_FONTS).default("cinzel"),
  logoSrc: z.string().optional(),
  frame: z.boolean().default(true),
  artMode: z.enum(COVER_ART_MODES).default("none"),
  /** 5 to 95: higher keeps only the strongest contrast of the artwork. */
  artThreshold: z.number().min(5).max(95).default(45),
  artInvert: z.boolean().default(false),
  backCover: z.boolean().default(true),
});

export type CoverDesign = z.infer<typeof coverDesignSchema>;

export const DEFAULT_COVER_DESIGN: CoverDesign = {
  enabled: false,
  color: "#1f2a44",
  material: "cloth",
  foil: "gold",
  title: "",
  font: "cinzel",
  frame: true,
  artMode: "none",
  artThreshold: 45,
  artInvert: false,
  backCover: true,
};

/**
 * The lettering shown on the front cover. When artwork is used the book title is
 * not stamped automatically (the artwork usually already contains it); only an
 * explicitly typed cover title is.
 */
export function resolveCoverTitle(
  design: Pick<CoverDesign, "title" | "artMode">,
  bookTitle: string,
): string {
  if (design.title.trim()) return design.title;
  return design.artMode === "none" ? bookTitle : "";
}

/** Classic bookbinding cloth colors. */
export const COVER_COLOR_SWATCHES = [
  { id: "navy", label: "Navy", color: "#1f2a44" },
  { id: "burgundy", label: "Burgundy", color: "#5a1a26" },
  { id: "forest", label: "Forest", color: "#1f3d2e" },
  { id: "black", label: "Black", color: "#16161a" },
  { id: "tan", label: "Tan", color: "#8a6a47" },
  { id: "cream", label: "Cream", color: "#e8dfcc" },
] as const;

export interface FoilStyle {
  label: string;
  /** Gradient stops from 0 to 1 used to fill the stamped lettering. */
  stops: readonly (readonly [number, string])[];
  /** Whether lettering is filled with metallic foil (false means blind deboss). */
  filled: boolean;
}

export const FOIL_STYLES: Record<CoverFoil, FoilStyle> = {
  gold: {
    label: "Gold foil",
    filled: true,
    stops: [
      [0, "#a8741a"],
      [0.22, "#f4d27a"],
      [0.4, "#c79436"],
      [0.62, "#fbe7a1"],
      [0.82, "#a97a22"],
      [1, "#e9cd7c"],
    ],
  },
  silver: {
    label: "Silver foil",
    filled: true,
    stops: [
      [0, "#8d9299"],
      [0.25, "#f2f4f7"],
      [0.45, "#aeb4bc"],
      [0.65, "#ffffff"],
      [0.85, "#9aa0a8"],
      [1, "#dfe3e8"],
    ],
  },
  white: {
    label: "White ink",
    filled: true,
    stops: [
      [0, "#f1eee6"],
      [0.5, "#ffffff"],
      [1, "#e6e2d8"],
    ],
  },
  blind: {
    label: "Blind deboss",
    filled: false,
    stops: [
      [0, "#000000"],
      [1, "#000000"],
    ],
  },
};

/** Returns whether a hex color is light enough that dark deboss shading looks right. */
export function isLightColor(hex: string): boolean {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

/** Deterministic 32-bit string hash so identical designs render identical grain. */
export function coverSeed(design: Pick<CoverDesign, "color" | "material" | "title">): number {
  const input = `${design.color}|${design.material}|${design.title}`;
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small seeded PRNG (mulberry32). */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
