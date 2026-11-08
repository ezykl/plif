import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseManifest } from "@plif/core";
import { ReaderToolbar } from "./ReaderToolbar";

afterEach(() => cleanup());

const manifest = parseManifest({
  version: 1,
  title: "Issue 1",
  pageSize: { width: 480, height: 679 },
  toc: [
    { title: "Cover Story", page: 1 },
    { title: "Editorial", page: 3 },
  ],
  pages: [
    { src: "p1.webp", alt: "Page 1" },
    { src: "p2.webp", alt: "Page 2" },
    { src: "p3.webp", alt: "Page 3" },
    { src: "p4.webp", alt: "Page 4" },
  ],
});

describe("<ReaderToolbar>", () => {
  it("navigates with the page slider, displays the page label, and omits redundant Prev/Next buttons", () => {
    const onGoToPage = vi.fn();

    render(
      <ReaderToolbar
        manifest={manifest}
        currentIndex={1}
        zoom={1}
        isFullscreen={false}
        onGoToPage={onGoToPage}
        onChangeZoom={vi.fn()}
        onToggleFullscreen={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
    expect(screen.getByText("2–3 / 4")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Go to page"), {
      target: { value: "3" },
    });
    expect(onGoToPage).toHaveBeenCalledWith(2);
  });

  it("controls zoom in, zoom out, reset zoom, and fullscreen", () => {
    const onChangeZoom = vi.fn();
    const onToggleFullscreen = vi.fn();

    render(
      <ReaderToolbar
        manifest={manifest}
        currentIndex={0}
        zoom={1.25}
        isFullscreen={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoToPage={vi.fn()}
        onChangeZoom={onChangeZoom}
        onToggleFullscreen={onToggleFullscreen}
      />,
    );

    expect(screen.getByText("125%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onChangeZoom).toHaveBeenCalledWith(1.5);

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(onChangeZoom).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(onChangeZoom).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Enter fullscreen" }));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it("toggles Table of Contents and Page Thumbnails drawers to jump to pages", () => {
    const onGoToPage = vi.fn();

    render(
      <ReaderToolbar
        manifest={manifest}
        currentIndex={0}
        zoom={1}
        isFullscreen={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoToPage={onGoToPage}
        onChangeZoom={vi.fn()}
        onToggleFullscreen={vi.fn()}
      />,
    );

    const tocToggleBtn = screen.getByRole("button", { name: "Table of contents" });
    expect(tocToggleBtn.style.minHeight).toBe("44px");
    fireEvent.click(tocToggleBtn);

    const editorialBtn = screen.getByRole("button", { name: /Editorial/i });
    expect(editorialBtn.style.minHeight).toBe("44px");
    fireEvent.click(editorialBtn);
    expect(onGoToPage).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: "Page thumbnails" }));
    fireEvent.click(screen.getByRole("button", { name: "Thumbnail page 4" }));
    expect(onGoToPage).toHaveBeenCalledWith(3);
  });

  it("renders sound toggle button when onToggleSound is provided with sound enabled", () => {
    const onToggleSound = vi.fn();

    render(
      <ReaderToolbar
        manifest={manifest}
        currentIndex={0}
        zoom={1}
        isFullscreen={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoToPage={vi.fn()}
        onChangeZoom={vi.fn()}
        onToggleFullscreen={vi.fn()}
        soundEnabled={true}
        onToggleSound={onToggleSound}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Mute paper flip sound (press M)",
    });
    expect(button).toBeTruthy();
    expect(screen.getByText("Sound on")).toBeTruthy();

    fireEvent.click(button);
    expect(onToggleSound).toHaveBeenCalledTimes(1);
  });

  it("renders sound toggle button with sound disabled", () => {
    const onToggleSound = vi.fn();

    render(
      <ReaderToolbar
        manifest={manifest}
        currentIndex={0}
        zoom={1}
        isFullscreen={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoToPage={vi.fn()}
        onChangeZoom={vi.fn()}
        onToggleFullscreen={vi.fn()}
        soundEnabled={false}
        onToggleSound={onToggleSound}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Enable paper flip sound (press M)",
    });
    expect(button).toBeTruthy();
    expect(screen.getByText("Sound off")).toBeTruthy();

    fireEvent.click(button);
    expect(onToggleSound).toHaveBeenCalledTimes(1);
  });

  it("omits sound toggle button when onToggleSound is not provided", () => {
    render(
      <ReaderToolbar
        manifest={manifest}
        currentIndex={0}
        zoom={1}
        isFullscreen={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoToPage={vi.fn()}
        onChangeZoom={vi.fn()}
        onToggleFullscreen={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /paper flip sound/i,
      }),
    ).toBeNull();
  });
});
