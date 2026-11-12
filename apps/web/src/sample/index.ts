import {
  BOOK_PRESETS,
  parseManifest,
  type BookDirection,
  type BookPresetId,
  type BookTheme,
  type ImportedPage,
  type Manifest,
  type PageDimensions,
  type TocItem,
} from "@plif/core";
import { createHardcoverPages, HARDCOVER_TITLE, HARDCOVER_TOC } from "./hardcover";
import { createMagazinePages, MAGAZINE_TITLE, MAGAZINE_TOC } from "./magazine";
import { createNewspaperPages, NEWSPAPER_TITLE, NEWSPAPER_TOC } from "./newspaper";
import { createZinePages, ZINE_TITLE, ZINE_TOC } from "./zine";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./svgUtils";

export interface SamplePublication {
  id: BookPresetId;
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  direction: BookDirection;
  toc: TocItem[];
  pages: ImportedPage[];
  pageSize: PageDimensions;
}

export const SAMPLE_PUBLICATIONS: Record<BookPresetId, SamplePublication> = {
  magazine: {
    id: "magazine",
    title: MAGAZINE_TITLE,
    hasCover: true,
    theme: "magazine",
    direction: "ltr",
    toc: MAGAZINE_TOC,
    pages: createMagazinePages(),
    pageSize: BOOK_PRESETS.magazine.defaultPageSize,
  },
  newspaper: {
    id: "newspaper",
    title: NEWSPAPER_TITLE,
    hasCover: true,
    theme: "newsprint",
    direction: "ltr",
    toc: NEWSPAPER_TOC,
    pages: createNewspaperPages(),
    pageSize: BOOK_PRESETS.newspaper.defaultPageSize,
  },
  hardcover: {
    id: "hardcover",
    title: HARDCOVER_TITLE,
    hasCover: true,
    theme: "classic",
    direction: "ltr",
    toc: HARDCOVER_TOC,
    pages: createHardcoverPages(),
    pageSize: BOOK_PRESETS.hardcover.defaultPageSize,
  },
  zine: {
    id: "zine",
    title: ZINE_TITLE,
    hasCover: true,
    theme: "studio",
    direction: "ltr",
    toc: ZINE_TOC,
    pages: createZinePages(),
    pageSize: BOOK_PRESETS.zine.defaultPageSize,
  },
};

export function getSamplePublication(presetId: BookPresetId = "magazine"): SamplePublication {
  return SAMPLE_PUBLICATIONS[presetId] ?? SAMPLE_PUBLICATIONS.magazine;
}

/**
 * Backwards-compatible default sample manifest (Magazine issue).
 */
export const sampleManifest: Manifest = parseManifest({
  version: 1,
  title: SAMPLE_PUBLICATIONS.magazine.title,
  pageSize: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  theme: SAMPLE_PUBLICATIONS.magazine.theme,
  direction: SAMPLE_PUBLICATIONS.magazine.direction,
  hasCover: SAMPLE_PUBLICATIONS.magazine.hasCover,
  toc: SAMPLE_PUBLICATIONS.magazine.toc,
  pages: SAMPLE_PUBLICATIONS.magazine.pages.map((p) => ({
    src: p.src,
    alt: p.alt,
    ...(p.density ? { density: p.density } : {}),
  })),
});
