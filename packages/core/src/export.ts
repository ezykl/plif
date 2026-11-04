import type { Manifest } from "./manifest";

export interface IframeEmbedOptions {
  src: string;
  title?: string;
  width?: number | string;
  height?: number | string;
}

export interface WebComponentEmbedOptions {
  manifestUrl: string;
  scriptUrl?: string;
}

export function generateIframeEmbed(options: IframeEmbedOptions): string {
  const width = options.width ?? "100%";
  const height = options.height ?? "600px";
  const title = options.title ? ` title="${options.title.replace(/"/g, "&quot;")}"` : "";

  return `<iframe src="${options.src}" width="${width}" height="${height}"${title} style="border: 0; max-width: 100%; border-radius: 8px;" allow="fullscreen" allowfullscreen></iframe>`;
}

export function generateWebComponentEmbed(options: WebComponentEmbedOptions): string {
  const scriptUrl = options.scriptUrl ?? "https://unpkg.com/@plif/reader/dist/plif-book.js";
  return `<script type="module" src="${scriptUrl}"></script>\n<plif-book src="${options.manifestUrl}" style="width: 100%; min-height: 600px; display: block;"></plif-book>`;
}

export function generateStandaloneHtml(manifest: Manifest): string {
  const manifestJson = JSON.stringify(manifest, null, 2);
  const escapedManifest = manifestJson.replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en" dir="${manifest.direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${manifest.title.replace(/</g, "&lt;")}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #18181b;
      color: #f4f4f5;
      padding: 16px;
    }
    #book-container {
      width: min(960px, 94vw);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>
</head>
<body>
  <div id="book-container">
    <div id="flipbook" class="st-page-flip"></div>
  </div>
  <script id="plif-manifest" type="application/json">
${escapedManifest}
  </script>
  <script>
    (function() {
      var manifest = JSON.parse(document.getElementById('plif-manifest').textContent);
      var container = document.getElementById('flipbook');
      if (!window.St || !window.St.PageFlip) return;
      var flip = new window.St.PageFlip(container, {
        width: manifest.pageSize.width,
        height: manifest.pageSize.height,
        showCover: manifest.hasCover,
        size: 'stretch',
        minWidth: 320,
        maxWidth: 1200,
        minHeight: 400,
        maxHeight: 1600,
        usePortrait: true,
        drawShadow: true,
        flippingTime: 700
      });
      flip.loadFromImages(manifest.pages.map(function(p) { return p.src; }));
      manifest.pages.forEach(function(p, i) {
        if (p.density) {
          var page = flip.getPage(i);
          if (page && page.setDensity) page.setDensity(p.density);
        }
      });
    })();
  </script>
</body>
</html>`;
}
