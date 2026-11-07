import type { Manifest } from "@plif/core";

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read blob as data URL"));
    };
    reader.onerror = () => reject(new Error("Failed to read blob as data URL"));
    reader.readAsDataURL(blob);
  });
}

/** Converts session-scoped `blob:` URLs to self-contained `data:` URLs; other URLs pass through. */
export async function blobUrlToDataUrl(url: string): Promise<string> {
  if (!url.startsWith("blob:")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to read page image: ${url}`);
  return readAsDataUrl(await res.blob());
}

/** Returns a copy of the manifest whose page sources are all portable (no `blob:` URLs). */
export async function inlineManifestPages(manifest: Manifest): Promise<Manifest> {
  const pages = await Promise.all(
    manifest.pages.map(async (page) => ({ ...page, src: await blobUrlToDataUrl(page.src) })),
  );
  return { ...manifest, pages };
}
