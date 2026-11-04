import { parseManifest, type Manifest } from "@plif/core";
import { PageFlip } from "page-flip";
import { toFlipSettings } from "./settings";

export class PlifBookElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["src", "theme", "direction"];
  }

  private _container: HTMLDivElement | null = null;
  private _flip: PageFlip | null = null;

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
    if (src) {
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
    if (name === "src" && newValue) {
      void this.loadFromUrl(newValue);
    }
  }

  async loadFromUrl(url: string): Promise<void> {
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

  renderManifest(manifest: Manifest): void {
    if (!this._container) return;
    if (this._flip) {
      this._flip.destroy();
      this._flip = null;
    }
    this._container.innerHTML = "";
    const bookHost = document.createElement("div");
    this._container.appendChild(bookHost);

    const flip = new PageFlip(bookHost, toFlipSettings(manifest, { reduceMotion: false }));
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
