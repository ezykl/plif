import { z } from "zod";
import type { ImportedPage } from "./order";

export const bookThemeSchema = z.enum(["newsprint", "magazine", "classic", "studio"]);

export type BookTheme = z.infer<typeof bookThemeSchema>;

export interface ThemeTokens {
  id: BookTheme;
  label: string;
  description: string;
  stageBg: string;
  headerBg: string;
  textColor: string;
  accentColor: string;
  surfaceWarm: string;
  cardBg: string;
  borderSubtle: string;
  inkMuted: string;
  accentHover: string;
}

export const THEMES: Record<BookTheme, ThemeTokens> = {
  newsprint: {
    id: "newsprint",
    label: "Newsprint",
    description: "Warm paper backdrop for newspapers and campus broadsheets",
    stageBg: "#f5f2eb",
    headerBg: "#24201d",
    textColor: "#24201d",
    accentColor: "#b45309",
    surfaceWarm: "#fdfbf7",
    cardBg: "#ffffff",
    borderSubtle: "#e6dfd5",
    inkMuted: "#6b635b",
    accentHover: "#92400e",
  },
  magazine: {
    id: "magazine",
    label: "Magazine",
    description: "Rich espresso stage inspired by editorial magazine spreads",
    stageBg: "#1c1613",
    headerBg: "#2b211c",
    textColor: "#f5f5f4",
    accentColor: "#d97706",
    surfaceWarm: "#261e19",
    cardBg: "#332923",
    borderSubtle: "#453830",
    inkMuted: "#a8a29e",
    accentHover: "#b45309",
  },
  classic: {
    id: "classic",
    label: "Classic Library",
    description: "Deep parchment and walnut tones for hardcover books",
    stageBg: "#27201c",
    headerBg: "#1c1613",
    textColor: "#fef3c7",
    accentColor: "#f59e0b",
    surfaceWarm: "#2e2520",
    cardBg: "#3b302a",
    borderSubtle: "#4e4038",
    inkMuted: "#d6cbbe",
    accentHover: "#d97706",
  },
  studio: {
    id: "studio",
    label: "Dark Studio",
    description: "Neutral slate canvas for portfolios, lookbooks, and zines",
    stageBg: "#0f172a",
    headerBg: "#1e293b",
    textColor: "#f8fafc",
    accentColor: "#38bdf8",
    surfaceWarm: "#1e293b",
    cardBg: "#24334a",
    borderSubtle: "#334155",
    inkMuted: "#94a3b8",
    accentHover: "#0ea5e9",
  },
};

export type BulkDensityMode = "all-soft" | "hard-covers" | "all-hard";

export function applyBulkDensity(
  pages: readonly ImportedPage[],
  mode: BulkDensityMode,
): ImportedPage[] {
  const lastIndex = pages.length - 1;
  return pages.map((page, index) => {
    if (mode === "all-soft") {
      return { ...page, density: "soft" };
    }
    if (mode === "all-hard") {
      return { ...page, density: "hard" };
    }
    const isCoverEdge = index === 0 || index === lastIndex;
    return { ...page, density: isCoverEdge ? "hard" : "soft" };
  });
}

export type BookPresetId = "newspaper" | "magazine" | "hardcover" | "zine";

export interface BookPreset {
  id: BookPresetId;
  label: string;
  description: string;
  hasCover: boolean;
  densityMode: BulkDensityMode;
  theme: BookTheme;
}

export const BOOK_PRESETS: Record<BookPresetId, BookPreset> = {
  newspaper: {
    id: "newspaper",
    label: "Newspaper",
    description: "Standalone front page with soft newsprint paper spreads",
    hasCover: true,
    densityMode: "all-soft",
    theme: "newsprint",
  },
  magazine: {
    id: "magazine",
    label: "Magazine",
    description: "Standalone front cover with soft, flexible glossy pages",
    hasCover: true,
    densityMode: "all-soft",
    theme: "magazine",
  },
  hardcover: {
    id: "hardcover",
    label: "Hardcover Book",
    description: "Stiff front and back covers with soft inner spreads",
    hasCover: true,
    densityMode: "hard-covers",
    theme: "classic",
  },
  zine: {
    id: "zine",
    label: "Studio Zine",
    description: "Standalone cover with soft pages on a dark studio stage",
    hasCover: true,
    densityMode: "all-soft",
    theme: "studio",
  },
};

export function applyBookPreset(
  presetId: BookPresetId,
  pages: readonly ImportedPage[],
): { hasCover: boolean; theme: BookTheme; pages: ImportedPage[] } {
  const preset = BOOK_PRESETS[presetId];
  return {
    hasCover: preset.hasCover,
    theme: preset.theme,
    pages: applyBulkDensity(pages, preset.densityMode),
  };
}
