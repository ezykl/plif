# Plif: Reader Extras Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add zoom controls, `#/page/N` deep-link URL hash synchronization, Table of Contents (TOC), page thumbnails strip, page slider, fullscreen toggle, and RTL reading direction to `@plif/core`, `@plif/reader`, and `@plif/web`.

**Architecture:**

- **`@plif/core`** (`packages/core/src/extras.ts`, `manifest.ts`, `order.ts`): Pure schemas and helpers for reading direction (`"ltr" | "rtl"`), Table of Contents entries (`TocItem`), zoom math (`clampZoom`, `stepZoom`), `#/page/N` URL hash parsing/formatting (`parsePageHash`, `formatPageHash`), and direction-aware keyboard arrow mapping (`resolveArrowAction`).
- **`@plif/reader`** (`packages/reader/src/Flipbook.tsx`, `ReaderToolbar.tsx`): `<Flipbook>` supports `zoom` scale transform and RTL arrow keys (`manifest.direction`). `<ReaderToolbar>` provides an accessible control bar with Prev/Next, page slider, Zoom in/out/reset, TOC drawer, Page Thumbnails strip, and Fullscreen toggle.
- **`@plif/web`** (`apps/web/src/components/BookSettingsPanel.tsx`, `CreatorWizard.tsx`, `App.tsx`, `sample.ts`): Creator UI lets users configure LTR/RTL direction and Table of Contents chapters; the live stage integrates `<ReaderToolbar>`, URL `#/page/N` deep links, and the browser Fullscreen API.

**Tech Stack:** TypeScript 5.6 (strict), Zod 3.23, React 18.3, StPageFlip (`page-flip`), Vitest + Testing Library + jsdom.

**Global Constraints:**

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Do NOT add `pdfjs-dist` to `@plif/core` or `@plif/reader`.
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- TypeScript `strict` and `noUncheckedIndexedAccess` (from `tsconfig.base.json`).
- Conventional Commits, enforced by commitlint (e.g. `feat(core): ...`, `feat(reader): ...`, `feat(web): ...`). One commit per task.
- Every task must leave `pnpm typecheck && pnpm lint && pnpm test` green.
- Standalone HTML/ZIP export and `<plif-book>` web component are out of scope (Plan 6).

---

## Task 1: `@plif/core` reader extras schema & helpers (RTL direction, TOC, zoom math, and `#/page/N` deep links)

**Files:**

- Create: `packages/core/src/extras.ts`
- Create: `packages/core/src/extras.test.ts`
- Modify: `packages/core/src/manifest.ts`
- Modify: `packages/core/src/order.ts`
- Modify: `packages/core/src/order.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write the failing test in `packages/core/src/extras.test.ts` and update `packages/core/src/order.test.ts`**

`packages/core/src/extras.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  clampZoom,
  formatPageHash,
  parseManifest,
  parsePageHash,
  resolveArrowAction,
  stepZoom,
} from "./index";

describe("reader extras in @plif/core", () => {
  it("defaults manifest direction to ltr and toc to empty array", () => {
    const m = parseManifest({
      version: 1,
      title: "Book",
      pageSize: { width: 400, height: 600 },
      pages: [{ src: "p1.webp" }],
    });
    expect(m.direction).toBe("ltr");
    expect(m.toc).toEqual([]);
  });

  it("parses custom rtl direction and toc items", () => {
    const m = parseManifest({
      version: 1,
      title: "Manga",
      pageSize: { width: 400, height: 600 },
      direction: "rtl",
      toc: [{ title: "Chapter 1", page: 1 }],
      pages: [{ src: "p1.webp" }, { src: "p2.webp" }],
    });
    expect(m.direction).toBe("rtl");
    expect(m.toc).toEqual([{ title: "Chapter 1", page: 1 }]);
  });

  it("clamps and steps zoom between 1 and 3", () => {
    expect(clampZoom(0.5)).toBe(1);
    expect(clampZoom(4)).toBe(3);
    expect(stepZoom(1, 0.25)).toBe(1.25);
    expect(stepZoom(3, 0.25)).toBe(3);
    expect(stepZoom(1, -0.25)).toBe(1);
  });

  it("formats and parses #/page/N deep-link hashes", () => {
    expect(formatPageHash(0)).toBe("#/page/1");
    expect(formatPageHash(4)).toBe("#/page/5");
    expect(parsePageHash("#/page/1", 12)).toBe(0);
    expect(parsePageHash("#/page/5", 12)).toBe(4);
    expect(parsePageHash("#/page/99", 12)).toBe(11);
    expect(parsePageHash("#/page/0", 12)).toBe(0);
    expect(parsePageHash("#other", 12)).toBeNull();
    expect(parsePageHash("#/page/2", 0)).toBeNull();
  });

  it("resolves arrow key navigation for ltr and rtl", () => {
    expect(resolveArrowAction("ArrowRight", "ltr")).toBe("next");
    expect(resolveArrowAction("ArrowLeft", "ltr")).toBe("prev");
    expect(resolveArrowAction("ArrowRight", "rtl")).toBe("prev");
    expect(resolveArrowAction("ArrowLeft", "rtl")).toBe("next");
    expect(resolveArrowAction("Enter", "ltr")).toBeNull();
  });
});
```

In `packages/core/src/order.test.ts`, update the `buildManifest` expected object to include `direction: "ltr"` and `toc: []`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/core test`
Expected: FAIL because `./extras` and its exports do not exist yet.

- [ ] **Step 3: Implement `packages/core/src/extras.ts` and update `manifest.ts`, `order.ts`, and `index.ts`**

`packages/core/src/extras.ts`:

```ts
import { z } from "zod";

export const bookDirectionSchema = z.enum(["ltr", "rtl"]);
export type BookDirection = z.infer<typeof bookDirectionSchema>;

export const tocItemSchema = z.object({
  title: z.string().min(1),
  page: z.number().int().min(1),
});
export type TocItem = z.infer<typeof tocItemSchema>;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.25;

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return MIN_ZOOM;
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
  return Math.round(clamped * 100) / 100;
}

export function stepZoom(current: number, delta: number): number {
  return clampZoom(current + delta);
}

export function formatPageHash(pageIndex: number): string {
  const pageNumber = Math.max(1, Math.floor(pageIndex) + 1);
  return `#/page/${pageNumber}`;
}

export function parsePageHash(hash: string, totalPages: number): number | null {
  if (totalPages <= 0) return null;
  const match = /^#\/?page\/(\d+)$/i.exec(hash.trim());
  if (!match || !match[1]) return null;
  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed)) return null;
  const zeroBased = parsed - 1;
  return Math.min(totalPages - 1, Math.max(0, zeroBased));
}

export function resolveArrowAction(
  key: string,
  direction: BookDirection = "ltr",
): "next" | "prev" | null {
  if (key === "ArrowRight") {
    return direction === "rtl" ? "prev" : "next";
  }
  if (key === "ArrowLeft") {
    return direction === "rtl" ? "next" : "prev";
  }
  return null;
}
```

Update `packages/core/src/manifest.ts` to import `bookDirectionSchema, tocItemSchema` from `./extras` and add:

```ts
  direction: bookDirectionSchema.default("ltr"),
  toc: z.array(tocItemSchema).default([]),
```

Update `packages/core/src/order.ts` to accept `direction?: BookDirection` and `toc?: readonly TocItem[]` in `BuildManifestOptions` and pass `direction: opts.direction ?? "ltr"` and `toc: opts.toc ? [...opts.toc] : []` in `buildManifest`.

Update `packages/core/src/index.ts` to add `export * from "./extras";`.

- [ ] **Step 4: Run tests, typecheck, and lint**

Run: `pnpm typecheck; pnpm lint; pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/extras.ts packages/core/src/extras.test.ts packages/core/src/manifest.ts packages/core/src/order.ts packages/core/src/order.test.ts packages/core/src/index.ts
git commit -m "feat(core): add RTL direction, TOC schema, zoom math, and page hash helpers"
```

---

## Task 2: `@plif/reader` zoom & RTL in `<Flipbook>` plus `<ReaderToolbar>` (Zoom, TOC, Thumbnails, Slider, Fullscreen)

**Files:**

- Modify: `packages/reader/src/Flipbook.tsx`
- Modify: `packages/reader/src/Flipbook.test.tsx`
- Create: `packages/reader/src/ReaderToolbar.tsx`
- Create: `packages/reader/src/ReaderToolbar.test.tsx`
- Modify: `packages/reader/src/index.ts`

- [ ] **Step 1: Write failing tests in `packages/reader/src/Flipbook.test.tsx` and `packages/reader/src/ReaderToolbar.test.tsx`**

Add to `packages/reader/src/Flipbook.test.tsx`:

- `"reverses arrow keys when manifest.direction is rtl"`
- `"applies CSS scale transform when zoom prop is provided"`

Create `packages/reader/src/ReaderToolbar.test.tsx` testing:

- Page slider (`Go to page`), Prev/Next buttons
- Zoom in / Zoom out / Reset zoom callbacks
- Table of Contents toggle and chapter selection
- Page Thumbnails toggle and thumbnail selection
- Fullscreen toggle callback

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --filter @plif/reader test`
Expected: FAIL.

- [ ] **Step 3: Update `packages/reader/src/Flipbook.tsx`, implement `packages/reader/src/ReaderToolbar.tsx`, and export from `packages/reader/src/index.ts`**

- [ ] **Step 4: Run tests, typecheck, and lint**

Run: `pnpm typecheck; pnpm lint; pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/reader/src/Flipbook.tsx packages/reader/src/Flipbook.test.tsx packages/reader/src/ReaderToolbar.tsx packages/reader/src/ReaderToolbar.test.tsx packages/reader/src/index.ts
git commit -m "feat(reader): add zoom and RTL to Flipbook and ReaderToolbar with TOC and thumbnails"
```

---

## Task 3: `<BookSettingsPanel>` and `<CreatorWizard>` RTL direction & Table of Contents controls

**Files:**

- Modify: `apps/web/src/components/BookSettingsPanel.tsx`
- Modify: `apps/web/src/components/BookSettingsPanel.test.tsx`
- Modify: `apps/web/src/components/CreatorWizard.tsx`
- Modify: `apps/web/src/components/CreatorWizard.test.tsx`

- [ ] **Step 1: Add failing tests in `BookSettingsPanel.test.tsx` and `CreatorWizard.test.tsx`**
- [ ] **Step 2: Run `@plif/web` tests to confirm failure**
- [ ] **Step 3: Implement RTL direction toggle and TOC chapter editor in `BookSettingsPanel.tsx` and forward props in `CreatorWizard.tsx`**
- [ ] **Step 4: Run `pnpm typecheck; pnpm lint; pnpm test`**
- [ ] **Step 5: Commit (`feat(web): add RTL direction and Table of Contents controls to Creator UI`)**

---

## Task 4: Wire `<ReaderToolbar>`, `#/page/N` deep links, Fullscreen API, RTL, and TOC into `App.tsx`

**Files:**

- Modify: `apps/web/src/sample.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Update `apps/web/src/App.test.tsx` to test `<ReaderToolbar>` integration, zoom, TOC, and `#/page/N` hash updates**
- [ ] **Step 2: Run `@plif/web` tests to confirm failure**
- [ ] **Step 3: Update `apps/web/src/sample.ts` and `apps/web/src/App.tsx`**
- [ ] **Step 4: Run `pnpm --filter @plif/web build; pnpm typecheck; pnpm lint; pnpm test`**
- [ ] **Step 5: Commit (`feat(web): integrate ReaderToolbar, deep-link hashes, fullscreen, RTL, and TOC in App`)**
