/**
 * Generates a unique page id. `crypto.randomUUID` only exists in secure contexts
 * (HTTPS or localhost), so fall back for LAN/IP testing over plain HTTP.
 */
export function generatePageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
