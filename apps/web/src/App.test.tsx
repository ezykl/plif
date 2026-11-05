import { forwardRef, useImperativeHandle } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FlipbookHandle, FlipbookProps } from "@plif/reader";

vi.mock("@plif/reader", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@plif/reader")>();
  return {
    ...actual,
    Flipbook: forwardRef<FlipbookHandle, FlipbookProps>(function FlipbookMock(
      { manifest, onPageChange, zoom = 1 },
      ref,
    ) {
      useImperativeHandle(ref, () => ({
        next: () => onPageChange?.(1),
        prev: () => onPageChange?.(0),
        goTo: (idx: number) => onPageChange?.(idx),
      }));
      return (
        <div
          role="region"
          aria-label={manifest.title}
          dir={manifest.direction}
          data-zoom={String(zoom)}
        />
      );
    }),
  };
});

import { App } from "./App";

afterEach(() => {
  window.location.hash = "";
  cleanup();
});

describe("<App>", () => {
  it("switches wizard steps, applies presets/themes, and updates the live Flipbook stage", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Sample Magazine" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));

    fireEvent.change(screen.getByLabelText("Book title"), {
      target: { value: "The Campus Chronicle" },
    });
    expect(screen.getByRole("heading", { name: "The Campus Chronicle" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Preset: Newspaper/i }));
    expect(screen.getByText("1–2 / 12")).toBeTruthy();
  });

  it("zooms, jumps via Table of Contents, and syncs #/page/N deep links", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("125%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Table of contents" }));
    fireEvent.click(screen.getByRole("button", { name: /Campus News/i }));
    expect(window.location.hash).toBe("#/page/3");
  });

  it("initializes to page 5 when window.location.hash is set to #/page/5 on cold load", () => {
    window.location.hash = "#/page/5";
    render(<App />);
    expect(screen.getByText("4–5 / 12")).toBeTruthy();
  });

  it("navigates to publish step and renders standalone download and embed tools", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "3. Preview & Publish" }));

    expect(screen.getByRole("button", { name: "Download Standalone HTML" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Manifest JSON" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy Embed Code" })).toBeTruthy();
    expect(screen.getByText(/<iframe src=/i)).toBeTruthy();
  });

  it("renders stationery header with book logo, edition badge, and mode indicator", () => {
    render(<App />);

    expect(screen.getByRole("img", { name: "Book logo" })).toBeTruthy();
    expect(screen.getByText(/Plif Flipbook Studio • Magazine Edition/i)).toBeTruthy();
    expect(screen.getByText(/Cover \+ Spread Mode • LTR/i)).toBeTruthy();
  });
});
