# Plif 📖

Free, open-source, client-side flipbook creator and reader. Turn PDFs and images into realistic page-turning digital publications (newspapers, magazines, hardcovers, and zines) and embed or export them anywhere — with zero server requirements, fees, or tracking.

Built on the open-source [StPageFlip](https://github.com/Nodlik/StPageFlip) engine (MIT), replacing legacy Turn.js and jQuery dependencies with modern TypeScript and web components.

---

## ✨ Features

- **📄 Client-Side Import Pipeline**: Drop in PDFs or image files (PNG, JPG, WebP). Pages are extracted, rendered, and optimized directly in your browser using `pdfjs-dist` Web Workers and HTML5 Canvas. No files ever leave your machine.
- **🎨 Curated Stage Themes & Presets**:
  - **Themes**: _Newsprint_ (warm tactile paper), _Magazine_ (modern white studio), _Classic_ (rich mahogany library), and _Studio_ (sleek dark mode).
  - **Presets**: _Newspaper_ (broadsheet 2-page spread without cover), _Magazine_ (glossy cover spread), _Hardcover_ (rigid hard-bound book), and _Zine_ (compact format).
- **📑 Visual Page Organizer**: Reorder pages, remove pages, toggle standalone front covers, and assign paper weight (soft vs hard) per-page or in bulk.
- **🔍 Reader Controls & Accessibility**:
  - **Zoom & Fullscreen**: Step-zoom controls (75% to 200%) and native Fullscreen API support.
  - **Table of Contents (TOC)**: Collapsible drawer for chapter navigation, plus an interactive chapter editor in the creator panel.
  - **Deep Linking**: 2-way hash navigation (`#/page/N`) for direct bookmarking and sharing.
  - **Reading Direction**: Full Left-to-Right (LTR) and Right-to-Left (RTL) reading support with keyboard arrow inversion.
  - **Motion Accessibility**: Detects `prefers-reduced-motion` and automatically adjusts flip animation timings and shadow rendering.
- **🚀 One-Click Publish & Embed**:
  - **Standalone Offline HTML**: Export a self-contained `.html` file embedding all assets and flip engine for offline viewing anywhere.
  - **`<plif-book>` Web Component**: Drop `<plif-book src="manifest.json"></plif-book>` into any HTML page, WordPress, Webflow, or Shopify site.
  - **Responsive `<iframe>` Snippets**: Copy-paste responsive iframe embed code ready for any web editor.
  - **Manifest JSON Export**: Download standard `manifest.json` for custom integration.

---

## 📦 Monorepo Structure

```
plif/
├── packages/
│   ├── core/      # Pure domain logic: schemas, manifest builder, themes, presets, export generators
│   └── reader/    # React <Flipbook> wrapper, <ReaderToolbar>, and <plif-book> custom element
└── apps/
    └── web/       # Web application with <CreatorWizard>, PageOrganizer, and PDF/image pipeline
```

- **[`@plif/core`](packages/core)**: Framework-agnostic pure logic, Zod manifest validation, order manipulation, zoom math, hash parsing, and HTML/embed generators.
- **[`@plif/reader`](packages/reader)**: React component library and standalone web component bundle (`dist/index.js` and `dist/plif-book.js`).
- **[`@plif/web`](apps/web)**: Interactive creator studio built with React and Vite.

---

## 🛠️ Quick Start

### Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io) >= 9

### Install & Run

```bash
# Clone repository
git clone https://github.com/ezykl/plif.git
cd plif

# Install dependencies
pnpm install

# Start local development server
pnpm --filter @plif/web dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & Testing

Plif is tested with strict TypeScript, ESLint, Prettier, and Vitest.

```bash
# Run all workspace test suites (135 tests)
pnpm test

# Typecheck all packages
pnpm typecheck

# Lint and check code style
pnpm lint

# Build production bundles
pnpm --filter @plif/reader build
pnpm --filter @plif/web build
```

---

## 🌐 Embedding in External Websites

### Using the `<plif-book>` Web Component

Include the script and place the custom element anywhere in your HTML:

```html
<script type="module" src="https://unpkg.com/@plif/reader/dist/plif-book.js"></script>

<plif-book
  src="https://example.com/my-book/manifest.json"
  theme="magazine"
  direction="ltr"
  style="width: 100%; height: 600px; display: block;"
></plif-book>
```

### Using an `<iframe>`

```html
<iframe
  src="https://plif.app/b/demo"
  title="My Flipbook"
  style="width: 100%; aspect-ratio: 16 / 9; border: none; border-radius: 8px;"
  allow="fullscreen"
  loading="lazy"
></iframe>
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for conventional commit guidelines and development workflows.

---

## 📄 License

[MIT](LICENSE)
