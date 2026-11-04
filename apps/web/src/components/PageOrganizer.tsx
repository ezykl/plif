import { useState, type ChangeEvent, type DragEvent } from "react";
import { movePage, removePage, setPageDensity, type ImportedPage } from "@plif/core";

export interface PageOrganizerProps {
  pages: readonly ImportedPage[];
  isImporting?: boolean;
  progressText?: string | null;
  errorText?: string | null;
  onUploadFiles: (files: File[]) => void;
  onChangePages: (pages: ImportedPage[]) => void;
}

export function PageOrganizer({
  pages,
  isImporting = false,
  progressText = null,
  errorText = null,
  onUploadFiles,
  onChangePages,
}: PageOrganizerProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length > 0) {
      onUploadFiles(list);
      e.target.value = "";
    }
  };

  const handleFileDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (isImporting) return;
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (list.length > 0) {
      onUploadFiles(list);
    }
  };

  return (
    <section
      aria-label="Page organizer"
      style={{
        width: "min(960px, 92vw)",
        display: "grid",
        gap: 12,
        padding: 16,
        border: "1px solid #d6d3d1",
        borderRadius: 8,
        background: "#fafaf9",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            border: "1px dashed #78716c",
            borderRadius: 6,
            cursor: isImporting ? "wait" : "pointer",
            background: "#ffffff",
            fontWeight: 600,
          }}
        >
          <span>Upload PDF or Images</span>
          <input
            type="file"
            accept="application/pdf,image/*"
            multiple
            disabled={isImporting}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {progressText && (
          <span role="status" style={{ fontSize: 14, color: "#44403c" }}>
            {progressText}
          </span>
        )}
        {errorText && (
          <span role="alert" style={{ fontSize: 14, color: "#b91c1c" }}>
            {errorText}
          </span>
        )}
      </div>

      {pages.length > 0 && (
        <ol
          aria-label="Imported pages"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {pages.map((page, i) => {
            const pageNum = i + 1;
            const isHard = page.density === "hard";
            return (
              <li
                key={page.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== i) {
                    onChangePages(movePage(pages, dragIndex, i));
                  }
                  setDragIndex(null);
                }}
                style={{
                  border: "1px solid #e7e5e4",
                  borderRadius: 6,
                  padding: 8,
                  background: "#ffffff",
                  display: "grid",
                  gap: 6,
                }}
              >
                <img
                  src={page.src}
                  alt={page.alt ?? `Page ${pageNum}`}
                  style={{
                    width: "100%",
                    aspectRatio: `${page.width} / ${page.height}`,
                    objectFit: "cover",
                    borderRadius: 4,
                    background: "#f5f5f4",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span>#{pageNum}</span>
                  <span>{isHard ? "Hard" : "Soft"}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    aria-label={`Move page ${pageNum} left`}
                    disabled={i === 0}
                    onClick={() => onChangePages(movePage(pages, i, i - 1))}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label={`Move page ${pageNum} right`}
                    disabled={i === pages.length - 1}
                    onClick={() => onChangePages(movePage(pages, i, i + 1))}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label={`Toggle hard cover for page ${pageNum}`}
                    onClick={() =>
                      onChangePages(setPageDensity(pages, i, isHard ? "soft" : "hard"))
                    }
                  >
                    {isHard ? "Soft" : "Hard"}
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove page ${pageNum}`}
                    onClick={() => onChangePages(removePage(pages, i))}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
