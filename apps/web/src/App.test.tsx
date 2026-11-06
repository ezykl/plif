import { forwardRef, useImperativeHandle } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FlipbookHandle, FlipbookProps } from "@plif/reader";

vi.mock("@plif/reader", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@plif/reader")>();
  return {
    ...actual,
    Flipbook: forwardRef<FlipbookHandle, FlipbookProps>(function FlipbookMock(
      { manifest, onPageChange, zoom = 1, soundEnabled },
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
          data-sound-enabled={String(soundEnabled ?? true)}
        />
      );
    }),
  };
});

import { App } from "./App";

afterEach(() => {
  window.location.hash = "";
  localStorage.clear();
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

    fireEvent.click(screen.getByRole("tab", { name: "<plif-book> Web Component" }));
    expect(screen.getByText(/<plif-book src=/i)).toBeTruthy();
  });

  it("renders stationery header with book logo, edition badge, and mode indicator", () => {
    render(<App />);

    expect(screen.getByRole("img", { name: "Book logo" })).toBeTruthy();
    expect(screen.getByText(/Plif Flipbook Studio • Magazine Edition/i)).toBeTruthy();
    expect(screen.getByText(/Cover \+ Spread Mode • LTR/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));
    fireEvent.click(screen.getByRole("button", { name: /Preset: Newspaper/i }));
    expect(screen.getByText(/Plif Flipbook Studio • Newsprint Edition/i)).toBeTruthy();
    expect(screen.getByText(/Newspaper Spread Mode • LTR/i)).toBeTruthy();
  });

  it("clicking the toolbar sound toggle button toggles soundEnabled and updates localStorage", () => {
    render(<App />);

    const flipbook = screen.getByRole("region", { name: "Sample Magazine" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("true");

    const soundToggle = screen.getByRole("button", {
      name: /Mute paper flip sound \(press M\)/i,
    });
    expect(soundToggle).toBeTruthy();

    fireEvent.click(soundToggle);
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("false");
    expect(localStorage.getItem("plif_sound_enabled")).toBe("false");
    expect(
      screen.getByRole("button", { name: /Enable paper flip sound \(press M\)/i }),
    ).toBeTruthy();

    fireEvent.click(soundToggle);
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("true");
    expect(localStorage.getItem("plif_sound_enabled")).toBe("true");
    expect(screen.getByRole("button", { name: /Mute paper flip sound \(press M\)/i })).toBeTruthy();
  });

  it("initializes soundEnabled to false when localStorage plif_sound_enabled is 'false'", () => {
    localStorage.setItem("plif_sound_enabled", "false");
    render(<App />);

    const flipbook = screen.getByRole("region", { name: "Sample Magazine" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("false");
    expect(
      screen.getByRole("button", { name: /Enable paper flip sound \(press M\)/i }),
    ).toBeTruthy();
  });

  it("pressing M on the document toggles sound, but pressing M inside the book title input does not toggle sound", () => {
    render(<App />);

    const flipbook = screen.getByRole("region", { name: "Sample Magazine" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("true");

    // Pressing 'm' on document toggles sound off
    fireEvent.keyDown(document, { key: "m" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("false");
    expect(localStorage.getItem("plif_sound_enabled")).toBe("false");

    // Pressing 'M' on document toggles sound back on
    fireEvent.keyDown(document, { key: "M" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("true");
    expect(localStorage.getItem("plif_sound_enabled")).toBe("true");

    // Switch to step where book title input is present
    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));
    const titleInput = screen.getByLabelText("Book title");
    titleInput.focus();

    // Pressing 'm' inside input does NOT toggle sound
    fireEvent.keyDown(titleInput, { key: "m" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("true");
    expect(localStorage.getItem("plif_sound_enabled")).toBe("true");

    // Pressing 'M' inside input does NOT toggle sound
    fireEvent.keyDown(titleInput, { key: "M" });
    expect(flipbook.getAttribute("data-sound-enabled")).toBe("true");
    expect(localStorage.getItem("plif_sound_enabled")).toBe("true");
  });

  it("displays tactile offline badge when offline event is fired and removes it on online event", () => {
    render(<App />);

    expect(screen.queryByRole("status")).toBeNull();

    fireEvent(window, new Event("offline"));
    const statusBadge = screen.getByRole("status");
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent).toMatch(/Offline Mode/i);

    fireEvent(window, new Event("online"));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
