/**
 * Helpers for generating clean, self-contained, responsive vector SVGs.
 */

export const PAGE_WIDTH = 480;
export const PAGE_HEIGHT = 679;

export function svgWrap(content: string, bg: string = "#ffffff"): string {
  const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}"><rect width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" fill="${bg}"/>${content}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
