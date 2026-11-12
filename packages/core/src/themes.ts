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

export interface PageDimensions {
  width: number;
  height: number;
}

export type PageFormatId = "a4" | "us-letter" | "octavo" | "broadsheet" | "square";

export interface PageFormatPreset {
  id: PageFormatId;
  label: string;
  description: string;
  dimensions: PageDimensions;
  aspectRatioLabel: string;
}

export const PAGE_FORMATS: Record<PageFormatId, PageFormatPreset> = {
  a4: {
    id: "a4",
    label: "A4 Portrait",
    description: "Standard international paper (magazine & catalog)",
    dimensions: { width: 480, height: 679 },
    aspectRatioLabel: "1 : 1.41",
  },
  "us-letter": {
    id: "us-letter",
    label: "US Letter",
    description: "8.5 × 11 in (editorial & business reports)",
    dimensions: { width: 480, height: 621 },
    aspectRatioLabel: "1 : 1.29",
  },
  octavo: {
    id: "octavo",
    label: "Trade Book (6×9)",
    description: "Octavo hardcover & fiction proportion",
    dimensions: { width: 460, height: 690 },
    aspectRatioLabel: "1 : 1.50",
  },
  broadsheet: {
    id: "broadsheet",
    label: "Newspaper Broadsheet",
    description: "Tall multi-column newsprint format",
    dimensions: { width: 480, height: 740 },
    aspectRatioLabel: "1 : 1.54",
  },
  square: {
    id: "square",
    label: "Square",
    description: "Art zine, photo album, and vinyl booklet",
    dimensions: { width: 500, height: 500 },
    aspectRatioLabel: "1 : 1",
  },
};

export function formatAspectRatio(width: number, height: number): string {
  if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    return "1 : 1";
  }
  if (width === height) {
    return "1 : 1";
  }
  const ratio = height / width;
  return `1 : ${ratio.toFixed(2)}`;
}

export type BookPresetId = "newspaper" | "magazine" | "hardcover" | "zine";

export interface BookPreset {
  id: BookPresetId;
  label: string;
  description: string;
  hasCover: boolean;
  densityMode: BulkDensityMode;
  theme: BookTheme;
  defaultPageSize: PageDimensions;
}

export const BOOK_PRESETS: Record<BookPresetId, BookPreset> = {
  newspaper: {
    id: "newspaper",
    label: "Newspaper",
    description: "Standalone front page with soft newsprint paper spreads",
    hasCover: true,
    densityMode: "all-soft",
    theme: "newsprint",
    defaultPageSize: PAGE_FORMATS.broadsheet.dimensions,
  },
  magazine: {
    id: "magazine",
    label: "Magazine",
    description: "Standalone front cover with soft, flexible glossy pages",
    hasCover: true,
    densityMode: "all-soft",
    theme: "magazine",
    defaultPageSize: PAGE_FORMATS.a4.dimensions,
  },
  hardcover: {
    id: "hardcover",
    label: "Hardcover Book",
    description: "Stiff front and back covers with soft inner spreads",
    hasCover: true,
    densityMode: "hard-covers",
    theme: "classic",
    defaultPageSize: PAGE_FORMATS.octavo.dimensions,
  },
  zine: {
    id: "zine",
    label: "Studio Zine",
    description: "Standalone cover with soft pages on a dark studio stage",
    hasCover: true,
    densityMode: "all-soft",
    theme: "studio",
    defaultPageSize: PAGE_FORMATS.square.dimensions,
  },
};

export function applyBookPreset(
  presetId: BookPresetId,
  pages: readonly ImportedPage[],
): { hasCover: boolean; theme: BookTheme; pageSize: PageDimensions; pages: ImportedPage[] } {
  const preset = BOOK_PRESETS[presetId];
  return {
    hasCover: preset.hasCover,
    theme: preset.theme,
    pageSize: preset.defaultPageSize,
    pages: applyBulkDensity(pages, preset.densityMode),
  };
}
