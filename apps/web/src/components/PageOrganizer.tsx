import { useState, type ChangeEvent, type DragEvent } from "react";
import { movePage, removePage, setPageDensity, type ImportedPage } from "@plif/core";

export interface PageOrganizerProps {
  pages: readonly ImportedPage[];
  hasCover?: boolean;
  isImporting?: boolean;
  progressText?: string | null;
  errorText?: string | null;
  onUploadFiles: (files: File[]) => void;
  onChangePages: (pages: ImportedPage[]) => void;
}

export function PageOrganizer({
  pages,
  hasCover = true,
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
        gap: 16,
        padding: 20,
        border: "1px solid #e6dfd5",
        borderRadius: 10,
        background: "#fdfbf7",
        boxShadow: "0 2px 8px rgba(36, 32, 29, 0.04)",
      }}
    >
      {/* Welcoming Dropzone Area */}
      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          style={{
            display: "grid",
            placeItems: "center",
            gap: 10,
            padding: "24px 20px",
            border: "2px dashed #d6ccc2",
            borderRadius: 8,
            cursor: isImporting ? "wait" : "pointer",
            background: "#ffffff",
            textAlign: "center",
            transition: "border-color 150ms ease, background 150ms ease",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#f5efe6",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
            }}
          >
            📥
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#24201d" }}>
              Upload PDF or Images
            </span>
            <span style={{ fontSize: 13, color: "#6b635b" }}>
              Drag and drop your files here, or click to browse
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {["PDF Document", "PNG", "JPEG", "WebP"].map((fmt) => (
              <span
                key={fmt}
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "#f5efe6",
                  color: "#6b635b",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                {fmt}
              </span>
            ))}
          </div>

          <input
            type="file"
            aria-label="Upload PDF or Images"
            accept="application/pdf,image/*"
            multiple
            disabled={isImporting}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {progressText && (
          <div
            role="status"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#f5efe6",
              border: "1px solid #e6dfd5",
              color: "#3e6b5c",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {progressText}
          </div>
        )}
        {errorText && (
          <div
            role="alert"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {errorText}
          </div>
        )}
      </div>

      {/* Pages Grid */}
      {pages.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 13,
              color: "#6b635b",
            }}
          >
            <span style={{ fontWeight: 600 }}>Imported Pages ({pages.length})</span>
            <span>Drag cards or use arrow buttons to reorder</span>
          </div>

          <ol
            aria-label="Imported pages"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 14,
            }}
          >
            {pages.map((page, i) => {
              const pageNum = i + 1;
              const isHard = page.density === "hard";
              const isFirst = i === 0;
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
                    border: "1px solid #e6dfd5",
                    borderRadius: 8,
                    padding: 10,
                    background: "#ffffff",
                    display: "grid",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(36, 32, 29, 0.06)",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={page.src}
                      alt={page.alt ?? `Page ${pageNum}`}
                      style={{
                        width: "100%",
                        aspectRatio: `${page.width} / ${page.height}`,
                        objectFit: "cover",
                        borderRadius: 6,
                        background: "#f5f5f4",
                        border: "1px solid #e6dfd5",
                      }}
                    />
                    {isFirst && hasCover && (
                      <span
                        style={{
                          position: "absolute",
                          top: 6,
                          left: 6,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "#c25e3e",
                          color: "#ffffff",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Cover
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#24201d",
                    }}
                  >
                    <span>Page #{pageNum}</span>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isHard ? "#24201d" : "#f5efe6",
                        color: isHard ? "#ffffff" : "#6b635b",
                        fontSize: 11,
                      }}
                    >
                      {isHard ? "Hard Paper" : "Soft Paper"}
                    </span>
                  </div>

                  {/* Accessible 44px tap target action buttons */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 6,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Move page ${pageNum} left`}
                      disabled={i === 0}
                      onClick={() => onChangePages(movePage(pages, i, i - 1))}
                      style={{
                        minHeight: 44,
                        minWidth: 44,
                        borderRadius: 6,
                        border: "1px solid #e6dfd5",
                        background: i === 0 ? "#f5efe6" : "#ffffff",
                        color: i === 0 ? "#a8a29e" : "#24201d",
                        cursor: i === 0 ? "not-allowed" : "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label={`Move page ${pageNum} right`}
                      disabled={i === pages.length - 1}
                      onClick={() => onChangePages(movePage(pages, i, i + 1))}
                      style={{
                        minHeight: 44,
                        minWidth: 44,
                        borderRadius: 6,
                        border: "1px solid #e6dfd5",
                        background: i === pages.length - 1 ? "#f5efe6" : "#ffffff",
                        color: i === pages.length - 1 ? "#a8a29e" : "#24201d",
                        cursor: i === pages.length - 1 ? "not-allowed" : "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      aria-label={`Toggle hard cover for page ${pageNum}`}
                      onClick={() =>
                        onChangePages(setPageDensity(pages, i, isHard ? "soft" : "hard"))
                      }
                      style={{
                        minHeight: 44,
                        minWidth: 44,
                        borderRadius: 6,
                        border: "1px solid #e6dfd5",
                        background: "#ffffff",
                        color: "#24201d",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {isHard ? "Set Soft" : "Set Hard"}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove page ${pageNum}`}
                      onClick={() => onChangePages(removePage(pages, i))}
                      style={{
                        minHeight: 44,
                        minWidth: 44,
                        borderRadius: 6,
                        border: "1px solid #fee2e2",
                        background: "#fff5f5",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
