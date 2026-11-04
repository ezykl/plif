import { useEffect, useRef, useState } from "react";
import { generateIframeEmbed, generateWebComponentEmbed, THEMES, type Manifest } from "@plif/core";

export interface PublishPanelProps {
  manifest: Manifest;
  onDownloadHtml: () => void;
  onDownloadManifest: () => void;
  publishUrl?: string;
  manifestUrl?: string;
}

export function PublishPanel({
  manifest,
  onDownloadHtml,
  onDownloadManifest,
  publishUrl = typeof window !== "undefined" ? window.location.href : "https://plif.app/b/demo",
  manifestUrl = typeof window !== "undefined"
    ? `${window.location.origin}/manifest.json`
    : "https://plif.app/b/demo/manifest.json",
}: PublishPanelProps) {
  const [embedType, setEmbedType] = useState<"iframe" | "web-component">("iframe");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const themeTokens = THEMES[manifest.theme];

  const iframeCode = generateIframeEmbed({
    src: publishUrl,
    title: manifest.title,
  });

  const webComponentCode = generateWebComponentEmbed({
    manifestUrl,
  });

  const currentCode = embedType === "iframe" ? iframeCode : webComponentCode;

  const handleCopy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentCode);
        setCopied(true);
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore or handle clipboard failure
      }
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        padding: 16,
        background: "#ffffff",
        borderRadius: 8,
        border: "1px solid #e7e5e4",
        color: "#1c1917",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Export & Embed</h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#78716c" }}>
            Download a portable offline flipbook or embed this book into any website.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={onDownloadHtml}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "none",
              background: themeTokens.accentColor,
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Download Standalone HTML
          </button>
          <button
            type="button"
            onClick={onDownloadManifest}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #d6d3d1",
              background: "#ffffff",
              color: "#1c1917",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Download Manifest JSON
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div role="tablist" aria-label="Embed options" style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            role="tab"
            id="iframe-tab"
            aria-selected={embedType === "iframe"}
            aria-controls="embed-panel"
            onClick={() => setEmbedType("iframe")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: embedType === "iframe" ? "2px solid #1c1917" : "1px solid #d6d3d1",
              background: embedType === "iframe" ? "#f5f5f4" : "#ffffff",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Iframe Snippet
          </button>
          <button
            type="button"
            role="tab"
            id="webcomponent-tab"
            aria-selected={embedType === "web-component"}
            aria-controls="embed-panel"
            onClick={() => setEmbedType("web-component")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: embedType === "web-component" ? "2px solid #1c1917" : "1px solid #d6d3d1",
              background: embedType === "web-component" ? "#f5f5f4" : "#ffffff",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Web Component
          </button>
        </div>

        <div
          role="tabpanel"
          id="embed-panel"
          aria-labelledby={embedType === "iframe" ? "iframe-tab" : "webcomponent-tab"}
          style={{ position: "relative" }}
        >
          <pre
            style={{
              margin: 0,
              padding: 12,
              background: "#18181b",
              color: "#f4f4f5",
              borderRadius: 6,
              fontSize: 12,
              overflowX: "auto",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            <code>{currentCode}</code>
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy Embed Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
