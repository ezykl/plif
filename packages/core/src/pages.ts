export function visiblePages(
  index: number,
  total: number,
  hasCover: boolean,
  portrait: boolean,
): number[] {
  if (portrait) return [index];

  const left = hasCover
    ? index === 0
      ? 0
      : index % 2 === 1
        ? index
        : index - 1
    : index - (index % 2);

  if (hasCover && left === 0) return [0];
  if (left + 1 < total) return [left, left + 1];
  return [left];
}

export function formatPageLabel(
  index: number,
  total: number,
  hasCover: boolean,
  portrait: boolean,
): string {
  const pages = visiblePages(index, total, hasCover, portrait).map((i) => i + 1);
  const first = Math.min(...pages);
  const last = Math.max(...pages);
  const range = first === last ? `${first}` : `${first}–${last}`;
  return `${range} / ${total}`;
}
