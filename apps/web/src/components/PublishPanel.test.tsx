import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseManifest } from "@plif/core";
import { PublishPanel } from "./PublishPanel";

afterEach(() => cleanup());

const manifest = parseManifest({
  version: 1,
  title: "School Paper",
  pageSize: { width: 480, height: 679 },
  hasCover: true,
  theme: "magazine",
  direction: "ltr",
  toc: [{ title: "Cover Story", page: 1 }],
  pages: [{ src: "p1.webp" }, { src: "p2.webp" }],
});

describe("<PublishPanel>", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("triggers HTML and Manifest downloads", () => {
    const onDownloadHtml = vi.fn();
    const onDownloadManifest = vi.fn();

    render(
      <PublishPanel
        manifest={manifest}
        onDownloadHtml={onDownloadHtml}
        onDownloadManifest={onDownloadManifest}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Download Standalone HTML" }));
    expect(onDownloadHtml).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Download Manifest JSON" }));
    expect(onDownloadManifest).toHaveBeenCalledTimes(1);
  });

  it("switches embed tabs and copies code to clipboard", async () => {
    render(
      <PublishPanel manifest={manifest} onDownloadHtml={vi.fn()} onDownloadManifest={vi.fn()} />,
    );

    expect(screen.getByText(/<iframe src=/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Copy Embed Code" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("tab", { name: "Web Component" }));
    expect(screen.getByText(/<plif-book src=/i)).toBeTruthy();
  });
});
