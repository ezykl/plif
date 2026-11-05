# Plif Design Document: Friendly UI/UX & Anti-Slop Guidelines

**Date:** 2026-11-05  
**Topic:** Friendly UI/UX Enhancement & Open-Source Anti-Slop Skill Integration  
**Status:** Approved  
**Author:** Pair programming session (Antigravity + User)

---

## 1. Context & Motivation

Plif is an open-source, client-side flipbook creator and reader built on StPageFlip (`page-flip` 2.0.7), eliminating proprietary Turn.js and legacy jQuery dependencies.

While the core functionality (PDF/image import, page organization, reading direction, zoom, deep-linking, standalone offline HTML exports, `<plif-book>` web component, and responsive iframe embeds) is fully complete and covered by 91 passing tests, the user interface currently relies on minimal, functional inline styling.

This document defines:

1. **The Anti-Slop Rule Integration**: Installing open-source anti-slop skills from [`miqdadbadjuber/anti-slop`](https://github.com/miqdadbadjuber/anti-slop) into `.agents/skills/` and establishing a repository-level `DESIGN.md` to prevent generic AI design tropes (uninspired purple gradients, robotic pill badges, meaningless stat cards, low contrast, and lifeless cookie-cutter templates).
2. **The "Tactile Bookish & Friendly" UI/UX Direction**: A warm, welcoming, artisan-crafted aesthetic inspired by boutique print shops, editorial binders, and stationery ateliers, emphasizing tactile feedback, clear typographic hierarchy, human microcopy, and accessible affordances.

---

## 2. Anti-Slop Skill & Rules Framework

### 2.1 Installed Skills in `.agents/skills/`

We integrate three specialized skills from the open-source `miqdadbadjuber/anti-slop` repository:

1. **`antislop` (`.agents/skills/antislop/SKILL.md`)**:
   - The core filter enforcing 40 purpose-tested rules (R-01 to R-40) across three tiers: _Hard Gate_, _Purpose-Gate_, and _Quality Locks_.
   - Requires every visual decision to have a declared purpose (hierarchy, clarity, tactile identity) rather than arbitrary styling.
   - Mandates the **Delivery Gate** report prior to shipping.
2. **`antislop-ui` (`.agents/skills/antislop-ui/SKILL.md`)**:
   - Eliminates generic AI tropes: cookie-cutter card grids, low-contrast subtle gray text, decorative floating shapes without interaction, and standard rounded pills.
   - Directs layout cadence, authentic depth (subtle paper elevation), and purposeful color anchoring.
3. **`antislop-human` (`.agents/skills/antislop-human/SKILL.md`)**:
   - Enforces WCAG 2.1 AA contrast ratios (minimum 4.5:1 for body text, 3:1 for large text and UI boundaries).
   - Requires visible focus indicators (2px high-contrast rings), minimum 44×44px interactive tap targets, and comprehensive keyboard navigation.

### 2.2 Project `DESIGN.md` (Repository Root)

`DESIGN.md` gives Plif its distinct soul and serves as the single source of truth for visual direction:

```markdown
# Plif Design System: Tactile Bookish & Friendly

## Identity

Plif is a friendly, client-side flipbook studio for writers, educators, independent publishers, and curious creators. It feels like entering a warm, well-lit boutique print shop with wooden tables, crisp paper stock, and brass stationery tools.

## Palette

- **Parchment Surface**: `#FDFBF7` (page base), `#F5EFE6` (subtle panel fills)
- **Paper Elevated**: `#FFFFFF` (cards, dialogs, drawers)
- **Deep Ink**: `#24201D` (primary headings & body copy)
- **Muted Graphite**: `#6B635B` (captions, labels, secondary text)
- **Artisan Terracotta**: `#C25E3E` (primary call-to-actions, active indicators)
- **Forest Sage**: `#3E6B5C` (success states, verified badges, preview hints)
- **Warm Amber**: `#D9822B` (accent highlights, TOC markers)
- **Deckle Border**: `#E6DFD5` (subtle paper boundaries, 1px dividers)
- **Focus Ring**: `2px solid #C25E3E` with 2px offset

## Typography

- **Headings & Titles**: Editorial Serif stack: `Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif`
- **Interface & Controls**: Clean, highly-legible Humanist Sans stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Code & Snippets**: Crisp Monospace stack: `"JetBrains Mono", "Fira Code", ui-monospace, monospace`

## Liveliness Dials

- **ENERGY**: Medium-High (warm, inviting, responsive)
- **RHYTHM**: Varied editorial cadence (generous breathing room, clear typographic hierarchy, balanced card groupings)
- **MOTION**: Purposeful paper transitions (150ms–200ms ease-out for hover elevation, 250ms for drawer slides; strictly respects `prefers-reduced-motion`)
```

---

## 3. UI/UX Component Specifications

### 3.1 Header (`apps/web/src/App.tsx`)

- **Brand Mark**: Warm terracotta open-book icon (`📖`) paired with crisp serif `Plif` title and `"Indie Flipbook Studio"` sub-heading.
- **Top Utility Bar**: Displays the currently active theme token, reading direction indicator (e.g. `LTR • English Spread`), and a quick `"Live Preview"` button linking to the stage.
- **Styling**: Parchment background with a clean 1px bottom border (`#E6DFD5`), replacing generic dark headers with warm editorial tones.

### 3.2 Creator Wizard (`apps/web/src/components/CreatorWizard.tsx`)

- **Pipeline Navigation**: Redesigned 3-step tactile tracker:
  1. `1. Upload Pages`
  2. `2. Arrange & Style`
  3. `3. Preview & Publish`
- **Active Step Indicator**: Filled warm terracotta badge with subtle paper shadow, crisp font, and smooth forward/back navigational buttons.
- **Helper Banner**: Conversational, reassuring microcopy:
  - _Upload step_: "Drop in your PDF or images. No files are uploaded to any server — everything processes safely inside your browser."
  - _Arrange step_: "Tailor your book's paper density, front cover, themes, and reading direction."
  - _Publish step_: "Export an offline standalone HTML book or copy embed code for your website."

### 3.3 Page Organizer (`apps/web/src/components/PageOrganizer.tsx`)

- **Dropzone**:
  - Dotted warm deckle border (`2px dashed #D6CCC2`) that highlights to solid terracotta on dragover.
  - Clear format tags (`PDF`, `PNG`, `JPG`, `WebP`) with friendly icon badges.
  - Helpful privacy note: _"🔒 100% Client-Side: Your files never leave your browser."_
- **Page Cards**:
  - Paper card elevation (`box-shadow: 0 2px 6px rgba(36, 32, 29, 0.06)`).
  - High-contrast page number badge in the corner (`#24201D` on cream).
  - Distinct "Cover" ribbon tag when the page serves as the front cover.
  - Tactile action buttons (`← Move`, `→ Move`, `Paper: Soft/Hard`, `Delete`) with clear tooltips and 44px tap areas.

### 3.4 Book Settings Panel (`apps/web/src/components/BookSettingsPanel.tsx`)

- **Preset Selector**:
  - Four tactile card buttons: **Newspaper** (broadsheet spread, no cover), **Magazine** (glossy cover + spreads), **Hardcover** (rigid book boards), and **Zine** (compact pocket publication).
  - Active preset highlighted with warm terracotta border and check indicator.
- **Stage Theme Selector**:
  - Swatch buttons with genuine color previews of stage background, book spine, and accent color (`Newsprint`, `Magazine`, `Classic`, `Studio`).
- **Reading Direction**:
  - Segmented toggle with visual direction arrows: `LTR (Left-to-Right →)` vs `RTL (← Right-to-Left)`.
- **Table of Contents (TOC) Editor**:
  - Clean list of chapters with page jump inputs, title fields, and quick "Add Chapter" / "Remove" controls.

### 3.5 Live Flipbook Stage & Reader Toolbar (`Flipbook.tsx` & `ReaderToolbar.tsx`)

- **Stage Presentation**:
  - Ambient paper shadow beneath the open book spread (`filter: drop-shadow(0 12px 32px rgba(36, 32, 29, 0.15))`).
  - Warm backdrop adjusting to the active theme.
- **Reader Toolbar**:
  - Floating pill toolbar centered beneath the book with rounded-full border (`border-radius: 9999px`), frosted glass or warm paper backdrop, and subtle border.
  - Tactile icon buttons for `Previous Page`, `Next Page`, `Zoom Out (-)` / `Zoom In (+)`, `TOC Drawer`, and `Fullscreen`.
  - Accessible slider for scrubbing through pages with live page number indicator (`e.g., Pages 4–5 of 12`).
  - Collapsible TOC drawer sliding in from the side with clean chapter list and active highlight.

### 3.6 Publish Panel (`apps/web/src/components/PublishPanel.tsx`)

- **Export Cards**:
  - **Download Standalone HTML**: Highlighted primary card with terracotta button, explaining: _"Self-contained file with embedded images and flip engine. Works completely offline in any web browser."_
  - **Download Manifest JSON**: Secondary utility card for developers and headless hosting.
- **Embed Code Section**:
  - Segmented tab selector (`Responsive <iframe>` vs `<plif-book> Web Component`).
  - Syntax container with dark ink backdrop (`#1F1D1B`), contrasting code text, and one-click "Copy Embed Code" button with 2-second "Copied!" feedback.
  - Clear integration guidance: _"Works in WordPress, Webflow, Squarespace, Ghost, Notion, and vanilla HTML."_

---

## 4. Human Factors & Accessibility

1. **Color Contrast**: All text elements meet WCAG 2.1 AA minimums (4.5:1 for body copy, 3:1 for large headers and interactive icons).
2. **Focus Visibility**: Custom `:focus-visible` styling (`outline: 2px solid #C25E3E; outline-offset: 2px;`) across all buttons, inputs, and tabs.
3. **Motion Sensitivity**: Smooth CSS transitions strictly query `@media (prefers-reduced-motion: reduce)` to disable non-essential animations.
4. **Touch Target Size**: Minimum 44×44px hit areas on all buttons and sliders for comfortable mobile and tablet navigation.
5. **Screen Readers**: Full ARIA markup (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-label`, `aria-selected`, `aria-expanded`).

---

## 5. Verification Plan

1. **Automated Unit & Integration Tests**:
   - Update existing test files (`BookSettingsPanel.test.tsx`, `CreatorWizard.test.tsx`, `PageOrganizer.test.tsx`, `PublishPanel.test.tsx`, `App.test.tsx`) to match new accessible labels, friendly copy, and styling structures.
   - Run `pnpm test` across all 3 workspace packages (must remain 100% green).
2. **Typecheck & Linter**:
   - `pnpm typecheck` (0 errors).
   - `pnpm lint` and `pnpm format` (clean).
3. **Build Verification**:
   - `pnpm --filter @plif/reader build` and `pnpm --filter @plif/web build` (clean emission of production bundles).
4. **Anti-Slop Delivery Gate Report**:
   - Run the four-block antislop delivery gate check to verify no generic AI slop was introduced.
