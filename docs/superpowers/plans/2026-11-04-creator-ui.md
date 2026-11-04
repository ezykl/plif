# Creator UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a non-coder Creator UI featuring a 3-step wizard (`1. Upload` -> `2. Arrange & Style` -> `3. Preview & Publish`), one-click book presets (Newspaper, Magazine, Hardcover Book, Studio Zine), cover and bulk page-density controls, visual themes, and a themed live `<Flipbook>` preview stage.

**Architecture:** `@plif/core` defines theme tokens (`BookTheme`, `THEMES`), book presets (`BookPresetId`, `BOOK_PRESETS`), and pure bulk-density/preset helpers (`applyBulkDensity`, `applyBookPreset`), while extending `manifestSchema` and `buildManifest` with an optional `theme` field (defaulting to `"magazine"`). `@plif/web` adds `<BookSettingsPanel>` (title, presets, cover toggle, bulk density, theme selector) and `<CreatorWizard>` (3-step guided workflow) wired to a themed live `<Flipbook>` stage in `App.tsx`.

**Tech Stack:** TypeScript (strict), pnpm workspaces, Zod 3, React 18, Vite 5, Vitest 2, jsdom, Testing Library.

**Spec:** `C:\Users\Janre\.gemini\antigravity\brain\ec70a09d-b2a6-4595-a66e-a10874bc687f\implementation_plan.md` (sections 2–3, Plan 4) and reference `C:\Users\Janre\Desktop\Documents\test-claude\Portfolio\src\components\sections\SchoolPaperFlipbook.tsx`.

## Global Constraints

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Do NOT add `pdfjs-dist` to `@plif/core` or `@plif/reader`.
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- TypeScript `strict` and `noUncheckedIndexedAccess` (from `tsconfig.base.json`).
- Conventional Commits, enforced by commitlint (e.g. `feat(core): ...`, `feat(web): ...`). One commit per task.
- Every task must leave `pnpm typecheck && pnpm lint && pnpm test` green.
- Run commands from the repo root `c:\Users\Janre\Desktop\Documents\GitHub\plif`.
- Design for the non-coder: 3-step wizard (`Upload` -> `Arrange & Style` -> `Preview & Publish`), live preview, and no raw JSON exposed to the user.

## File Structure

| Path                                                 | Responsibility                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `packages/core/src/themes.ts`                        | `BookTheme`, `ThemeTokens`, `THEMES`, `BulkDensityMode`, `applyBulkDensity`, `BookPresetId`, `BOOK_PRESETS`, `applyBookPreset` |
| `packages/core/src/themes.test.ts`                   | Unit tests for themes, bulk density, and book presets                                                                          |
| `packages/core/src/manifest.ts`                      | Add `themeSchema` and `theme: themeSchema.default("magazine")` to `manifestSchema`                                             |
| `packages/core/src/order.ts`                         | Add `theme?: BookTheme` to `BuildManifestOptions` and `buildManifest`                                                          |
| `packages/core/src/index.ts`                         | Re-export `./themes`                                                                                                           |
| `apps/web/src/components/BookSettingsPanel.tsx`      | Accessible controls for book title, presets, `hasCover`, bulk density, and theme                                               |
| `apps/web/src/components/BookSettingsPanel.test.tsx` | Component tests for `<BookSettingsPanel>`                                                                                      |
| `apps/web/src/components/CreatorWizard.tsx`          | 3-step wizard (`Upload` -> `Arrange & Style` -> `Preview & Publish`)                                                           |
| `apps/web/src/components/CreatorWizard.test.tsx`     | Component tests for `<CreatorWizard>` step navigation and actions                                                              |
| `apps/web/src/App.tsx`                               | Full Creator Studio layout combining `<CreatorWizard>` and themed live `<Flipbook>` stage                                      |
| `apps/web/src/App.test.tsx`                          | Integration test for `App.tsx` wizard + live preview                                                                           |

---

### Task 1: Themes, book presets, and bulk density helpers in `@plif/core`

**Files:**

- Create: `packages/core/src/themes.ts`
- Test: `packages/core/src/themes.test.ts`
- Modify: `packages/core/src/manifest.ts`
- Modify: `packages/core/src/order.ts`
- Modify: `packages/core/src/order.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**

- Consumes:
  - `type ImportedPage` from `packages/core/src/order.ts`
- Produces:
  - `export const bookThemeSchema = z.enum(["newsprint", "magazine", "classic", "studio"])`
  - `export type BookTheme = z.infer<typeof bookThemeSchema>`
  - `export interface ThemeTokens { id: BookTheme; label: string; description: string; stageBg: string; headerBg: string; textColor: string; accentColor: string }`
  - `export const THEMES: Record<BookTheme, ThemeTokens>`
  - `export type BulkDensityMode = "all-soft" | "hard-covers" | "all-hard"`
  - `export function applyBulkDensity(pages: readonly ImportedPage[], mode: BulkDensityMode): ImportedPage[]`
  - `export type BookPresetId = "newspaper" | "magazine" | "hardcover" | "zine"`
  - `export interface BookPreset { id: BookPresetId; label: string; description: string; hasCover: boolean; densityMode: BulkDensityMode; theme: BookTheme }`
  - `export const BOOK_PRESETS: Record<BookPresetId, BookPreset>`
  - `export function applyBookPreset(presetId: BookPresetId, pages: readonly ImportedPage[]): { hasCover: boolean; theme: BookTheme; pages: ImportedPage[] }`
  - `Manifest.theme: BookTheme` (defaults to `"magazine"` in `manifestSchema` and `buildManifest`)

- [ ] **Step 1: Write the failing test**

`packages/core/src/themes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { ImportedPage } from "./order";
import { applyBookPreset, applyBulkDensity, BOOK_PRESETS, THEMES } from "./themes";
import { parseManifest } from "./manifest";
import { buildManifest } from "./order";

const samplePages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 480, height: 679, alt: "Page 1" },
  { id: "p2", src: "blob:2", width: 480, height: 679, alt: "Page 2" },
  { id: "p3", src: "blob:3", width: 480, height: 679, alt: "Page 3" },
  { id: "p4", src: "blob:4", width: 480, height: 679, alt: "Page 4" },
];

describe("THEMES and manifest theme support", () => {
  it("defines tokens for newsprint, magazine, classic, and studio", () => {
    expect(Object.keys(THEMES)).toEqual(["newsprint", "magazine", "classic", "studio"]);
  });

  it("defaults manifest.theme to magazine and accepts valid themes", () => {
    const m1 = parseManifest({
      version: 1,
      title: "Default Theme",
      pageSize: { width: 480, height: 679 },
      pages: [{ src: "a.webp" }],
    });
    expect(m1.theme).toBe("magazine");

    const m2 = buildManifest({
      title: "Campus Paper",
      theme: "newsprint",
      pages: samplePages,
    });
    expect(m2.theme).toBe("newsprint");
  });
});

describe("applyBulkDensity", () => {
  it("sets all pages to soft in all-soft mode", () => {
    const pages = applyBulkDensity(samplePages, "all-soft");
    expect(pages.map((p) => p.density)).toEqual(["soft", "soft", "soft", "soft"]);
  });

  it("sets first and last page to hard and inner pages to soft in hard-covers mode", () => {
    const pages = applyBulkDensity(samplePages, "hard-covers");
    expect(pages.map((p) => p.density)).toEqual(["hard", "soft", "soft", "hard"]);
  });

  it("sets all pages to hard in all-hard mode", () => {
    const pages = applyBulkDensity(samplePages, "all-hard");
    expect(pages.map((p) => p.density)).toEqual(["hard", "hard", "hard", "hard"]);
  });
});

describe("applyBookPreset", () => {
  it("configures newspaper preset as coverless, all-soft, newsprint theme", () => {
    const res = applyBookPreset("newspaper", samplePages);
    expect(res.hasCover).toBe(false);
    expect(res.theme).toBe("newsprint");
    expect(res.pages.map((p) => p.density)).toEqual(["soft", "soft", "soft", "soft"]);
  });

  it("configures hardcover preset with cover, hard front/back, classic theme", () => {
    expect(BOOK_PRESETS.hardcover.label).toBe("Hardcover Book");
    const res = applyBookPreset("hardcover", samplePages);
    expect(res.hasCover).toBe(true);
    expect(res.theme).toBe("classic");
    expect(res.pages.map((p) => p.density)).toEqual(["hard", "soft", "soft", "hard"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/core test`
Expected: FAIL (cannot resolve `./themes`).

- [ ] **Step 3: Implement `themes.ts` and update `manifest.ts`, `order.ts`, `order.test.ts`, and `index.ts`**

`packages/core/src/themes.ts`:

```ts
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
}

export const THEMES: Record<BookTheme, ThemeTokens> = {
  newsprint: {
    id: "newsprint",
    label: "Newsprint",
    description: "Warm paper backdrop for newspapers and campus broadsheets",
    stageBg: "#f5f2eb",
    headerBg: "#292524",
    textColor: "#1c1917",
    accentColor: "#b45309",
  },
  magazine: {
    id: "magazine",
    label: "Magazine",
    description: "Rich espresso stage inspired by editorial magazine spreads",
    stageBg: "#1c1613",
    headerBg: "#2b211c",
    textColor: "#f5f5f4",
    accentColor: "#d97706",
  },
  classic: {
    id: "classic",
    label: "Classic Library",
    description: "Deep parchment and walnut tones for hardcover books",
    stageBg: "#27201c",
    headerBg: "#1c1613",
    textColor: "#fef3c7",
    accentColor: "#f59e0b",
  },
  studio: {
    id: "studio",
    label: "Dark Studio",
    description: "Neutral slate canvas for portfolios, lookbooks, and zines",
    stageBg: "#0f172a",
    headerBg: "#1e293b",
    textColor: "#f8fafc",
    accentColor: "#38bdf8",
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
    description: "Soft paper pages from page 1, no stiff cover",
    hasCover: false,
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
```

Update `packages/core/src/manifest.ts`:

```ts
import { z } from "zod";
import { bookThemeSchema } from "./themes";

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
  theme: bookThemeSchema.default("magazine"),
  pages: z.array(pageSchema).min(1),
});

export type Manifest = z.infer<typeof manifestSchema>;

export function parseManifest(input: unknown): Manifest {
  return manifestSchema.parse(input);
}
```

Update `packages/core/src/order.ts`:

```ts
import { parseManifest, type Manifest } from "./manifest";
import type { BookTheme } from "./themes";

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
    theme: opts.theme ?? "magazine",
    pages: opts.pages.map((p) => ({
      src: p.src,
      ...(p.alt !== undefined ? { alt: p.alt } : {}),
      ...(p.density !== undefined ? { density: p.density } : {}),
    })),
  });
}
```

Update `packages/core/src/order.test.ts` (include `theme: "magazine"` in the `toEqual` expectation in `buildManifest` test):

```ts
expect(manifest).toEqual({
  version: 1,
  title: "Campus Issue",
  pageSize: { width: 600, height: 800 },
  hasCover: true,
  theme: "magazine",
  pages: [
    { src: "blob:1", alt: "Page 1", density: "hard" },
    { src: "blob:2", alt: "Page 2" },
    { src: "blob:3", alt: "Page 3" },
  ],
});
```

Update `packages/core/src/index.ts`:

```ts
export const PROJECT_NAME = "plif";
export * from "./manifest";
export * from "./pages";
export * from "./order";
export * from "./themes";
```

- [ ] **Step 4: Run tests, typecheck, and lint**

Run: `pnpm --filter @plif/core test && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/themes.ts packages/core/src/themes.test.ts packages/core/src/manifest.ts packages/core/src/order.ts packages/core/src/order.test.ts packages/core/src/index.ts
git commit -m "feat(core): add book themes, presets, and bulk density helpers"
```

---

### Task 2: `<BookSettingsPanel>` for title, presets, cover mode, bulk density, and theme

**Files:**

- Create: `apps/web/src/components/BookSettingsPanel.tsx`
- Test: `apps/web/src/components/BookSettingsPanel.test.tsx`

**Interfaces:**

- Consumes:
  - `BOOK_PRESETS`, `THEMES`, `type BookPresetId`, `type BookTheme`, `type BulkDensityMode` from `@plif/core`
- Produces:
  - `export interface BookSettingsPanelProps { title: string; hasCover: boolean; theme: BookTheme; onChangeTitle: (title: string) => void; onChangeHasCover: (hasCover: boolean) => void; onChangeTheme: (theme: BookTheme) => void; onSelectPreset: (presetId: BookPresetId) => void; onApplyBulkDensity: (mode: BulkDensityMode) => void }`
  - `export function BookSettingsPanel(props: BookSettingsPanelProps): JSX.Element`

- [ ] **Step 1: Write the failing test**

`apps/web/src/components/BookSettingsPanel.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookSettingsPanel } from "./BookSettingsPanel";

afterEach(() => cleanup());

describe("<BookSettingsPanel>", () => {
  it("updates book title and toggles standalone cover mode", () => {
    const onChangeTitle = vi.fn();
    const onChangeHasCover = vi.fn();

    render(
      <BookSettingsPanel
        title="Campus Paper"
        hasCover={true}
        theme="magazine"
        onChangeTitle={onChangeTitle}
        onChangeHasCover={onChangeHasCover}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Book title"), {
      target: { value: "Spring Edition" },
    });
    expect(onChangeTitle).toHaveBeenCalledWith("Spring Edition");

    fireEvent.click(screen.getByLabelText(/standalone front & back cover/i));
    expect(onChangeHasCover).toHaveBeenCalledWith(false);
  });

  it("triggers preset selection, bulk density actions, and theme selection", () => {
    const onSelectPreset = vi.fn();
    const onApplyBulkDensity = vi.fn();
    const onChangeTheme = vi.fn();

    render(
      <BookSettingsPanel
        title="Campus Paper"
        hasCover={true}
        theme="magazine"
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={onChangeTheme}
        onSelectPreset={onSelectPreset}
        onApplyBulkDensity={onApplyBulkDensity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Preset: Newspaper/i }));
    expect(onSelectPreset).toHaveBeenCalledWith("newspaper");

    fireEvent.click(screen.getByRole("button", { name: "Hard Front & Back Cover" }));
    expect(onApplyBulkDensity).toHaveBeenCalledWith("hard-covers");

    fireEvent.click(screen.getByRole("button", { name: /Theme: Newsprint/i }));
    expect(onChangeTheme).toHaveBeenCalledWith("newsprint");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/web test`
Expected: FAIL (cannot resolve `./BookSettingsPanel`).

- [ ] **Step 3: Write minimal implementation**

`apps/web/src/components/BookSettingsPanel.tsx`:

```tsx
import {
  BOOK_PRESETS,
  THEMES,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
} from "@plif/core";

export interface BookSettingsPanelProps {
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  onChangeTitle: (title: string) => void;
  onChangeHasCover: (hasCover: boolean) => void;
  onChangeTheme: (theme: BookTheme) => void;
  onSelectPreset: (presetId: BookPresetId) => void;
  onApplyBulkDensity: (mode: BulkDensityMode) => void;
}

const PRESET_LIST = Object.values(BOOK_PRESETS);
const THEME_LIST = Object.values(THEMES);

export function BookSettingsPanel({
  title,
  hasCover,
  theme,
  onChangeTitle,
  onChangeHasCover,
  onChangeTheme,
  onSelectPreset,
  onApplyBulkDensity,
}: BookSettingsPanelProps) {
  return (
    <section
      aria-label="Book style and cover settings"
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 16,
        padding: 16,
        border: "1px solid #d6d3d1",
        borderRadius: 8,
        background: "#fafaf9",
        color: "#1c1917",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label style={{ display: "grid", gap: 4, flex: "1 1 260px" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Book title</span>
          <input
            type="text"
            aria-label="Book title"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Untitled Book"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #a8a29e",
              fontSize: 14,
            }}
          />
        </label>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={hasCover}
            onChange={(e) => onChangeHasCover(e.target.checked)}
          />
          <span>Standalone front & back cover</span>
        </label>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>One-Click Book Presets</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
          }}
        >
          {PRESET_LIST.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-label={`Preset: ${preset.label}`}
              onClick={() => onSelectPreset(preset.id)}
              style={{
                textAlign: "left",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #d6d3d1",
                background: "#ffffff",
                cursor: "pointer",
                display: "grid",
                gap: 2,
              }}
            >
              <strong style={{ fontSize: 13 }}>{preset.label}</strong>
              <span style={{ fontSize: 12, color: "#57534e" }}>{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Page Stiffness (Density)</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("all-soft")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            All Soft Pages (Newspaper)
          </button>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("hard-covers")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Hard Front & Back Cover
          </button>
          <button
            type="button"
            onClick={() => onApplyBulkDensity("all-hard")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            All Hard Pages (Board Book)
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Stage Theme</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 8,
          }}
        >
          {THEME_LIST.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                aria-label={`Theme: ${t.label}`}
                aria-pressed={active}
                onClick={() => onChangeTheme(t.id)}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 6,
                  border: active ? `2px solid ${t.accentColor}` : "1px solid #d6d3d1",
                  background: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: t.stageBg,
                    border: `2px solid ${t.accentColor}`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ display: "grid", gap: 2 }}>
                  <strong style={{ fontSize: 13 }}>{t.label}</strong>
                  <span style={{ fontSize: 11, color: "#57534e" }}>{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, and lint**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/BookSettingsPanel.tsx apps/web/src/components/BookSettingsPanel.test.tsx
git commit -m "feat(web): add BookSettingsPanel for presets, cover, density, and theme"
```

---

### Task 3: `<CreatorWizard>` 3-step non-coder workflow (`Upload` -> `Arrange & Style` -> `Preview & Publish`)

**Files:**

- Create: `apps/web/src/components/CreatorWizard.tsx`
- Test: `apps/web/src/components/CreatorWizard.test.tsx`

**Interfaces:**

- Consumes:
  - `THEMES`, `type BookPresetId`, `type BookTheme`, `type BulkDensityMode`, `type ImportedPage` from `@plif/core`
  - `PageOrganizer` from `apps/web/src/components/PageOrganizer.tsx`
  - `BookSettingsPanel` from `apps/web/src/components/BookSettingsPanel.tsx`
- Produces:
  - `export type WizardStep = "upload" | "arrange" | "publish"`
  - `export interface CreatorWizardProps { step: WizardStep; onStepChange: (step: WizardStep) => void; title: string; hasCover: boolean; theme: BookTheme; pages: readonly ImportedPage[]; isImporting?: boolean; progressText?: string | null; errorText?: string | null; onUploadFiles: (files: File[]) => void; onChangePages: (pages: ImportedPage[]) => void; onChangeTitle: (title: string) => void; onChangeHasCover: (hasCover: boolean) => void; onChangeTheme: (theme: BookTheme) => void; onSelectPreset: (presetId: BookPresetId) => void; onApplyBulkDensity: (mode: BulkDensityMode) => void; onResetToSample: () => void }`
  - `export function CreatorWizard(props: CreatorWizardProps): JSX.Element`

- [ ] **Step 1: Write the failing test**

`apps/web/src/components/CreatorWizard.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ImportedPage } from "@plif/core";
import { CreatorWizard, type CreatorWizardProps } from "./CreatorWizard";

afterEach(() => cleanup());

const samplePages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 480, height: 679, alt: "Page 1" },
  { id: "p2", src: "blob:2", width: 480, height: 679, alt: "Page 2" },
];

function makeProps(overrides: Partial<CreatorWizardProps> = {}): CreatorWizardProps {
  return {
    step: "upload",
    onStepChange: vi.fn(),
    title: "School Paper",
    hasCover: true,
    theme: "magazine",
    pages: samplePages,
    onUploadFiles: vi.fn(),
    onChangePages: vi.fn(),
    onChangeTitle: vi.fn(),
    onChangeHasCover: vi.fn(),
    onChangeTheme: vi.fn(),
    onSelectPreset: vi.fn(),
    onApplyBulkDensity: vi.fn(),
    onResetToSample: vi.fn(),
    ...overrides,
  };
}

describe("<CreatorWizard>", () => {
  it("navigates across the 3 wizard steps via step tabs and Next/Back buttons", () => {
    const onStepChange = vi.fn();
    render(<CreatorWizard {...makeProps({ step: "upload", onStepChange })} />);

    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));
    expect(onStepChange).toHaveBeenCalledWith("arrange");

    fireEvent.click(screen.getByRole("tab", { name: /3\. Preview & Publish/i }));
    expect(onStepChange).toHaveBeenCalledWith("publish");
  });

  it("renders BookSettingsPanel and PageOrganizer in the arrange step", () => {
    render(<CreatorWizard {...makeProps({ step: "arrange" })} />);
    expect(screen.getByLabelText("Book title")).toBeTruthy();
    expect(screen.getByLabelText("Imported pages")).toBeTruthy();
  });

  it("renders publish summary and reset button in the publish step", () => {
    const onResetToSample = vi.fn();
    render(<CreatorWizard {...makeProps({ step: "publish", onResetToSample })} />);

    expect(screen.getByText(/Ready to Publish/i)).toBeTruthy();
    expect(screen.getByText(/School Paper/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Load Sample Book/i }));
    expect(onResetToSample).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/web test`
Expected: FAIL (cannot resolve `./CreatorWizard`).

- [ ] **Step 3: Write minimal implementation**

`apps/web/src/components/CreatorWizard.tsx`:

```tsx
import {
  THEMES,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type ImportedPage,
} from "@plif/core";
import { BookSettingsPanel } from "./BookSettingsPanel";
import { PageOrganizer } from "./PageOrganizer";

export type WizardStep = "upload" | "arrange" | "publish";

export interface CreatorWizardProps {
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  title: string;
  hasCover: boolean;
  theme: BookTheme;
  pages: readonly ImportedPage[];
  isImporting?: boolean;
  progressText?: string | null;
  errorText?: string | null;
  onUploadFiles: (files: File[]) => void;
  onChangePages: (pages: ImportedPage[]) => void;
  onChangeTitle: (title: string) => void;
  onChangeHasCover: (hasCover: boolean) => void;
  onChangeTheme: (theme: BookTheme) => void;
  onSelectPreset: (presetId: BookPresetId) => void;
  onApplyBulkDensity: (mode: BulkDensityMode) => void;
  onResetToSample: () => void;
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "upload", label: "1. Upload" },
  { id: "arrange", label: "2. Arrange & Style" },
  { id: "publish", label: "3. Preview & Publish" },
];

export function CreatorWizard({
  step,
  onStepChange,
  title,
  hasCover,
  theme,
  pages,
  isImporting = false,
  progressText = null,
  errorText = null,
  onUploadFiles,
  onChangePages,
  onChangeTitle,
  onChangeHasCover,
  onChangeTheme,
  onSelectPreset,
  onApplyBulkDensity,
  onResetToSample,
}: CreatorWizardProps) {
  const themeTokens = THEMES[theme];

  return (
    <div
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 12,
      }}
    >
      <div
        role="tablist"
        aria-label="Flipbook creation steps"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fafaf9",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #d6d3d1",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {STEPS.map((s) => {
            const active = s.id === step;
            return (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onStepChange(s.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: active ? `2px solid ${themeTokens.accentColor}` : "1px solid #d6d3d1",
                  background: active ? "#1c1917" : "#ffffff",
                  color: active ? "#ffffff" : "#1c1917",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {step === "upload" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: themeTokens.accentColor,
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Next: Arrange & Style →
            </button>
          )}
          {step === "arrange" && (
            <>
              <button
                type="button"
                onClick={() => onStepChange("upload")}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #d6d3d1",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                ← Back: Upload
              </button>
              <button
                type="button"
                onClick={() => onStepChange("publish")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: themeTokens.accentColor,
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Next: Preview & Publish →
              </button>
            </>
          )}
          {step === "publish" && (
            <button
              type="button"
              onClick={() => onStepChange("arrange")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d6d3d1",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              ← Back: Arrange & Style
            </button>
          )}
        </div>
      </div>

      {step === "upload" && (
        <PageOrganizer
          pages={pages}
          isImporting={isImporting}
          progressText={progressText}
          errorText={errorText}
          onUploadFiles={onUploadFiles}
          onChangePages={onChangePages}
        />
      )}

      {step === "arrange" && (
        <>
          <BookSettingsPanel
            title={title}
            hasCover={hasCover}
            theme={theme}
            onChangeTitle={onChangeTitle}
            onChangeHasCover={onChangeHasCover}
            onChangeTheme={onChangeTheme}
            onSelectPreset={onSelectPreset}
            onApplyBulkDensity={onApplyBulkDensity}
          />
          <PageOrganizer
            pages={pages}
            isImporting={isImporting}
            progressText={progressText}
            errorText={errorText}
            onUploadFiles={onUploadFiles}
            onChangePages={onChangePages}
          />
        </>
      )}

      {step === "publish" && (
        <section
          aria-label="Publish summary"
          style={{
            padding: 16,
            borderRadius: 8,
            border: "1px solid #d6d3d1",
            background: "#fafaf9",
            color: "#1c1917",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <strong style={{ fontSize: 15 }}>
              Ready to Publish: {title.trim() || "Untitled Book"}
            </strong>
            <span style={{ fontSize: 13, color: "#57534e" }}>
              {pages.length > 0 ? `${pages.length} imported pages` : "12 sample pages"} •{" "}
              {hasCover ? "Standalone cover" : "Newspaper spread (no cover)"} • Theme:{" "}
              {themeTokens.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onResetToSample}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            Load Sample Book
          </button>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, and lint**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/CreatorWizard.tsx apps/web/src/components/CreatorWizard.test.tsx
git commit -m "feat(web): add CreatorWizard 3-step flipbook creation workflow"
```

---

### Task 4: Wire `<CreatorWizard>` and themed live `<Flipbook>` stage into `App.tsx`

**Files:**

- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/App.test.tsx`

**Interfaces:**

- Consumes:
  - `applyBookPreset`, `applyBulkDensity`, `buildManifest`, `formatPageLabel`, `THEMES`, `type BookPresetId`, `type BookTheme`, `type BulkDensityMode`, `type ImportedPage` from `@plif/core`
  - `Flipbook`, `type FlipbookHandle` from `@plif/reader`
  - `CreatorWizard`, `type WizardStep` from `apps/web/src/components/CreatorWizard.tsx`
  - `importFiles` from `apps/web/src/import/index.ts`
  - `sampleManifest` from `apps/web/src/sample.ts`
- Produces:
  - `export function App(): JSX.Element` (renders themed header, `<CreatorWizard>`, and live `<Flipbook>` stage styled with `THEMES[theme]`).

- [ ] **Step 1: Write the failing test**

`apps/web/src/App.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { PageFlipMock } = vi.hoisted(() => {
  const instance = {
    loadFromHTML: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
    flipNext: vi.fn(),
    flipPrev: vi.fn(),
    flip: vi.fn(),
    getPage: vi.fn(() => ({ setDensity: vi.fn() })),
  };
  return {
    PageFlipMock: vi.fn(() => instance),
  };
});

vi.mock("page-flip", () => ({ PageFlip: PageFlipMock }));

import { App } from "./App";

afterEach(() => cleanup());

describe("<App>", () => {
  it("switches wizard steps, applies presets/themes, and updates the live Flipbook stage", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "School Paper" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));

    fireEvent.change(screen.getByLabelText("Book title"), {
      target: { value: "The Campus Chronicle" },
    });
    expect(screen.getByRole("heading", { name: "The Campus Chronicle" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Preset: Newspaper/i }));
    expect(screen.getByText("1–2 / 12")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @plif/web test`
Expected: FAIL (`getByRole("heading", { name: "School Paper" })` not found in old `App.tsx`).

- [ ] **Step 3: Implement updated `apps/web/src/App.tsx`**

`apps/web/src/App.tsx`:

```tsx
import { useMemo, useRef, useState } from "react";
import {
  applyBookPreset,
  applyBulkDensity,
  buildManifest,
  formatPageLabel,
  THEMES,
  type BookPresetId,
  type BookTheme,
  type BulkDensityMode,
  type ImportedPage,
} from "@plif/core";
import { Flipbook, type FlipbookHandle } from "@plif/reader";
import { CreatorWizard, type WizardStep } from "./components/CreatorWizard";
import { importFiles } from "./import";
import { sampleManifest } from "./sample";

const SAMPLE_IMPORTED_PAGES: ImportedPage[] = sampleManifest.pages.map((p, idx) => ({
  id: `sample-${idx + 1}`,
  src: p.src,
  width: sampleManifest.pageSize.width,
  height: sampleManifest.pageSize.height,
  alt: p.alt ?? `Page ${idx + 1}`,
  ...(p.density !== undefined ? { density: p.density } : {}),
}));

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const [step, setStep] = useState<WizardStep>("upload");
  const [title, setTitle] = useState(sampleManifest.title);
  const [hasCover, setHasCover] = useState(sampleManifest.hasCover);
  const [theme, setTheme] = useState<BookTheme>(sampleManifest.theme);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [index, setIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const effectivePages = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;

  const activeManifest = useMemo(
    () =>
      buildManifest({
        title,
        hasCover,
        theme,
        pages: effectivePages,
      }),
    [title, hasCover, theme, effectivePages],
  );

  const total = activeManifest.pages.length;
  const themeTokens = THEMES[theme];

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
      setStep("arrange");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Failed to import files");
      setProgressText(null);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSelectPreset = (presetId: BookPresetId) => {
    const base = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;
    const next = applyBookPreset(presetId, base);
    setHasCover(next.hasCover);
    setTheme(next.theme);
    setPages(next.pages);
    setIndex(0);
  };

  const handleApplyBulkDensity = (mode: BulkDensityMode) => {
    const base = pages.length > 0 ? pages : SAMPLE_IMPORTED_PAGES;
    setPages(applyBulkDensity(base, mode));
    setIndex(0);
  };

  const handleResetToSample = () => {
    setTitle(sampleManifest.title);
    setHasCover(sampleManifest.hasCover);
    setTheme(sampleManifest.theme);
    setPages([]);
    setIndex(0);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: themeTokens.stageBg,
        color: themeTokens.textColor,
        display: "flex",
        flexDirection: "column",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <header
        style={{
          background: themeTokens.headerBg,
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: themeTokens.accentColor,
                fontWeight: 700,
              }}
            >
              Plif Flipbook Studio • {themeTokens.label}
            </span>
            <h1 style={{ margin: "2px 0 0", fontSize: 22 }}>{activeManifest.title}</h1>
          </div>
          <span style={{ fontSize: 13, opacity: 0.85 }}>
            {hasCover ? "Cover + Spread Mode" : "Newspaper Spread Mode"}
          </span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          gap: 20,
          padding: "20px 0 32px",
        }}
      >
        <CreatorWizard
          step={step}
          onStepChange={setStep}
          title={title}
          hasCover={hasCover}
          theme={theme}
          pages={pages}
          isImporting={isImporting}
          progressText={progressText}
          errorText={errorText}
          onUploadFiles={handleUploadFiles}
          onChangePages={(next) => {
            setPages(next);
            setIndex(0);
          }}
          onChangeTitle={setTitle}
          onChangeHasCover={(next) => {
            setHasCover(next);
            setIndex(0);
          }}
          onChangeTheme={setTheme}
          onSelectPreset={handleSelectPreset}
          onApplyBulkDensity={handleApplyBulkDensity}
          onResetToSample={handleResetToSample}
        />

        <Flipbook ref={book} manifest={activeManifest} onPageChange={setIndex} />

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => book.current?.prev()}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${themeTokens.accentColor}`,
              background: "transparent",
              color: themeTokens.textColor,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Previous
          </button>
          <span style={{ fontWeight: 600 }}>
            {formatPageLabel(index, total, activeManifest.hasCover, false)}
          </span>
          <button
            type="button"
            onClick={() => book.current?.next()}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${themeTokens.accentColor}`,
              background: "transparent",
              color: themeTokens.textColor,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Verify build, typecheck, lint, and tests**

Run: `pnpm --filter @plif/web build && pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/App.test.tsx
git commit -m "feat(web): integrate CreatorWizard and themed Flipbook studio in App"
```
