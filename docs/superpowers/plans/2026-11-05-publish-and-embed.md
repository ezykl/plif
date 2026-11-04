# Plif: Publish & Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement offline standalone book export (HTML / ZIP with manifest and page assets), responsive `<iframe>` and `<plif-book>` web component embed code generators, and the `<plif-book>` custom element bundle, completing the 6-plan roadmap.

**Architecture:**

- **`@plif/core`** (`packages/core/src/export.ts`):
  - Pure embed snippet generators: `generateIframeEmbed({ src, width, height, title })` and `generateWebComponentEmbed({ manifestUrl, scriptUrl })`.
  - Self-contained standalone HTML generator: `generateStandaloneHtml(manifest)` producing a single portable HTML document with embedded flipbook player and bundled base64/SVG or relative page sources.
- **`packages/reader`** (`packages/reader/src/web-component.ts`):
  - Defines the `<plif-book>` custom element (`HTMLElement`) using Web Components API (`customElements.define("plif-book", PlifBookElement)`).
  - Listens to attributes `src` (manifest JSON URL), `direction`, `theme`, and `zoom`.
  - Renders `<Flipbook>` into shadow DOM / mount container with responsive layout and `<ReaderToolbar>`.
  - Configures Vite library build producing `dist/plif-book.js` (UMD/ESM standalone bundle).
- **`apps/web`** (`apps/web/src/components/PublishPanel.tsx`, `CreatorWizard.tsx`, `App.tsx`):
  - Step 3 ("Preview & Publish") replaces the placeholder with `<PublishPanel>` offering:
    1. One-click "Download Standalone HTML" (client-side Blob download).
    2. One-click "Download Manifest JSON" (client-side `manifest.json` download).
    3. Responsive `<iframe>` embed code snippet with one-click copy and dimensions preview.
    4. `<plif-book>` Web Component snippet with one-click copy.
    5. Live embed preview tab.

**Tech Stack:** TypeScript 5.6 (strict), React 18.3, StPageFlip (`page-flip`), Web Components API, Vitest + Testing Library + jsdom.

**Global Constraints:**

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Do NOT add `pdfjs-dist` to `@plif/core` or `@plif/reader`.
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- TypeScript `strict` and `noUncheckedIndexedAccess` (from `tsconfig.base.json`).
- Conventional Commits, enforced by commitlint (e.g. `feat(core): ...`, `feat(reader): ...`, `feat(web): ...`). One commit per task.
- Every task must leave `pnpm typecheck && pnpm lint && pnpm test` green.

---

## Tasks

### Task 1: `@plif/core` embed snippet & standalone HTML generators

**Files:**

- Create: `packages/core/src/export.ts`
- Create: `packages/core/src/export.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write failing tests in `packages/core/src/export.test.ts`**
- [ ] **Step 2: Run `@plif/core` tests to verify failure**
- [ ] **Step 3: Implement `packages/core/src/export.ts` and export from `packages/core/src/index.ts`**
- [ ] **Step 4: Run `pnpm typecheck; pnpm lint; pnpm test`**
- [ ] **Step 5: Commit (`feat(core): add embed snippet generators and standalone HTML export`)**

---

### Task 2: `<plif-book>` Web Component in `@plif/reader` & library bundle build

**Files:**

- Create: `packages/reader/src/web-component.ts`
- Create: `packages/reader/src/web-component.test.ts`
- Modify: `packages/reader/src/index.ts`
- Modify: `packages/reader/package.json`
- Modify: `packages/reader/vite.config.ts`

- [ ] **Step 1: Write failing tests in `packages/reader/src/web-component.test.ts`**
- [ ] **Step 2: Run `@plif/reader` tests to verify failure**
- [ ] **Step 3: Implement `PlifBookElement` in `packages/reader/src/web-component.ts` and configure library build**
- [ ] **Step 4: Run `pnpm --filter @plif/reader build; pnpm typecheck; pnpm lint; pnpm test`**
- [ ] **Step 5: Commit (`feat(reader): add plif-book custom element and library build`)**

---

### Task 3: `<PublishPanel>` component in `@plif/web`

**Files:**

- Create: `apps/web/src/components/PublishPanel.tsx`
- Create: `apps/web/src/components/PublishPanel.test.tsx`
- Modify: `apps/web/src/components/CreatorWizard.tsx`
- Modify: `apps/web/src/components/CreatorWizard.test.tsx`

- [ ] **Step 1: Write failing tests in `PublishPanel.test.tsx` and update `CreatorWizard.test.tsx`**
- [ ] **Step 2: Run `@plif/web` tests to verify failure**
- [ ] **Step 3: Implement `PublishPanel.tsx` and integrate into `CreatorWizard.tsx`**
- [ ] **Step 4: Run `pnpm typecheck; pnpm lint; pnpm test`**
- [ ] **Step 5: Commit (`feat(web): add PublishPanel with standalone HTML download and embed generators`)**

---

### Task 4: End-to-end integration in `App.tsx` & export verification

**Files:**

- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Add integration test for publish downloads and embed code copy in `App.test.tsx`**
- [ ] **Step 2: Run `@plif/web` tests to verify failure**
- [ ] **Step 3: Wire download handlers and embed parameters in `App.tsx`**
- [ ] **Step 4: Run full verification (`pnpm --filter @plif/web build; pnpm typecheck; pnpm lint; pnpm test`)**
- [ ] **Step 5: Commit (`feat(web): wire publish exports and embed flows into App`)**
