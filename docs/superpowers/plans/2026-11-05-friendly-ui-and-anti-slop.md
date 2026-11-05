# Friendly UI/UX & Anti-Slop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul Plif's user interface with an authentic "Tactile Bookish & Friendly" design system, while installing and enforcing the open-source `miqdadbadjuber/anti-slop` skills and project `DESIGN.md`.

**Architecture:** Install open-source `antislop`, `antislop-ui`, and `antislop-human` skills into `.agents/skills/` and create `DESIGN.md` at root. Enhance `@plif/core` theme tokens with warm parchment surfaces and tactile borders. Overhaul `@plif/web` components (`CreatorWizard`, `BookSettingsPanel`, `PageOrganizer`, `PublishPanel`, and `App.tsx`) with tactile paper elevation, friendly conversational microcopy, visual preset cards, and accessible 44px hit targets.

**Tech Stack:** React 18, Vite 5, TypeScript 5, StPageFlip (`page-flip` 2.0.7), Vitest, Testing Library, CSS-in-JS style objects.

**Spec:** `docs/superpowers/specs/2026-11-05-friendly-ui-and-anti-slop-design.md`

## Global Constraints

- Flip engine is `page-flip` (StPageFlip, MIT). Do NOT add Turn.js or jQuery.
- Do NOT add `pdfjs-dist` to `@plif/core` or `@plif/reader`.
- Node >= 20, pnpm 12 workspace, ESM only (`"type": "module"`).
- TypeScript `strict` and `noUncheckedIndexedAccess` (from `tsconfig.base.json`).
- Conventional Commits, enforced by commitlint (e.g. `feat(web): ...`, `docs: ...`). One commit per task.
- Every task must leave `pnpm typecheck; pnpm lint; pnpm test` green (91+ tests passing).
- Run commands from the repo root `c:\Users\Janre\Desktop\Documents\GitHub\plif`.
- Comply with `DESIGN.md` and `antislop` rules (no generic purple gradients, no robotic pills, minimum 4.5:1 contrast, 44px touch targets).

---

### Task 1: Anti-Slop Skills & `DESIGN.md` Foundation

**Files:**

- Create: `.agents/skills/antislop/SKILL.md`
- Create: `.agents/skills/antislop-ui/SKILL.md`
- Create: `.agents/skills/antislop-human/SKILL.md`
- Create: `DESIGN.md`
- Test: `.agents/skills/antislop/antislop.test.ts` or vitest check verifying skill markdown exists and `DESIGN.md` exports valid tokens.

- [ ] **Step 1: Write `.agents/skills/antislop/SKILL.md`, `antislop-ui/SKILL.md`, and `antislop-human/SKILL.md`**
      Install the verified open-source skills from `miqdadbadjuber/anti-slop` into `.agents/skills/`.

- [ ] **Step 2: Create root `DESIGN.md`**
      Define Plif's tactile bookish identity, palette (`#FDFBF7`, `#F5EFE6`, `#FFFFFF`, `#24201D`, `#6B635B`, `#C25E3E`, `#3E6B5C`), typography (Charter/Georgia serif + system-ui sans), and dials (Energy: Medium-High, Rhythm: Editorial, Motion: Tactile).

- [ ] **Step 3: Verify and format**
      Run: `pnpm format; pnpm lint`

- [ ] **Step 4: Commit**

```bash
git add .agents/ DESIGN.md
git commit -m "docs(antislop): install anti-slop skills and establish DESIGN.md"
```

---

### Task 2: Shared Tactile Theme Tokens in `@plif/core`

**Files:**

- Modify: `packages/core/src/themes.ts`
- Modify: `packages/core/src/themes.test.ts`

**Interfaces:**

- Produces: Enhanced `ThemeTokens` with `surfaceWarm`, `borderSubtle`, `inkMuted`, `accentHover`, and `cardBg` fields.

- [ ] **Step 1: Write failing tests in `packages/core/src/themes.test.ts`**
      Assert all 4 themes (`newsprint`, `magazine`, `classic`, `studio`) define the tactile tokens (`surfaceWarm`, `borderSubtle`, `inkMuted`, `accentHover`, `cardBg`).

- [ ] **Step 2: Run test to verify failure**
      Run: `pnpm --filter @plif/core test`

- [ ] **Step 3: Update `packages/core/src/themes.ts`**
      Extend `ThemeTokens` interface and theme definitions with the palette tokens.

- [ ] **Step 4: Verify tests pass**
      Run: `pnpm --filter @plif/core test; pnpm typecheck`

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/themes.ts packages/core/src/themes.test.ts
git commit -m "feat(core): add tactile surface and border tokens to book themes"
```

---

### Task 3: Creator Studio Redesign in `@plif/web` (`CreatorWizard`, `BookSettingsPanel`, `PageOrganizer`)

**Files:**

- Modify: `apps/web/src/components/CreatorWizard.tsx`
- Modify: `apps/web/src/components/CreatorWizard.test.tsx`
- Modify: `apps/web/src/components/PageOrganizer.tsx`
- Modify: `apps/web/src/components/PageOrganizer.test.tsx`
- Modify: `apps/web/src/components/BookSettingsPanel.tsx`
- Modify: `apps/web/src/components/BookSettingsPanel.test.tsx`

- [ ] **Step 1: Update tests for new accessible labels & structure**
      Ensure tests verify the updated accessible role labels, helper text, and tactile controls.

- [ ] **Step 2: Run tests to verify failures**
      Run: `pnpm --filter @plif/web test`

- [ ] **Step 3: Redesign components**
- In `CreatorWizard.tsx`: Implement the 3-step tactile tracker with step numbers, progress indicators, and reassuring privacy/guidance banners.
- In `PageOrganizer.tsx`: Warm parchment dropzone with format badges (PDF, PNG, JPG, WebP), 100% client-side privacy note, paper card elevation (`box-shadow: 0 2px 8px rgba(36,32,29,0.06)`), and 44px tap target action buttons.
- In `BookSettingsPanel.tsx`: Tactile visual preset cards for `Newspaper`, `Magazine`, `Hardcover`, and `Zine` with descriptions and active indicators; circular theme color swatches; visual LTR/RTL segment toggle.

- [ ] **Step 4: Verify tests pass**
      Run: `pnpm --filter @plif/web test`

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/CreatorWizard.tsx apps/web/src/components/CreatorWizard.test.tsx apps/web/src/components/PageOrganizer.tsx apps/web/src/components/PageOrganizer.test.tsx apps/web/src/components/BookSettingsPanel.tsx apps/web/src/components/BookSettingsPanel.test.tsx
git commit -m "feat(web): redesign creator wizard, page organizer, and book settings with tactile styling"
```

---

### Task 4: Publish Panel & Studio Shell Polish in `@plif/web` (`PublishPanel`, `App.tsx`)

**Files:**

- Modify: `apps/web/src/components/PublishPanel.tsx`
- Modify: `apps/web/src/components/PublishPanel.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Update tests**
      Ensure tests verify the primary Standalone HTML card, Manifest card, and updated stationery header structure.

- [ ] **Step 2: Redesign `PublishPanel.tsx` and `App.tsx`**
- In `PublishPanel.tsx`: Highlighted primary card for Standalone HTML export with terracotta button; dark ink syntax snippet box with copy feedback; platform compatibility hints (WordPress, Webflow, Squarespace).
- In `App.tsx`: Stationery top bar with open-book logo 📖, serif title, edition badge, live stage link, and ambient book drop shadow (`filter: drop-shadow(0 16px 40px rgba(36,32,29,0.18))`).

- [ ] **Step 3: Run full workspace verification**
      Run: `pnpm format; pnpm --filter @plif/web build; pnpm typecheck; pnpm lint; pnpm test`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/PublishPanel.tsx apps/web/src/components/PublishPanel.test.tsx apps/web/src/App.tsx apps/web/src/App.test.tsx
git commit -m "feat(web): polish publish panel and app stage with stationery styling"
```

---

### Task 5: Whole-Branch Verification, Anti-Slop Delivery Gate, PR & Merge

- [ ] **Step 1: Run Anti-Slop Delivery Gate report**
      Evaluate against `DESIGN.md` and R-01..R-40:
  - Block 1: Direction & Purpose Check
  - Block 2: Slop Filters (Gradients, Badges, Fake Stats, Cards)
  - Block 3: Human Factors & Contrast
  - Block 4: Final Pass/Fail Verdict
- [ ] **Step 2: Full workspace tests & build**
      `pnpm format; pnpm typecheck; pnpm lint; pnpm test; pnpm --filter @plif/web build`
- [ ] **Step 3: Push branch, create PR, merge into `main`**
      Push `feat/friendly-ui`, create PR via `gh pr create`, and merge via `gh pr merge --merge --delete-branch`.
