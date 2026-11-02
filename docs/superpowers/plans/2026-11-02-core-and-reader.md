# Core + Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a validated book manifest (`@plif/core`) and a React `<Flipbook>` (`@plif/reader`) that renders it with cover, single/double-page, keyboard and touch support, plus a demo app to see it work.

**Architecture:** `@plif/core` holds pure, framework-free logic (manifest schema, visible-page math). `@plif/reader` maps a manifest to StPageFlip settings (pure, tested) and wraps `page-flip` in a thin React component (tested with the engine mocked). `apps/web` is a minimal Vite demo used for visual verification only.

**Tech Stack:** TypeScript (strict), pnpm workspaces, Zod 3, `page-flip` (StPageFlip, MIT), React 18, Vite 5, Vitest 2, jsdom, Testing Library.

**Spec:** `C:\Users\Janre\.gemini\antigravity\brain\ec70a09d-b2a6-4595-a66e-a10874bc687f\implementation_plan.md` (sections 1–2). Reference implementation: `C:\Users\Janre\Desktop\Documents\test-claude\Portfolio\src\components\sections\SchoolPaperFlipbook.tsx`.

## Global Constraints

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- TypeScript `strict` and `noUncheckedIndexedAccess` (from `tsconfig.base.json`).
- Conventional Commits, enforced by commitlint (e.g. `feat(core): ...`). One commit per task.
- Every task must leave `pnpm typecheck && pnpm lint && pnpm test` green.
- Run commands from the repo root `c:\Users\Janre\Desktop\Documents\GitHub\plif`.
- Respect `prefers-reduced-motion`: reduced motion means `flippingTime: 1` and no shadows.
- RTL, zoom, deep links and TOC are out of scope (a later plan). Do not add placeholder fields for them.

## File Structure

| Path                               | Responsibility                               |
| ---------------------------------- | -------------------------------------------- |
| `packages/core/src/manifest.ts`    | Zod schema, `Manifest` type, `parseManifest` |
| `packages/core/src/pages.ts`       | `visiblePages`, `formatPageLabel`            |
| `packages/core/src/index.ts`       | Public exports                               |
| `packages/reader/src/settings.ts`  | `toFlipSettings(manifest, opts)`             |
| `packages/reader/src/Flipbook.tsx` | React component + `FlipbookHandle`           |
| `packages/reader/src/index.ts`     | Public exports                               |
| `apps/web/*`                       | Demo app (visual check only)                 |

---

### Task 1: Manifest schema

**Files:**

- Modify: `packages/core/package.json`
- Create: `packages/core/src/manifest.ts`
- Test: `packages/core/src/manifest.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `type Manifest = { version: 1; title: string; pageSize: { width: number; height: number }; hasCover: boolean; pages: { src: string; alt?: string; density?: "hard" | "soft" }[] }`
  - `parseManifest(input: unknown): Manifest` (throws `ZodError` when invalid; `hasCover` defaults to `true`).

- [ ] **Step 1: Add zod**

Run: `pnpm --filter @plif/core add zod@^3.23.0`
Expected: `zod` appears under `dependencies` in `packages/core/package.json`.

- [ ] **Step 2: Write the failing test**

`packages/core/src/manifest.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseManifest } from "./manifest";

const valid = {
  version: 1,
  title: "My Book",
  pageSize: { width: 480, height: 679 },
  pages: [{ src: "a.webp" }, { src: "b.webp", density: "hard" }],
};

describe("parseManifest", () => {
  it("accepts a valid manifest and defaults hasCover to true", () => {
    const m = parseManifest(valid);
    expect(m.hasCover).toBe(true);
    expect(m.pages).toHaveLength(2);
  });

  it("rejects an empty page list", () => {
    expect(() => parseManifest({ ...valid, pages: [] })).toThrow();
  });

  it("rejects a non-positive page size", () => {
    expect(() => parseManifest({ ...valid, pageSize: { width: 0, height: 10 } })).toThrow();
  });

  it("rejects an unknown density", () => {
    expect(() => parseManifest({ ...valid, pages: [{ src: "a", density: "mushy" }] })).toThrow();
  });

  it("rejects an unsupported version", () => {
    expect(() => parseManifest({ ...valid, version: 2 })).toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @plif/core test`
Expected: FAIL (cannot resolve `./manifest`).

- [ ] **Step 4: Write minimal implementation**

`packages/core/src/manifest.ts`:

```ts
import { z } from "zod";

export const pageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional(),
  density: z.enum(["hard", "soft"]).optional(),
});

export const manifestSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1),
  pageSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  hasCover: z.boolean().default(true),
  pages: z.array(pageSchema).min(1),
});

export type Manifest = z.infer<typeof manifestSchema>;

export function parseManifest(input: unknown): Manifest {
  return manifestSchema.parse(input);
}
```

`packages/core/src/index.ts` (replace contents):

```ts
export const PROJECT_NAME = "plif";
export * from "./manifest";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @plif/core test`
Expected: PASS (6 tests: 5 new, 1 existing smoke test).

- [ ] **Step 6: Commit**

```bash
git add packages/core pnpm-lock.yaml
git commit -m "feat(core): add validated book manifest schema"
```

---

### Task 2: Visible pages and page label

StPageFlip reports the index of the left page of the current spread. With `showCover`, page 0 is shown alone, then spreads are (1,2), (3,4)... and a final even-indexed page is shown alone.

**Files:**

- Create: `packages/core/src/pages.ts`
- Test: `packages/core/src/pages.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `visiblePages(index: number, total: number, hasCover: boolean, portrait: boolean): number[]` returns zero-based indices.
  - `formatPageLabel(index: number, total: number, hasCover: boolean, portrait: boolean): string` returns `"1 / 12"` or `"2–3 / 12"` (en dash).

- [ ] **Step 1: Write the failing test**

`packages/core/src/pages.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatPageLabel, visiblePages } from "./pages";

describe("visiblePages", () => {
  it("shows the cover alone", () => {
    expect(visiblePages(0, 12, true, false)).toEqual([0]);
  });

  it("shows a pair in the middle", () => {
    expect(visiblePages(1, 12, true, false)).toEqual([1, 2]);
    expect(visiblePages(9, 12, true, false)).toEqual([9, 10]);
  });

  it("shows the back cover alone when total is even", () => {
    expect(visiblePages(11, 12, true, false)).toEqual([11]);
  });

  it("shows the last pair when total is odd", () => {
    expect(visiblePages(9, 11, true, false)).toEqual([9, 10]);
  });

  it("pairs from index 0 without a cover", () => {
    expect(visiblePages(0, 4, false, false)).toEqual([0, 1]);
  });

  it("always shows one page in portrait mode", () => {
    expect(visiblePages(5, 12, true, true)).toEqual([5]);
  });
});

describe("formatPageLabel", () => {
  it("formats single pages", () => {
    expect(formatPageLabel(0, 12, true, false)).toBe("1 / 12");
  });

  it("formats spreads with an en dash", () => {
    expect(formatPageLabel(1, 12, true, false)).toBe("2–3 / 12");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/core test`
Expected: FAIL (cannot resolve `./pages`).

- [ ] **Step 3: Write minimal implementation**

`packages/core/src/pages.ts`:

```ts
export function visiblePages(
  index: number,
  total: number,
  hasCover: boolean,
  portrait: boolean,
): number[] {
  if (portrait) return [index];
  if (hasCover && index === 0) return [0];
  if (index + 1 < total) return [index, index + 1];
  return [index];
}

export function formatPageLabel(
  index: number,
  total: number,
  hasCover: boolean,
  portrait: boolean,
): string {
  const pages = visiblePages(index, total, hasCover, portrait).map((i) => i + 1);
  const first = pages[0];
  const last = pages[pages.length - 1];
  const range = first === last ? `${first}` : `${first}–${last}`;
  return `${range} / ${total}`;
}
```

`packages/core/src/index.ts` (append):

```ts
export * from "./pages";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @plif/core test`
Expected: PASS (all core tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core
git commit -m "feat(core): compute visible pages and page label"
```

---

### Task 3: Reader package, settings mapping

**Files:**

- Create: `packages/reader/package.json`, `packages/reader/tsconfig.json`, `packages/reader/vitest.config.ts`
- Create: `packages/reader/src/settings.ts`, `packages/reader/src/index.ts`
- Test: `packages/reader/src/settings.test.ts`

**Interfaces:**

- Consumes: `Manifest` from `@plif/core`.
- Produces:
  - `toFlipSettings(manifest: Manifest, opts: { reduceMotion: boolean }): FlipSettings` where `FlipSettings` is a plain object with keys `width`, `height`, `size`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `showCover`, `usePortrait`, `drawShadow`, `flippingTime`, `maxShadowOpacity`, `mobileScrollSupport`, `swipeDistance`.

- [ ] **Step 1: Create the package**

`packages/reader/package.json`:

```json
{
  "name": "@plif/reader",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

`packages/reader/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "jsx": "react-jsx", "types": ["vitest/globals"] },
  "include": ["src", "vitest.config.ts"]
}
```

`packages/reader/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "jsdom", globals: true },
});
```

Run:

```bash
pnpm --filter @plif/reader add @plif/core@workspace:* page-flip
pnpm --filter @plif/reader add -D react@^18.3.0 react-dom@^18.3.0 @types/react@^18.3.0 @types/react-dom@^18.3.0 vitest@^2.0.0 jsdom@^25.0.0 @testing-library/react@^16.0.0 @testing-library/dom@^10.0.0
```

Expected: `pnpm install` succeeds and `git status` shows an updated `pnpm-lock.yaml`.

- [ ] **Step 2: Write the failing test**

`packages/reader/src/settings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseManifest } from "@plif/core";
import { toFlipSettings } from "./settings";

const manifest = parseManifest({
  version: 1,
  title: "T",
  pageSize: { width: 480, height: 679 },
  pages: [{ src: "a" }, { src: "b" }],
});

describe("toFlipSettings", () => {
  it("maps page size and responsive bounds", () => {
    const s = toFlipSettings(manifest, { reduceMotion: false });
    expect(s).toMatchObject({
      width: 480,
      height: 679,
      size: "stretch",
      maxWidth: 480,
      maxHeight: 679,
      minWidth: 288,
      minHeight: 407,
      showCover: true,
      usePortrait: true,
    });
  });

  it("animates with shadows by default", () => {
    const s = toFlipSettings(manifest, { reduceMotion: false });
    expect(s.flippingTime).toBe(700);
    expect(s.drawShadow).toBe(true);
  });

  it("disables animation and shadows for reduced motion", () => {
    const s = toFlipSettings(manifest, { reduceMotion: true });
    expect(s.flippingTime).toBe(1);
    expect(s.drawShadow).toBe(false);
  });

  it("respects hasCover=false", () => {
    const s = toFlipSettings({ ...manifest, hasCover: false }, { reduceMotion: false });
    expect(s.showCover).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @plif/reader test`
Expected: FAIL (cannot resolve `./settings`).

- [ ] **Step 4: Write minimal implementation**

`packages/reader/src/settings.ts`:

```ts
import type { Manifest } from "@plif/core";

export interface FlipSettings {
  width: number;
  height: number;
  size: "stretch";
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  showCover: boolean;
  usePortrait: boolean;
  drawShadow: boolean;
  flippingTime: number;
  maxShadowOpacity: number;
  mobileScrollSupport: boolean;
  swipeDistance: number;
}

export function toFlipSettings(manifest: Manifest, opts: { reduceMotion: boolean }): FlipSettings {
  const { width, height } = manifest.pageSize;
  return {
    width,
    height,
    size: "stretch",
    minWidth: Math.round(width * 0.6),
    maxWidth: width,
    minHeight: Math.round(height * 0.6),
    maxHeight: height,
    showCover: manifest.hasCover,
    usePortrait: true,
    drawShadow: !opts.reduceMotion,
    flippingTime: opts.reduceMotion ? 1 : 700,
    maxShadowOpacity: 0.35,
    mobileScrollSupport: true,
    swipeDistance: 24,
  };
}
```

`packages/reader/src/index.ts`:

```ts
export * from "./settings";
```

- [ ] **Step 5: Run tests, typecheck and lint**

Run: `pnpm --filter @plif/reader test; pnpm typecheck; pnpm lint`
Expected: all PASS. (If Prettier complains, run `pnpm format` and re-run.)

- [ ] **Step 6: Commit**

```bash
git add packages/reader pnpm-lock.yaml
git commit -m "feat(reader): map manifest to StPageFlip settings"
```

---

### Task 4: `<Flipbook>` component

`PageFlip.destroy()` removes the root element it was given from the DOM. To keep React's DOM intact, the component creates an inner `host` div imperatively and hands that to StPageFlip.

**Files:**

- Create: `packages/reader/src/Flipbook.tsx`
- Test: `packages/reader/src/Flipbook.test.tsx`
- Modify: `packages/reader/src/index.ts`

**Interfaces:**

- Consumes: `Manifest` and `visiblePages` from `@plif/core`; `toFlipSettings` from `./settings`; `PageFlip` from `page-flip`.
- Produces:
  - `interface FlipbookHandle { next(): void; prev(): void; goTo(index: number): void }`
  - `<Flipbook manifest: Manifest; onPageChange?: (index: number) => void; reduceMotion?: boolean; className?: string; ref?: Ref<FlipbookHandle> />` (a `forwardRef` component)
  - ArrowRight and ArrowLeft on the wrapper call `next()` and `prev()`; the wrapper has `tabIndex={0}` and `role="region"` with `aria-label={manifest.title}`.

- [ ] **Step 1: Write the failing test**

`packages/reader/src/Flipbook.test.tsx`:

```tsx
import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseManifest } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "./Flipbook";

const instance = {
  loadFromImages: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn(),
  flipNext: vi.fn(),
  flipPrev: vi.fn(),
  flip: vi.fn(),
  getPage: vi.fn(() => ({ setDensity: vi.fn() })),
};
const PageFlipMock = vi.fn(() => instance);
vi.mock("page-flip", () => ({ PageFlip: PageFlipMock }));

const manifest = parseManifest({
  version: 1,
  title: "T",
  pageSize: { width: 480, height: 679 },
  pages: [{ src: "a.webp" }, { src: "b.webp", density: "hard" }],
});

beforeEach(() => vi.clearAllMocks());

describe("<Flipbook>", () => {
  it("creates the engine and loads page images", () => {
    render(<Flipbook manifest={manifest} />);
    expect(PageFlipMock).toHaveBeenCalledTimes(1);
    expect(instance.loadFromImages).toHaveBeenCalledWith(["a.webp", "b.webp"]);
  });

  it("applies per-page density from the manifest", () => {
    const setDensity = vi.fn();
    instance.getPage.mockReturnValue({ setDensity });
    render(<Flipbook manifest={manifest} />);
    expect(instance.getPage).toHaveBeenCalledWith(1);
    expect(setDensity).toHaveBeenCalledWith("hard");
  });

  it("reports page changes", () => {
    const onPageChange = vi.fn();
    render(<Flipbook manifest={manifest} onPageChange={onPageChange} />);
    const call = instance.on.mock.calls.find(([name]) => name === "flip");
    call?.[1]({ data: 1 });
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("destroys the engine on unmount", () => {
    const { unmount } = render(<Flipbook manifest={manifest} />);
    unmount();
    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });

  it("flips with arrow keys", () => {
    const { getByRole } = render(<Flipbook manifest={manifest} />);
    const region = getByRole("region", { name: "T" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(instance.flipNext).toHaveBeenCalledTimes(1);
    expect(instance.flipPrev).toHaveBeenCalledTimes(1);
  });

  it("exposes an imperative handle", () => {
    const ref = createRef<FlipbookHandle>();
    render(<Flipbook ref={ref} manifest={manifest} />);
    ref.current?.next();
    ref.current?.prev();
    ref.current?.goTo(3);
    expect(instance.flipNext).toHaveBeenCalled();
    expect(instance.flipPrev).toHaveBeenCalled();
    expect(instance.flip).toHaveBeenCalledWith(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/reader test`
Expected: FAIL (cannot resolve `./Flipbook`).

- [ ] **Step 3: Write minimal implementation**

`packages/reader/src/Flipbook.tsx`:

```tsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { KeyboardEvent } from "react";
import { PageFlip } from "page-flip";
import type { Manifest } from "@plif/core";
import { toFlipSettings } from "./settings";

export interface FlipbookHandle {
  next(): void;
  prev(): void;
  goTo(index: number): void;
}

export interface FlipbookProps {
  manifest: Manifest;
  onPageChange?: (index: number) => void;
  reduceMotion?: boolean;
  className?: string;
}

export const Flipbook = forwardRef<FlipbookHandle, FlipbookProps>(function Flipbook(
  { manifest, onPageChange, reduceMotion = false, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // PageFlip.destroy() removes its root element, so give it a node React doesn't own.
    const host = document.createElement("div");
    container.appendChild(host);

    const flip = new PageFlip(host, toFlipSettings(manifest, { reduceMotion }));
    flip.loadFromImages(manifest.pages.map((p) => p.src));
    manifest.pages.forEach((page, i) => {
      if (page.density) flip.getPage(i)?.setDensity(page.density);
    });
    flip.on("flip", (e) => onPageChangeRef.current?.(e.data as number));
    flipRef.current = flip;

    return () => {
      flip.destroy();
      flipRef.current = null;
    };
  }, [manifest, reduceMotion]);

  useImperativeHandle(ref, () => ({
    next: () => flipRef.current?.flipNext(),
    prev: () => flipRef.current?.flipPrev(),
    goTo: (index) => flipRef.current?.flip(index),
  }));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") flipRef.current?.flipNext();
    if (e.key === "ArrowLeft") flipRef.current?.flipPrev();
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={manifest.title}
      tabIndex={0}
      className={className}
      onKeyDown={onKeyDown}
    />
  );
});
```

`packages/reader/src/index.ts` (append):

```ts
export * from "./Flipbook";
```

- [ ] **Step 4: Run tests, typecheck and lint**

Run: `pnpm --filter @plif/reader test; pnpm typecheck; pnpm lint`
Expected: all PASS. If TypeScript cannot find types for `page-flip`, add `declare module "page-flip";` in `packages/reader/src/page-flip.d.ts`, then re-run (package ships its own types in most versions, so this is only a fallback).

- [ ] **Step 5: Commit**

```bash
git add packages/reader
git commit -m "feat(reader): add Flipbook React component"
```

---

### Task 5: Demo app (visual verification)

The unit tests mock the engine, so this task is where the real page-turn is verified in a browser.

**Files:**

- Create: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`, `apps/web/index.html`
- Create: `apps/web/src/main.tsx`, `apps/web/src/sample.ts`, `apps/web/src/App.tsx`

**Interfaces:**

- Consumes: `Flipbook`, `FlipbookHandle` from `@plif/reader`; `parseManifest`, `formatPageLabel` from `@plif/core`.
- Produces: a runnable demo (`pnpm --filter @plif/web dev`).

- [ ] **Step 1: Create the app files**

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
    "typecheck": "tsc --noEmit"
  }
}
```

`apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "jsx": "react-jsx" },
  "include": ["src", "vite.config.ts"]
}
```

`apps/web/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });
```

`apps/web/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Plif demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/web/src/sample.ts`:

```ts
import { parseManifest } from "@plif/core";

function samplePage(n: number, total: number): string {
  const cover = n === 1 || n === total;
  const bg = cover ? "#1f2937" : "#fffdf7";
  const fg = cover ? "#f9fafb" : "#111827";
  const label = n === 1 ? "COVER" : n === total ? "BACK" : `Page ${n}`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="679">` +
    `<rect width="480" height="679" fill="${bg}"/>` +
    `<text x="240" y="340" font-size="48" text-anchor="middle" fill="${fg}" font-family="Georgia">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const TOTAL = 12;

export const sampleManifest = parseManifest({
  version: 1,
  title: "Sample Magazine",
  pageSize: { width: 480, height: 679 },
  pages: Array.from({ length: TOTAL }, (_, i) => ({
    src: samplePage(i + 1, TOTAL),
    alt: `Page ${i + 1}`,
  })),
});
```

`apps/web/src/App.tsx`:

```tsx
import { useRef, useState } from "react";
import { formatPageLabel } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "@plif/reader";
import { sampleManifest } from "./sample";

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const [index, setIndex] = useState(0);
  const total = sampleManifest.pages.length;

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", gap: 16 }}>
      <Flipbook ref={book} manifest={sampleManifest} onPageChange={setIndex} />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => book.current?.prev()}>Previous</button>
        <span>{formatPageLabel(index, total, sampleManifest.hasCover, false)}</span>
        <button onClick={() => book.current?.next()}>Next</button>
      </div>
    </main>
  );
}
```

`apps/web/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Run:

```bash
pnpm --filter @plif/web add react@^18.3.0 react-dom@^18.3.0 @plif/core@workspace:* @plif/reader@workspace:*
pnpm --filter @plif/web add -D vite@^5.4.0 @vitejs/plugin-react@^4.3.0 @types/react@^18.3.0 @types/react-dom@^18.3.0
```

- [ ] **Step 2: Build and typecheck**

Run: `pnpm --filter @plif/web build; pnpm typecheck; pnpm lint; pnpm test`
Expected: all succeed; Vite prints a `dist/` summary.

- [ ] **Step 3: Visual verification in a browser**

Run: `pnpm --filter @plif/web dev` and open the printed URL.
Expected (check each):

- The cover shows alone (centered), with a hard-cover feel.
- Clicking Next or dragging the page corner turns it with a curl and shadow, then shows a two-page spread labeled `2–3 / 12`.
- The last page (`BACK`) shows alone.
- Narrowing the browser below the book's two-page width switches to single-page mode.
- ArrowLeft and ArrowRight keys turn pages after clicking the book once to focus it.
- No console errors, including under React StrictMode (double mount).

If any item fails, stop and debug with superpowers:systematic-debugging before continuing.

- [ ] **Step 4: Commit**

```bash
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): add demo app for visual flipbook verification"
```

---

## Self-Review

- **Spec coverage:** cover mode (`showCover`, Task 3), single vs double page (`usePortrait`, Tasks 3 and 5), hard/soft density (Task 4), keyboard (Task 4), touch (`mobileScrollSupport` and `swipeDistance`, Task 3, verified in Task 5), reduced motion (Task 3), manifest as the shared contract (Task 1), and page label for the UI (Task 2). Zoom, deep links, TOC, RTL and thumbnails are deliberately deferred to Plan 5.
- **Placeholder scan:** no TBD/TODO; every step has code or an exact command.
- **Type consistency:** `Manifest` fields (`pageSize`, `hasCover`, `pages[].density`) match across Tasks 1, 3, 4 and 5; `visiblePages` and `formatPageLabel` signatures match between Task 2 and Task 5; `FlipbookHandle` methods match between Task 4 and Task 5.
- **Known risk:** the `page-flip` typings (`on("flip", (e) => e.data)`) may differ slightly from the assumed shape. The Task 4 fallback declaration covers a missing-types case. If `e.data` is typed differently, adjust the cast in Task 4 only.
