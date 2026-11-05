import { useEffect, useRef, useState } from "react";
import { generateIframeEmbed, generateWebComponentEmbed, type Manifest } from "@plif/core";

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
        gap: 20,
        padding: 24,
        background: "#fdfbf7",
        borderRadius: 12,
        border: "1px solid #e6dfd5",
        color: "#24201d",
        boxShadow: "0 2px 8px rgba(36, 32, 29, 0.04)",
      }}
    >
      {/* Panel Heading */}
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
            color: "#24201d",
          }}
        >
          Export & Embed
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b635b" }}>
          Download a portable offline publication or integrate your flipbook directly into any
          website.
        </p>
      </div>

      {/* Export Options Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {/* Primary Card: Standalone HTML */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #c25e3e",
            borderRadius: 10,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
            boxShadow: "0 4px 12px rgba(194, 94, 62, 0.08)",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#24201d" }}>
                Standalone Flipbook HTML
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                }}
              >
                Recommended • 100% Offline
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#6b635b", lineHeight: 1.5 }}>
              Self-contained file with embedded images and flip engine. Works completely offline in
              any web browser with zero server dependencies.
            </p>
          </div>
          <button
            type="button"
            onClick={onDownloadHtml}
            style={{
              minHeight: 44,
              minWidth: 44,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#c25e3e",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(194, 94, 62, 0.2)",
              transition: "background 0.15s ease",
            }}
          >
            Download Standalone HTML
          </button>
        </div>

        {/* Secondary Card: Manifest JSON */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e6dfd5",
            borderRadius: 10,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
            boxShadow: "0 2px 6px rgba(36, 32, 29, 0.03)",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#24201d" }}>
                Book Manifest JSON
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "#f5efe6",
                  color: "#6b635b",
                  border: "1px solid #e6dfd5",
                }}
              >
                Headless & Developer
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#6b635b", lineHeight: 1.5 }}>
              Pure JSON configuration referencing hosted assets. Ideal for headless CMS pipelines
              and custom reader implementations.
            </p>
          </div>
          <button
            type="button"
            onClick={onDownloadManifest}
            style={{
              minHeight: 44,
              minWidth: 44,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid #d6ccc2",
              background: "#ffffff",
              color: "#24201d",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "border-color 0.15s ease",
            }}
          >
            Download Manifest JSON
          </button>
        </div>
      </div>

      {/* Embed Code Snippets */}
      <div style={{ display: "grid", gap: 10 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div role="tablist" aria-label="Embed options" style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              role="tab"
              id="iframe-tab"
              aria-selected={embedType === "iframe"}
              aria-controls="embed-panel"
              onClick={() => setEmbedType("iframe")}
              style={{
                minHeight: 44,
                padding: "8px 16px",
                borderRadius: 8,
                border: embedType === "iframe" ? "2px solid #c25e3e" : "1px solid #e6dfd5",
                background: embedType === "iframe" ? "#c25e3e" : "#ffffff",
                color: embedType === "iframe" ? "#ffffff" : "#24201d",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Responsive &lt;iframe&gt;
            </button>
            <button
              type="button"
              role="tab"
              id="webcomponent-tab"
              aria-selected={embedType === "web-component"}
              aria-controls="embed-panel"
              onClick={() => setEmbedType("web-component")}
              style={{
                minHeight: 44,
                padding: "8px 16px",
                borderRadius: 8,
                border: embedType === "web-component" ? "2px solid #c25e3e" : "1px solid #e6dfd5",
                background: embedType === "web-component" ? "#c25e3e" : "#ffffff",
                color: embedType === "web-component" ? "#ffffff" : "#24201d",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              &lt;plif-book&gt; Web Component
            </button>
          </div>
          <span style={{ fontSize: 12, color: "#6b635b" }}>
            Works in WordPress, Webflow, Squarespace, Ghost, Notion, and vanilla HTML.
          </span>
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
              padding: "16px 20px",
              background: "#1f1d1b",
              color: "#fdfbf7",
              borderRadius: 8,
              fontSize: 13,
              overflowX: "auto",
              fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              lineHeight: 1.6,
              border: "1px solid #2e2a27",
            }}
          >
            <code>{currentCode}</code>
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              minHeight: 44,
              minWidth: 44,
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid rgba(255, 255, 255, 0.25)",
              background: copied ? "#3e6b5c" : "rgba(255, 255, 255, 0.14)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            {copied ? "Copied!" : "Copy Embed Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
