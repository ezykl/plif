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
});
