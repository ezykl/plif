# Plan: PWA & Offline Support + Tactile Paper Sound Effects

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Equip Plif with procedural Web Audio API paper page-turn sound effects (with toolbar mute toggle & persistence) and full PWA offline capabilities (Web App Manifest, standalone shell caching, and network status indicator).

**Architecture:**

- **Tactile Audio Engine**: A lightweight procedural Web Audio API synthesizer in `@plif/reader` generating organic paper rustle acoustics (filtered noise burst with random frequency jitter) without external audio files (0 kB payload, zero latency, 100% offline). Integrated into `<Flipbook>` on page flip events and controlled via `<ReaderToolbar>`.
- **PWA & Offline Pipeline**: Standard W3C Web App Manifest (`manifest.webmanifest`), SVG application icon, and a zero-dependency Service Worker in `apps/web/public/sw.js` caching application assets and the `pdf.worker` script. Connected to a reactive online/offline status badge in the stationery header.

**Tech Stack:** React 18, TypeScript (strict), Web Audio API, Service Worker API, Vitest, Vite.

**Branch:** `feat/pwa-and-tactile-audio` (base: `main`).

---

## Global Constraints

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Do NOT add `pdfjs-dist` to `@plif/core` or `@plif/reader`.
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- Strict TypeScript (`noUncheckedIndexedAccess`) and ESLint compliance.
- Conventional Commits enforced by commitlint (`feat(reader): ...`, `feat(web): ...`).
- Respect `prefers-reduced-motion` and accessibility guidelines in `DESIGN.md` (min 44px tap targets, high-contrast focus rings).
- Every task must leave `pnpm format; pnpm typecheck; pnpm lint; pnpm test` passing.

---

### Task 1: Procedural Tactile Audio Engine & Sound Toggle in `@plif/reader`

**Files:**

- Create: `packages/reader/src/audio.ts`
- Create: `packages/reader/src/audio.test.ts`
- Modify: `packages/reader/src/Flipbook.tsx`
- Modify: `packages/reader/src/Flipbook.test.tsx`
- Modify: `packages/reader/src/ReaderToolbar.tsx`
- Modify: `packages/reader/src/ReaderToolbar.test.tsx`
- Modify: `packages/reader/src/index.ts`

**Interfaces:**

- Produces:
  - `playPaperTurnSound(options?: { volume?: number; disabled?: boolean }): void`
  - `FlipbookProps.soundEnabled?: boolean`
  - `ReaderToolbarProps.soundEnabled?: boolean`
  - `ReaderToolbarProps.onToggleSound?: () => void`

- [x] **Step 1: Write failing audio tests (`packages/reader/src/audio.test.ts`)**
- [x] **Step 2: Run tests to verify failure** (`pnpm --filter @plif/reader test`)
- [x] **Step 3: Implement procedural audio synthesizer (`packages/reader/src/audio.ts`)**
  - Implement synthesized paper rustle with Web Audio API (`AudioContext`, BiquadFilter low-pass ~1400Hz-2200Hz, Gain envelope ~120ms duration).
  - Include SSR/node fallback when `window.AudioContext` is undefined.
- [x] **Step 4: Wire sound to `<Flipbook>` and `<ReaderToolbar>`**
  - In `Flipbook.tsx`: Play sound on `flip.on("flip")` when `soundEnabled !== false` and `reduceMotion !== true`.
  - In `ReaderToolbar.tsx`: Add audio toggle button with 44px touch target, speaker icon (🔊 / 🔇), and accessible label.
- [x] **Step 5: Verify all reader tests pass** (`pnpm --filter @plif/reader test`)
- [x] **Step 6: Commit**
  - `git commit -m "feat(reader): add procedural tactile paper audio and toolbar sound toggle"`

---

### Task 2: Sound Preference Integration & Keyboard Shortcut in `@plif/web`

**Files:**

- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

**Interfaces:**

- Consumes: `soundEnabled`, `onToggleSound` from `@plif/reader`.
- Stores: `localStorage.getItem("plif_sound_enabled")`.

- [ ] **Step 1: Write failing tests in `App.test.tsx`**
  - Test verifying sound toggle button in toolbar flips state and updates `localStorage`.
  - Test verifying `m` / `M` keypress toggles sound.
- [ ] **Step 2: Run tests to verify failure** (`pnpm --filter @plif/web test`)
- [ ] **Step 3: Implement sound state & keyboard listener in `App.tsx`**
  - Load initial state from `localStorage.getItem("plif_sound_enabled") !== "false"`.
  - Wire toggle callback to `localStorage.setItem("plif_sound_enabled", String(nextState))`.
  - Register `keydown` event listener for `e.key.toLowerCase() === "m"` (ignoring input fields).
- [ ] **Step 4: Verify tests pass** (`pnpm --filter @plif/web test`)
- [ ] **Step 5: Commit**
  - `git commit -m "feat(web): wire sound preference persistence and M shortcut in creator studio"`

---

### Task 3: PWA Web App Manifest, App Icons & Offline Service Worker in `@plif/web`

**Files:**

- Create: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/public/icon.svg`
- Create: `apps/web/public/sw.js`
- Create: `apps/web/src/pwa.ts`
- Create: `apps/web/src/pwa.test.ts`
- Modify: `apps/web/index.html`
- Modify: `apps/web/src/main.tsx`

**Interfaces:**

- Produces: `registerServiceWorker(): Promise<ServiceWorkerRegistration | null>`

- [ ] **Step 1: Write tests for `pwa.ts`**
  - Test service worker registration when supported in browser.
- [ ] **Step 2: Create Web App Manifest & SVG icon**
  - Define `name: "Plif Flipbook Studio"`, `short_name: "Plif"`, `theme_color: "#24201d"`, `background_color: "#fdfbf7"`, `display: "standalone"`.
- [ ] **Step 3: Create Service Worker (`sw.js`)**
  - Cache shell: `./`, `./index.html`, `./manifest.webmanifest`, `./icon.svg`.
  - Cache-first strategy for immutable assets; network-first with cache fallback for HTML navigation.
- [ ] **Step 4: Update `index.html` and `main.tsx`**
  - Add manifest link, theme color meta, icon links.
  - Call `registerServiceWorker()`.
- [ ] **Step 5: Verify build & tests pass** (`pnpm --filter @plif/web build; pnpm --filter @plif/web test`)
- [ ] **Step 6: Commit**
  - `git commit -m "feat(web): add pwa web manifest, app icons, and offline service worker"`

---

### Task 4: Tactile Offline Status Badge & Studio Shell Indicators in `@plif/web`

**Files:**

- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

**Interfaces:**

- Uses `navigator.onLine` and `online`/`offline` window events.

- [ ] **Step 1: Write tests in `App.test.tsx` for offline status badge**
- [ ] **Step 2: Implement reactive network status indicator in `App.tsx`**
  - Add badge in stationery top bar: when offline, display `"📡 Offline Mode (Local Storage Active)"` with warm amber/terracotta border.
- [ ] **Step 3: Verify tests pass** (`pnpm --filter @plif/web test`)
- [ ] **Step 4: Commit**
  - `git commit -m "feat(web): display tactile offline mode indicator in studio shell"`

---

### Task 5: Whole-Branch Verification, Anti-Slop Audit, PR & Merge

- [ ] **Step 1: Anti-Slop Delivery Gate Audit against `DESIGN.md`**
- [ ] **Step 2: Full workspace tests & build**
  - `pnpm format; pnpm --filter @plif/web build; pnpm typecheck; pnpm lint; pnpm test`
- [ ] **Step 3: Push branch, create PR, and merge into `main`**
