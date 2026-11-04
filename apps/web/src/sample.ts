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
  toc: [
    { title: "Front Cover", page: 1 },
    { title: "Campus News", page: 3 },
    { title: "Back Cover", page: 12 },
  ],
  pages: Array.from({ length: TOTAL }, (_, i) => ({
    src: samplePage(i + 1, TOTAL),
    alt: `Page ${i + 1}`,
  })),
});
