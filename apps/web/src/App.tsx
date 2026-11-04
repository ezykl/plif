import { useMemo, useRef, useState } from "react";
import { buildManifest, formatPageLabel, type ImportedPage } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "@plif/reader";
import { PageOrganizer } from "./components/PageOrganizer";
import { importFiles } from "./import";
import { sampleManifest } from "./sample";

export function App() {
  const book = useRef<FlipbookHandle>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState<ImportedPage[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activeManifest = useMemo(() => {
    if (pages.length === 0) return sampleManifest;
    return buildManifest({
      title: "Imported Book",
      hasCover: true,
      pages,
    });
  }, [pages]);

  const total = activeManifest.pages.length;

  const handleUploadFiles = async (files: File[]) => {
    setIsImporting(true);
    setErrorText(null);
    setProgressText("Importing files...");
    try {
      const imported = await importFiles(files, {
        onProgress: (cur, max) => setProgressText(`Rendering PDF page ${cur} / ${max}...`),
      });
      setPages((prev) => [...prev, ...imported]);
      setIndex(0);
      setProgressText(null);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Failed to import files");
      setProgressText(null);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        gap: 16,
        padding: "24px 0",
      }}
    >
      <PageOrganizer
        pages={pages}
        isImporting={isImporting}
        progressText={progressText}
        errorText={errorText}
        onUploadFiles={handleUploadFiles}
        onChangePages={(next) => {
          setPages(next);
          setIndex(0);
        }}
      />
      <Flipbook ref={book} manifest={activeManifest} onPageChange={setIndex} />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => book.current?.prev()}>Previous</button>
        <span>{formatPageLabel(index, total, activeManifest.hasCover, false)}</span>
        <button onClick={() => book.current?.next()}>Next</button>
      </div>
    </main>
  );
}
