import type { BookDirection, TocItem } from "./extras";
import { parseManifest, type Manifest } from "./manifest";
import type { BookTheme, PageDimensions } from "./themes";

export interface ImportedPage {
  id: string;
  src: string;
  width: number;
  height: number;
  alt?: string;
  density?: "hard" | "soft";
}

export interface BuildManifestOptions {
  title: string;
  hasCover?: boolean;
  theme?: BookTheme;
  direction?: BookDirection;
  toc?: readonly TocItem[];
  pages: readonly ImportedPage[];
  pageSize?: PageDimensions;
}

export function movePage<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  if (moved === undefined) return [...items];
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function removePage<T>(items: readonly T[], index: number): T[] {
  if (index < 0 || index >= items.length) {
    return [...items];
  }
  return items.filter((_, i) => i !== index);
}

export function setPageDensity(
  pages: readonly ImportedPage[],
  index: number,
  density: "hard" | "soft",
): ImportedPage[] {
  return pages.map((page, i) => (i === index ? { ...page, density } : page));
}

export function buildManifest(opts: BuildManifestOptions): Manifest {
  const first = opts.pages[0];
  if (!first) {
    throw new Error("buildManifest requires at least one page");
  }
  return parseManifest({
    version: 1,
    title: opts.title.trim() || "Untitled Book",
    pageSize: opts.pageSize
      ? {
          width: Math.round(opts.pageSize.width),
          height: Math.round(opts.pageSize.height),
        }
      : {
          width: Math.round(first.width),
          height: Math.round(first.height),
        },
    hasCover: opts.hasCover ?? true,
    theme: opts.theme ?? "magazine",
    direction: opts.direction ?? "ltr",
    toc: opts.toc ? [...opts.toc] : [],
    pages: opts.pages.map((p) => ({
      src: p.src,
      ...(p.alt !== undefined ? { alt: p.alt } : {}),
      ...(p.density !== undefined ? { density: p.density } : {}),
    })),
  });
}
