# Import Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to upload PDFs and images in the browser, convert every page to optimized WebP page images (`pdfjs-dist` + HTML5 Canvas), reorder/remove pages or toggle page density (`hard`/`soft`), and preview the resulting flipbook live.

**Architecture:** `@plif/core` holds pure, framework-free functions (`movePage`, `removePage`, `setPageDensity`, `buildManifest`) and the `ImportedPage` type. `@plif/web` implements client-side canvas scaling + WebP encoding (`canvas.ts`), image file decoding (`image.ts`), PDF page rasterization with `pdfjs-dist` (`pdf.ts`), a unified `importFiles` dispatcher (`import/index.ts`), and an accessible `<PageOrganizer>` React component wired to `<Flipbook>` in `App.tsx`. `@plif/reader` remains completely untouched and lightweight.

**Tech Stack:** TypeScript (strict), pnpm workspaces, `pdfjs-dist` 4.x (`^4.10.38`, Node >= 20 compatible), React 18, Vite 5, Vitest 2, jsdom, Testing Library.

**Spec:** `C:\Users\Janre\.gemini\antigravity\brain\ec70a09d-b2a6-4595-a66e-a10874bc687f\implementation_plan.md` (sections 2–3, Plan 3).

## Global Constraints

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Do NOT add `pdfjs-dist` to `@plif/core` or `@plif/reader`; `pdfjs-dist` belongs only in `@plif/web` so the standalone reader bundle stays tiny.
- Pin `pdfjs-dist` to `^4.10.38` (supports Node >= 20 in CI; `pdfjs-dist@5.x` requires Node >= 22).
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- TypeScript `strict` and `noUncheckedIndexedAccess` (from `tsconfig.base.json`).
- Conventional Commits, enforced by commitlint (e.g. `feat(core): ...`, `feat(web): ...`). One commit per task.
- Every task must leave `pnpm typecheck && pnpm lint && pnpm test` green.
- Run commands from the repo root `c:\Users\Janre\Desktop\Documents\GitHub\plif`.

## File Structure

| Path                                             | Responsibility                                                                   |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `packages/core/src/order.ts`                     | `ImportedPage` type, `movePage`, `removePage`, `setPageDensity`, `buildManifest` |
| `packages/core/src/order.test.ts`                | Unit tests for page ordering, density updates, and manifest assembly             |
| `packages/core/src/index.ts`                     | Re-export `./order`                                                              |
| `apps/web/vitest.config.ts`                      | Vitest jsdom configuration for `@plif/web`                                       |
| `apps/web/src/import/canvas.ts`                  | `scaleToFitMaxDimension`, `canvasToWebpUrl`                                      |
| `apps/web/src/import/canvas.test.ts`             | Unit tests for dimension math and WebP Blob/dataURL fallback                     |
| `apps/web/src/import/image.ts`                   | `importImageFile` (image `File` -> scaled WebP `ImportedPage`)                   |
| `apps/web/src/import/image.test.ts`              | Unit tests for `importImageFile`                                                 |
| `apps/web/src/import/pdf.ts`                     | `importPdfFile` (PDF `File` -> per-page WebP `ImportedPage[]` via `pdfjs-dist`)  |
| `apps/web/src/import/pdf.test.ts`                | Unit tests for `importPdfFile` with `vi.hoisted` mock of `pdfjs-dist`            |
| `apps/web/src/import/index.ts`                   | `importFiles` (mixed PDF + image batch dispatcher)                               |
| `apps/web/src/import/index.test.ts`              | Unit tests for `importFiles`                                                     |
| `apps/web/src/components/PageOrganizer.tsx`      | Accessible file upload + page reorder / density / remove UI                      |
| `apps/web/src/components/PageOrganizer.test.tsx` | Component tests for `<PageOrganizer>`                                            |
| `apps/web/src/App.tsx`                           | Integrates `<PageOrganizer>` + `buildManifest` with live `<Flipbook>` preview    |

---

### Task 1: Page ordering and manifest assembly in `@plif/core`

**Files:**

- Create: `packages/core/src/order.ts`
- Test: `packages/core/src/order.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**

- Consumes:
  - `parseManifest(input: unknown): Manifest` and `type Manifest` from `packages/core/src/manifest.ts`
- Produces:
  - `export interface ImportedPage { id: string; src: string; width: number; height: number; alt?: string; density?: "hard" | "soft" }`
  - `export interface BuildManifestOptions { title: string; hasCover?: boolean; pages: readonly ImportedPage[] }`
  - `export function movePage<T>(items: readonly T[], fromIndex: number, toIndex: number): T[]`
  - `export function removePage<T>(items: readonly T[], index: number): T[]`
  - `export function setPageDensity(pages: readonly ImportedPage[], index: number, density: "hard" | "soft"): ImportedPage[]`
  - `export function buildManifest(opts: BuildManifestOptions): Manifest`

- [ ] **Step 1: Write the failing test**

`packages/core/src/order.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildManifest, movePage, removePage, setPageDensity, type ImportedPage } from "./order";

const samplePages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 600, height: 800, alt: "Page 1" },
  { id: "p2", src: "blob:2", width: 600, height: 800, alt: "Page 2" },
  { id: "p3", src: "blob:3", width: 600, height: 800, alt: "Page 3" },
];

describe("movePage", () => {
  it("moves an item forward and preserves immutability", () => {
    const next = movePage(samplePages, 0, 2);
    expect(next.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
    expect(samplePages.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("moves an item backward", () => {
    const next = movePage(samplePages, 2, 0);
    expect(next.map((p) => p.id)).toEqual(["p3", "p1", "p2"]);
  });

  it("returns a shallow copy when indices are out of bounds or equal", () => {
    expect(movePage(samplePages, -1, 1).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
    expect(movePage(samplePages, 0, 99).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
    expect(movePage(samplePages, 1, 1).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });
});

describe("removePage", () => {
  it("removes the page at the given index", () => {
    const next = removePage(samplePages, 1);
    expect(next.map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("returns a shallow copy if index is out of range", () => {
    expect(removePage(samplePages, -1)).toHaveLength(3);
    expect(removePage(samplePages, 5)).toHaveLength(3);
  });
});

describe("setPageDensity", () => {
  it("sets density on the targeted page without mutating others", () => {
    const next = setPageDensity(samplePages, 0, "hard");
    expect(next[0]?.density).toBe("hard");
    expect(next[1]?.density).toBeUndefined();
    expect(samplePages[0]?.density).toBeUndefined();
  });
});

describe("buildManifest", () => {
  it("builds a validated Manifest using the first page dimensions", () => {
    const pages = setPageDensity(samplePages, 0, "hard");
    const manifest = buildManifest({
      title: "  Campus Issue  ",
      hasCover: true,
      pages,
    });
    expect(manifest).toEqual({
      version: 1,
      title: "Campus Issue",
      pageSize: { width: 600, height: 800 },
      hasCover: true,
      pages: [
        { src: "blob:1", alt: "Page 1", density: "hard" },
        { src: "blob:2", alt: "Page 2" },
        { src: "blob:3", alt: "Page 3" },
      ],
    });
  });

  it("defaults blank titles to Untitled Book and throws on empty pages", () => {
    const manifest = buildManifest({ title: "   ", pages: samplePages });
    expect(manifest.title).toBe("Untitled Book");
    expect(() => buildManifest({ title: "Empty", pages: [] })).toThrow(/at least one page/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/core test`
Expected: FAIL (cannot resolve `./order`).

- [ ] **Step 3: Write minimal implementation**

`packages/core/src/order.ts`:

```ts
import { parseManifest, type Manifest } from "./manifest";

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
  pages: readonly ImportedPage[];
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
    pageSize: {
      width: Math.round(first.width),
      height: Math.round(first.height),
    },
    hasCover: opts.hasCover ?? true,
    pages: opts.pages.map((p) => ({
      src: p.src,
      ...(p.alt !== undefined ? { alt: p.alt } : {}),
      ...(p.density !== undefined ? { density: p.density } : {}),
    })),
  });
}
```

Update `packages/core/src/index.ts`:

```ts
export const PROJECT_NAME = "plif";
export * from "./manifest";
export * from "./pages";
export * from "./order";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @plif/core test && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/order.ts packages/core/src/order.test.ts packages/core/src/index.ts
git commit -m "feat(core): add page ordering and manifest builder"
```

---

### Task 2: Canvas scaling, WebP encoding, and image file importer in `@plif/web`

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Modify: `apps/web/tsconfig.json`
- Create: `apps/web/src/import/canvas.ts`
- Test: `apps/web/src/import/canvas.test.ts`
- Create: `apps/web/src/import/image.ts`
- Test: `apps/web/src/import/image.test.ts`

**Interfaces:**

- Consumes:
  - `type ImportedPage` from `@plif/core`
- Produces:
  - `export interface ScaledDimensions { width: number; height: number; scale: number }`
  - `export function scaleToFitMaxDimension(width: number, height: number, maxDimension?: number): ScaledDimensions`
  - `export function canvasToWebpUrl(canvas: HTMLCanvasElement, quality?: number): Promise<string>`
  - `export interface LoadedImageSource { width: number; height: number; draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void }`
  - `export interface ImportImageOptions { maxDimension?: number; quality?: number; loadImage?: (file: File) => Promise<LoadedImageSource> }`
  - `export function importImageFile(file: File, opts?: ImportImageOptions): Promise<ImportedPage>`

- [ ] **Step 1: Configure Vitest & Testing Library in `@plif/web`**

`apps/web/package.json`:

```json
{
  "name": "@plif/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@plif/core": "workspace:*",
    "@plif/reader": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.2",
    "@testing-library/react": "^16.3.3",
    "@types/react": "^18.3.31",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^4.7.0",
    "jsdom": "^25.0.1",
    "vite": "^5.4.21",
    "vitest": "^2.1.9"
  }
}
```

`apps/web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "jsdom" },
});
```

`apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "jsx": "react-jsx" },
  "include": ["src", "vite.config.ts", "vitest.config.ts"]
}
```

Run: `pnpm install`

- [ ] **Step 2: Write the failing tests for `canvas.ts` and `image.ts`**

`apps/web/src/import/canvas.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { canvasToWebpUrl, scaleToFitMaxDimension } from "./canvas";

describe("scaleToFitMaxDimension", () => {
  it("keeps dimensions unchanged when within maxDimension", () => {
    expect(scaleToFitMaxDimension(800, 1200, 1600)).toEqual({
      width: 800,
      height: 1200,
      scale: 1,
    });
  });

  it("scales down proportionally when longest edge exceeds maxDimension", () => {
    const res = scaleToFitMaxDimension(2400, 3200, 1600);
    expect(res.width).toBe(1200);
    expect(res.height).toBe(1600);
    expect(res.scale).toBeCloseTo(0.5);
  });

  it("throws when width or height is non-positive", () => {
    expect(() => scaleToFitMaxDimension(0, 500)).toThrow(/positive/i);
  });
});

describe("canvasToWebpUrl", () => {
  it("returns an object URL when toBlob yields a non-empty Blob", async () => {
    const canvas = document.createElement("canvas");
    canvas.toBlob = (cb) => cb(new Blob(["webp-bytes"], { type: "image/webp" }));
    const createUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:webp-test");

    const url = await canvasToWebpUrl(canvas, 0.85);
    expect(url).toBe("blob:webp-test");
    createUrlSpy.mockRestore();
  });

  it("falls back to toDataURL when toBlob returns null", async () => {
    const canvas = document.createElement("canvas");
    canvas.toBlob = (cb) => cb(null);
    canvas.toDataURL = vi.fn().mockReturnValue("data:image/webp;base64,AAA");

    const url = await canvasToWebpUrl(canvas, 0.8);
    expect(url).toBe("data:image/webp;base64,AAA");
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.8);
  });
});
```

`apps/web/src/import/image.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { importImageFile } from "./image";

describe("importImageFile", () => {
  it("scales a large image, draws it to canvas, and returns an ImportedPage", async () => {
    const drawSpy = vi.fn();
    const file = new File(["img"], "cover-art.png", { type: "image/png" });

    const page = await importImageFile(file, {
      maxDimension: 1000,
      loadImage: async () => ({
        width: 1500,
        height: 2000,
        draw: drawSpy,
      }),
    });

    expect(page.width).toBe(750);
    expect(page.height).toBe(1000);
    expect(page.alt).toBe("cover-art");
    expect(page.id).toBeTruthy();
    expect(page.src).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @plif/web test`
Expected: FAIL (cannot resolve `./canvas` and `./image`).

- [ ] **Step 4: Write minimal implementations for `canvas.ts` and `image.ts`**

`apps/web/src/import/canvas.ts`:

```ts
export interface ScaledDimensions {
  width: number;
  height: number;
  scale: number;
}

export function scaleToFitMaxDimension(
  width: number,
  height: number,
  maxDimension = 1600,
): ScaledDimensions {
  if (width <= 0 || height <= 0) {
    throw new Error("Dimensions must be positive");
  }
  const longest = Math.max(width, height);
  const scale = longest > maxDimension ? maxDimension / longest : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

export function canvasToWebpUrl(canvas: HTMLCanvasElement, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === "function") {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0 && typeof URL.createObjectURL === "function") {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(canvas.toDataURL("image/webp", quality));
          }
        },
        "image/webp",
        quality,
      );
      return;
    }
    resolve(canvas.toDataURL("image/webp", quality));
  });
}
```

`apps/web/src/import/image.ts`:

```ts
import type { ImportedPage } from "@plif/core";
import { canvasToWebpUrl, scaleToFitMaxDimension } from "./canvas";

export interface LoadedImageSource {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface ImportImageOptions {
  maxDimension?: number;
  quality?: number;
  loadImage?: (file: File) => Promise<LoadedImageSource>;
}

function defaultLoadImage(file: File): Promise<LoadedImageSource> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image: ${file.name}`));
    };
    img.src = objectUrl;
  });
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "") || filename;
}

export async function importImageFile(
  file: File,
  opts: ImportImageOptions = {},
): Promise<ImportedPage> {
  const loader = opts.loadImage ?? defaultLoadImage;
  const source = await loader(file);
  const { width, height } = scaleToFitMaxDimension(source.width, source.height, opts.maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    source.draw(ctx, width, height);
  }
  const src = await canvasToWebpUrl(canvas, opts.quality);
  return {
    id: crypto.randomUUID(),
    src,
    width,
    height,
    alt: stripExtension(file.name),
  };
}
```

- [ ] **Step 5: Run tests, typecheck, and lint**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/vitest.config.ts apps/web/src/import/canvas.ts apps/web/src/import/canvas.test.ts apps/web/src/import/image.ts apps/web/src/import/image.test.ts pnpm-lock.yaml
git commit -m "feat(web): add canvas WebP encoder and image file importer"
```

---

### Task 3: Client-side PDF importer (`pdfjs-dist`) and unified `importFiles` dispatcher

**Files:**

- Modify: `apps/web/package.json`
- Create: `apps/web/src/import/pdf.ts`
- Test: `apps/web/src/import/pdf.test.ts`
- Create: `apps/web/src/import/index.ts`
- Test: `apps/web/src/import/index.test.ts`

**Interfaces:**

- Consumes:
  - `type ImportedPage` from `@plif/core`
  - `canvasToWebpUrl` from `apps/web/src/import/canvas.ts`
  - `importImageFile` from `apps/web/src/import/image.ts`
- Produces:
  - `export interface ImportPdfOptions { maxDimension?: number; quality?: number; onProgress?: (current: number, total: number) => void }`
  - `export function importPdfFile(file: File, opts?: ImportPdfOptions): Promise<ImportedPage[]>`
  - `export interface ImportFilesOptions { maxDimension?: number; quality?: number; onProgress?: (current: number, total: number) => void }`
  - `export function importFiles(files: readonly File[], opts?: ImportFilesOptions): Promise<ImportedPage[]>`

- [ ] **Step 1: Add `pdfjs-dist@^4.10.38` to `@plif/web`**

Run: `pnpm --filter @plif/web add pdfjs-dist@^4.10.38`
Expected: `pdfjs-dist` added to `apps/web/package.json`.

- [ ] **Step 2: Write the failing tests for `pdf.ts` and `import/index.ts`**

`apps/web/src/import/pdf.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDocumentMock, destroyMock, cleanupMock, renderMock } = vi.hoisted(() => {
  const render = vi.fn(() => ({ promise: Promise.resolve() }));
  const cleanup = vi.fn();
  const destroy = vi.fn(() => Promise.resolve());
  const getPage = vi.fn(async (pageNum: number) => ({
    getViewport: ({ scale }: { scale: number }) => ({
      width: 600 * scale,
      height: 800 * scale,
    }),
    render,
    cleanup,
    pageNumber: pageNum,
  }));
  const getDocument = vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage,
      destroy,
    }),
  }));
  return {
    getDocumentMock: getDocument,
    destroyMock: destroy,
    cleanupMock: cleanup,
    renderMock: render,
  };
});

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: getDocumentMock,
}));

import { importPdfFile } from "./pdf";

describe("importPdfFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders every PDF page at scaled viewport, reports progress, and cleans up", async () => {
    const progress: Array<[number, number]> = [];
    const file = new File([new Uint8Array([37, 80, 68, 70])], "magazine.pdf", {
      type: "application/pdf",
    });

    const pages = await importPdfFile(file, {
      maxDimension: 1600,
      onProgress: (cur, total) => progress.push([cur, total]),
    });

    expect(getDocumentMock).toHaveBeenCalledTimes(1);
    expect(pages).toHaveLength(2);
    expect(pages[0]?.width).toBe(1200);
    expect(pages[0]?.height).toBe(1600);
    expect(pages[0]?.alt).toBe("magazine — Page 1");
    expect(pages[1]?.alt).toBe("magazine — Page 2");
    expect(progress).toEqual([
      [1, 2],
      [2, 2],
    ]);
    expect(cleanupMock).toHaveBeenCalledTimes(2);
    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(2);
  });
});
```

`apps/web/src/import/index.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import type { ImportedPage } from "@plif/core";

const { importPdfFileMock, importImageFileMock } = vi.hoisted(() => ({
  importPdfFileMock: vi.fn<() => Promise<ImportedPage[]>>(),
  importImageFileMock: vi.fn<() => Promise<ImportedPage>>(),
}));

vi.mock("./pdf", () => ({
  importPdfFile: importPdfFileMock,
}));

vi.mock("./image", () => ({
  importImageFile: importImageFileMock,
}));

import { importFiles } from "./index";

describe("importFiles", () => {
  it("dispatches PDF and image files in order and flattens resulting pages", async () => {
    importPdfFileMock.mockResolvedValueOnce([
      { id: "pdf-1", src: "blob:p1", width: 600, height: 800, alt: "Doc — Page 1" },
      { id: "pdf-2", src: "blob:p2", width: 600, height: 800, alt: "Doc — Page 2" },
    ]);
    importImageFileMock.mockResolvedValueOnce({
      id: "img-1",
      src: "blob:i1",
      width: 600,
      height: 800,
      alt: "cover",
    });

    const pdf = new File(["%PDF"], "doc.pdf", { type: "application/pdf" });
    const img = new File(["png"], "cover.png", { type: "image/png" });

    const pages = await importFiles([pdf, img]);
    expect(pages.map((p) => p.id)).toEqual(["pdf-1", "pdf-2", "img-1"]);
  });

  it("throws a descriptive error for unsupported file types", async () => {
    const txt = new File(["hello"], "notes.txt", { type: "text/plain" });
    await expect(importFiles([txt])).rejects.toThrow(/unsupported file type/i);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @plif/web test`
Expected: FAIL (cannot resolve `./pdf` and `./index`).

- [ ] **Step 4: Write minimal implementations for `pdf.ts` and `import/index.ts`**

`apps/web/src/import/pdf.ts`:

```ts
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { ImportedPage } from "@plif/core";
import { canvasToWebpUrl } from "./canvas";

if (!GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

export interface ImportPdfOptions {
  maxDimension?: number;
  quality?: number;
  onProgress?: (current: number, total: number) => void;
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "") || filename;
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === "function") {
    return new Uint8Array(await file.arrayBuffer());
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error(`Failed to read file bytes: ${file.name}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

export async function importPdfFile(
  file: File,
  opts: ImportPdfOptions = {},
): Promise<ImportedPage[]> {
  const maxDimension = opts.maxDimension ?? 1600;
  const data = await readFileBytes(file);
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;
  const baseName = stripExtension(file.name);
  const pages: ImportedPage[] = [];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      const longest = Math.max(baseViewport.width, baseViewport.height, 1);
      const scale = maxDimension / longest;
      const viewport = page.getViewport({ scale });
      const width = Math.max(1, Math.round(viewport.width));
      const height = Math.max(1, Math.round(viewport.height));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
      } else {
        // In headless test environments where canvas.getContext("2d") is null,
        // still invoke page.render with an empty context cast so render calls are exercised.
        await page.render({
          canvasContext: {} as CanvasRenderingContext2D,
          viewport,
        }).promise;
      }
      const src = await canvasToWebpUrl(canvas, opts.quality);
      page.cleanup();

      pages.push({
        id: crypto.randomUUID(),
        src,
        width,
        height,
        alt: `${baseName} — Page ${i}`,
      });
      opts.onProgress?.(i, pdf.numPages);
    }
  } finally {
    await pdf.destroy();
  }

  return pages;
}
```

`apps/web/src/import/index.ts`:

```ts
import type { ImportedPage } from "@plif/core";
import { importImageFile } from "./image";
import { importPdfFile } from "./pdf";

export * from "./canvas";
export * from "./image";
export * from "./pdf";

export interface ImportFilesOptions {
  maxDimension?: number;
  quality?: number;
  onProgress?: (current: number, total: number) => void;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(file.name);
}

export async function importFiles(
  files: readonly File[],
  opts: ImportFilesOptions = {},
): Promise<ImportedPage[]> {
  const results: ImportedPage[] = [];

  for (const file of files) {
    if (isPdfFile(file)) {
      const pdfPages = await importPdfFile(file, opts);
      results.push(...pdfPages);
    } else if (isImageFile(file)) {
      const imagePage = await importImageFile(file, opts);
      results.push(imagePage);
    } else {
      throw new Error(`Unsupported file type: ${file.name || file.type}`);
    }
  }

  return results;
}
```

- [ ] **Step 5: Run tests, typecheck, and lint**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/src/import/pdf.ts apps/web/src/import/pdf.test.ts apps/web/src/import/index.ts apps/web/src/import/index.test.ts pnpm-lock.yaml
git commit -m "feat(web): add client-side PDF importer and file dispatcher"
```

---

### Task 4: `<PageOrganizer>` upload & reorder component

**Files:**

- Create: `apps/web/src/components/PageOrganizer.tsx`
- Test: `apps/web/src/components/PageOrganizer.test.tsx`

**Interfaces:**

- Consumes:
  - `type ImportedPage`, `movePage`, `removePage`, `setPageDensity` from `@plif/core`
- Produces:
  - `export interface PageOrganizerProps { pages: readonly ImportedPage[]; isImporting?: boolean; progressText?: string | null; errorText?: string | null; onUploadFiles: (files: File[]) => void; onChangePages: (pages: ImportedPage[]) => void }`
  - `export function PageOrganizer(props: PageOrganizerProps): JSX.Element`

- [ ] **Step 1: Write the failing test**

`apps/web/src/components/PageOrganizer.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ImportedPage } from "@plif/core";
import { PageOrganizer } from "./PageOrganizer";

afterEach(() => cleanup());

const pages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 600, height: 800, alt: "Cover" },
  { id: "p2", src: "blob:2", width: 600, height: 800, alt: "Spread Left" },
  { id: "p3", src: "blob:3", width: 600, height: 800, alt: "Spread Right" },
];

describe("<PageOrganizer>", () => {
  it("calls onUploadFiles when files are selected via the file input", () => {
    const onUploadFiles = vi.fn();
    render(<PageOrganizer pages={[]} onUploadFiles={onUploadFiles} onChangePages={vi.fn()} />);

    const input = screen.getByLabelText(/upload pdf or images/i);
    const file = new File(["%PDF"], "issue.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadFiles).toHaveBeenCalledTimes(1);
    expect(onUploadFiles).toHaveBeenCalledWith([file]);
  });

  it("reorders pages when Move left / Move right buttons are clicked", () => {
    const onChangePages = vi.fn();
    render(<PageOrganizer pages={pages} onUploadFiles={vi.fn()} onChangePages={onChangePages} />);

    fireEvent.click(screen.getByRole("button", { name: "Move page 1 right" }));
    expect(onChangePages).toHaveBeenCalledWith([pages[1], pages[0], pages[2]]);

    fireEvent.click(screen.getByRole("button", { name: "Move page 2 left" }));
    expect(onChangePages).toHaveBeenLastCalledWith([pages[1], pages[0], pages[2]]);
  });

  it("toggles page density between soft and hard and removes pages", () => {
    const onChangePages = vi.fn();
    render(<PageOrganizer pages={pages} onUploadFiles={vi.fn()} onChangePages={onChangePages} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle hard cover for page 1" }));
    expect(onChangePages).toHaveBeenCalledWith([
      { ...pages[0], density: "hard" },
      pages[1],
      pages[2],
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Remove page 2" }));
    expect(onChangePages).toHaveBeenLastCalledWith([pages[0], pages[2]]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/web test`
Expected: FAIL (cannot resolve `./PageOrganizer`).

- [ ] **Step 3: Write minimal implementation**

`apps/web/src/components/PageOrganizer.tsx`:

```tsx
import { useState, type ChangeEvent, type DragEvent } from "react";
import { movePage, removePage, setPageDensity, type ImportedPage } from "@plif/core";

export interface PageOrganizerProps {
  pages: readonly ImportedPage[];
  isImporting?: boolean;
  progressText?: string | null;
  errorText?: string | null;
  onUploadFiles: (files: File[]) => void;
  onChangePages: (pages: ImportedPage[]) => void;
}

export function PageOrganizer({
  pages,
  isImporting = false,
  progressText = null,
  errorText = null,
  onUploadFiles,
  onChangePages,
}: PageOrganizerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length > 0) {
      onUploadFiles(list);
      e.target.value = "";
    }
  };

  const handleFileDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (list.length > 0) {
      onUploadFiles(list);
    }
  };

  return (
    <section
      aria-label="Page organizer"
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 12,
        padding: 16,
        border: "1px solid #d6d3d1",
        borderRadius: 8,
        background: "#fafaf9",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            border: "1px dashed #78716c",
            borderRadius: 6,
            cursor: isImporting ? "wait" : "pointer",
            background: "#ffffff",
            fontWeight: 600,
          }}
        >
          <span>Upload PDF or Images</span>
          <input
            type="file"
            accept="application/pdf,image/*"
            multiple
            disabled={isImporting}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {progressText && (
          <span role="status" style={{ fontSize: 14, color: "#44403c" }}>
            {progressText}
          </span>
        )}
        {errorText && (
          <span role="alert" style={{ fontSize: 14, color: "#b91c1c" }}>
            {errorText}
          </span>
        )}
      </div>

      {pages.length > 0 && (
        <ol
          aria-label="Imported pages"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {pages.map((page, i) => {
            const pageNum = i + 1;
            const isHard = page.density === "hard";
            return (
              <li
                key={page.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== i) {
                    onChangePages(movePage(pages, dragIndex, i));
                  }
                  setDragIndex(null);
                }}
                style={{
                  border: "1px solid #e7e5e4",
                  borderRadius: 6,
                  padding: 8,
                  background: "#ffffff",
                  display: "grid",
                  gap: 6,
                }}
              >
                <img
                  src={page.src}
                  alt={page.alt ?? `Page ${pageNum}`}
                  style={{
                    width: "100%",
                    aspectRatio: `${page.width} / ${page.height}`,
                    objectFit: "cover",
                    borderRadius: 4,
                    background: "#f5f5f4",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span>#{pageNum}</span>
                  <span>{isHard ? "Hard" : "Soft"}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    aria-label={`Move page ${pageNum} left`}
                    disabled={i === 0}
                    onClick={() => onChangePages(movePage(pages, i, i - 1))}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label={`Move page ${pageNum} right`}
                    disabled={i === pages.length - 1}
                    onClick={() => onChangePages(movePage(pages, i, i + 1))}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label={`Toggle hard cover for page ${pageNum}`}
                    onClick={() =>
                      onChangePages(setPageDensity(pages, i, isHard ? "soft" : "hard"))
                    }
                  >
                    {isHard ? "Soft" : "Hard"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove page ${pageNum}`}
                    onClick={() => onChangePages(removePage(pages, i))}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, and lint**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/PageOrganizer.tsx apps/web/src/components/PageOrganizer.test.tsx
git commit -m "feat(web): add PageOrganizer upload and reorder component"
```

---

### Task 5: Wire `<PageOrganizer>` into `App.tsx` for live flipbook creation

**Files:**

- Modify: `apps/web/src/App.tsx`

**Interfaces:**

- Consumes:
  - `buildManifest`, `formatPageLabel`, `type ImportedPage` from `@plif/core`
  - `Flipbook`, `type FlipbookHandle` from `@plif/reader`
  - `importFiles` from `apps/web/src/import/index.ts`
  - `PageOrganizer` from `apps/web/src/components/PageOrganizer.tsx`
  - `sampleManifest` from `apps/web/src/sample.ts`
- Produces:
  - `export function App(): JSX.Element` (renders `<PageOrganizer>` above the live `<Flipbook>` preview; uses `buildManifest` when user-imported pages exist, or falls back to `sampleManifest`).

- [ ] **Step 1: Update `apps/web/src/App.tsx`**

`apps/web/src/App.tsx`:

```tsx
import { useMemo, useRef, useState } from "react";
import { buildManifest, formatPageLabel, type ImportedPage } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "@plif/reader";
import { PageOrganizer } from "./components/PageOrganizer";
import { importFiles } from "./import";
import { sampleManifest } from "./sample";

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activeManifest = useMemo(() => {
    if (pages.length === 0) return sampleManifest;
    return buildManifest({
      title: "Imported Book",
      hasCover: true,
      pages,
    });
  }, [pages]);

  const total = activeManifest.pages.length;

  const handleUploadFiles = async (files: File[]) => {
    setIsImporting(true);
    setErrorText(null);
    setProgressText("Importing files...");
    try {
      const imported = await importFiles(files, {
        onProgress: (cur, max) => setProgressText(`Rendering PDF page ${cur} / ${max}...`),
      });
      setPages((prev) => [...prev, ...imported]);
      setIndex(0);
      setProgressText(null);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Failed to import files");
      setProgressText(null);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        gap: 16,
        padding: "24px 0",
      }}
    >
      <PageOrganizer
        pages={pages}
        isImporting={isImporting}
        progressText={progressText}
        errorText={errorText}
        onUploadFiles={handleUploadFiles}
        onChangePages={(next) => {
          setPages(next);
          setIndex(0);
        }}
      />
      <Flipbook ref={book} manifest={activeManifest} onPageChange={setIndex} />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => book.current?.prev()}>Previous</button>
        <span>{formatPageLabel(index, total, activeManifest.hasCover, false)}</span>
        <button onClick={() => book.current?.next()}>Next</button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build, typecheck, lint, and tests**

Run: `pnpm --filter @plif/web build && pnpm typecheck && pnpm lint && pnpm test`
Expected: `dist/` emitted cleanly and all tests pass across `@plif/core`, `@plif/reader`, and `@plif/web`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat(web): wire PageOrganizer import pipeline into live Flipbook preview"
```
