import { bookDirectionSchema, bookThemeSchema, parseManifest, type Manifest } from "@plif/core";
import { PageFlip } from "page-flip";
import { toFlipSettings } from "./settings";

export class PlifBookElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["src", "theme", "direction"];
  }

  private _container: HTMLDivElement | null = null;
  private _flip: PageFlip | null = null;
  private _currentSrc: string | null = null;
  private _manifest: Manifest | null = null;

  connectedCallback(): void {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.style.width = "100%";
      this._container.style.height = "100%";
      this._container.style.display = "flex";
      this._container.style.justifyContent = "center";
      this._container.style.alignItems = "center";
      this.appendChild(this._container);
    }

    const src = this.getAttribute("src");
    if (src && src !== this._currentSrc) {
      void this.loadFromUrl(src);
    }
  }

  disconnectedCallback(): void {
    if (this._flip) {
      this._flip.destroy();
      this._flip = null;
    }
    if (this._container && this.contains(this._container)) {
      this.removeChild(this._container);
      this._container = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === "src" && newValue && newValue !== this._currentSrc) {
      void this.loadFromUrl(newValue);
    } else if ((name === "theme" || name === "direction") && this._manifest) {
      this.renderManifest(this._manifest);
    }
  }

  async loadFromUrl(url: string): Promise<void> {
    this._currentSrc = url;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data: unknown = await res.json();
      const manifest = parseManifest(data);
      this.renderManifest(manifest);
    } catch {
      // Graceful error handling for offline/invalid url
    }
  }

  /** Element attributes take precedence over the manifest; invalid values are ignored. */
  private applyAttributeOverrides(manifest: Manifest): Manifest {
    const theme = bookThemeSchema.safeParse(this.getAttribute("theme"));
    const direction = bookDirectionSchema.safeParse(this.getAttribute("direction"));
    return {
      ...manifest,
      ...(theme.success ? { theme: theme.data } : {}),
      ...(direction.success ? { direction: direction.data } : {}),
    };
  }

  renderManifest(source: Manifest): void {
    this._manifest = source;
    if (!this._container) return;
    const manifest = this.applyAttributeOverrides(source);
    if (this._flip) {
      this._flip.destroy();
      this._flip = null;
    }
    this._container.innerHTML = "";
    this._container.dir = manifest.direction;
    const bookHost = document.createElement("div");
    this._container.appendChild(bookHost);

    const reduceMotion =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const flip = new PageFlip(bookHost, toFlipSettings(manifest, { reduceMotion }));
    flip.loadFromImages(manifest.pages.map((p) => p.src));
    manifest.pages.forEach((p, idx) => {
      if (p.density) {
        flip.getPage(idx)?.setDensity(p.density);
      }
    });
    this._flip = flip;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("plif-book")) {
  customElements.define("plif-book", PlifBookElement);
}
