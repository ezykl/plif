export function visiblePages(
  index: number,
  total: number,
  hasCover: boolean,
  portrait: boolean,
): number[] {
  if (portrait) return [index];
  if (hasCover && index === 0) return [0];
  if (index + 1 < total) return [index, index + 1];
  return [index];
}

export function formatPageLabel(
  index: number,
  total: number,
  hasCover: boolean,
  portrait: boolean,
): string {
  const pages = visiblePages(index, total, hasCover, portrait).map((i) => i + 1);
  const first = pages[0];
  const last = pages[pages.length - 1];
  const range = first === last ? `${first}` : `${first}–${last}`;
  return `${range} / ${total}`;
}
