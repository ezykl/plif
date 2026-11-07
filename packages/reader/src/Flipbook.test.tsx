import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseManifest } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "./Flipbook";

const { instance, PageFlipMock, playPaperTurnSoundMock } = vi.hoisted(() => {
  const instance = {
    loadFromImages: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
    flipNext: vi.fn(),
    flipPrev: vi.fn(),
    flip: vi.fn(),
    getPage: vi.fn(() => ({ setDensity: vi.fn() })),
  };
  const PageFlipMock = vi.fn(() => instance);
  const playPaperTurnSoundMock = vi.fn();
  return { instance, PageFlipMock, playPaperTurnSoundMock };
});
vi.mock("page-flip", () => ({ PageFlip: PageFlipMock }));
vi.mock("./audio", () => ({
  playPaperTurnSound: playPaperTurnSoundMock,
}));

const manifest = parseManifest({
  version: 1,
  title: "T",
  pageSize: { width: 480, height: 679 },
  pages: [{ src: "a.webp" }, { src: "b.webp", density: "hard" }],
});

beforeEach(() => {
  vi.clearAllMocks();
  instance.getPage.mockReturnValue({ setDensity: vi.fn() });
});

describe("<Flipbook>", () => {
  it("creates the engine and loads page images", () => {
    render(<Flipbook manifest={manifest} />);
    expect(PageFlipMock).toHaveBeenCalledTimes(1);
    expect(instance.loadFromImages).toHaveBeenCalledWith(["a.webp", "b.webp"]);
  });

  it("applies per-page density from the manifest", () => {
    const setDensity = vi.fn();
    instance.getPage.mockReturnValueOnce({ setDensity });
    render(<Flipbook manifest={manifest} />);
    expect(instance.getPage).toHaveBeenCalledWith(1);
    expect(setDensity).toHaveBeenCalledWith("hard");
  });

  it("detects prefers-reduced-motion when prop is omitted", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      render(<Flipbook manifest={manifest} />);
      expect(PageFlipMock).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          flippingTime: 1,
          drawShadow: false,
        }),
      );
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("reports page changes", () => {
    const onPageChange = vi.fn();
    render(<Flipbook manifest={manifest} onPageChange={onPageChange} />);
    const call = instance.on.mock.calls.find(([name]) => name === "flip");
    call?.[1]({ data: 1 });
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("plays paper turn sound on page flips when enabled", () => {
    render(<Flipbook manifest={manifest} />);
    const call = instance.on.mock.calls.find(([name]) => name === "flip");
    call?.[1]({ data: 1 });
    expect(playPaperTurnSoundMock).toHaveBeenCalledTimes(1);
  });

  it("does not play paper turn sound when soundEnabled is false", () => {
    render(<Flipbook manifest={manifest} soundEnabled={false} />);
    const call = instance.on.mock.calls.find(([name]) => name === "flip");
    call?.[1]({ data: 1 });
    expect(playPaperTurnSoundMock).not.toHaveBeenCalled();
  });

  it("does not play paper turn sound when reduceMotion is true", () => {
    render(<Flipbook manifest={manifest} reduceMotion={true} />);
    const call = instance.on.mock.calls.find(([name]) => name === "flip");
    call?.[1]({ data: 1 });
    expect(playPaperTurnSoundMock).not.toHaveBeenCalled();
  });

  it("destroys the engine on unmount", () => {
    const { unmount } = render(<Flipbook manifest={manifest} />);
    unmount();
    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });

  it("flips with arrow keys", () => {
    const { getByRole } = render(<Flipbook manifest={manifest} />);
    const region = getByRole("region", { name: "T" });
    const rightDispatched = fireEvent.keyDown(region, { key: "ArrowRight" });
    const leftDispatched = fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(rightDispatched).toBe(false);
    expect(leftDispatched).toBe(false);
    expect(instance.flipNext).toHaveBeenCalledTimes(1);
    expect(instance.flipPrev).toHaveBeenCalledTimes(1);
  });

  it("reverses arrow keys when manifest.direction is rtl", () => {
    const rtlManifest = parseManifest({
      version: 1,
      title: "RTL Book",
      direction: "rtl",
      pageSize: { width: 480, height: 679 },
      pages: [{ src: "a.webp" }, { src: "b.webp" }],
    });
    const { getByRole } = render(<Flipbook manifest={rtlManifest} />);
    const region = getByRole("region", { name: "RTL Book" });
    expect(region.getAttribute("dir")).toBe("rtl");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(instance.flipNext).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(instance.flipPrev).toHaveBeenCalledTimes(1);
  });

  it("applies CSS scale transform and 100% width for dual-page spread sizing", () => {
    const { getByRole } = render(<Flipbook manifest={manifest} zoom={1.5} initialPage={1} />);
    const region = getByRole("region", { name: "T" });
    expect(region.style.width).toBe("100%");
    expect(region.style.transform).toBe("scale(1.5)");
    expect(PageFlipMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        startPage: 1,
      }),
    );
  });

  it("exposes an imperative handle", () => {
    const ref = createRef<FlipbookHandle>();
    render(<Flipbook ref={ref} manifest={manifest} />);
    ref.current?.next();
    ref.current?.prev();
    ref.current?.goTo(3);
    expect(instance.flipNext).toHaveBeenCalled();
    expect(instance.flipPrev).toHaveBeenCalled();
    expect(instance.flip).toHaveBeenCalledWith(3);
  });
});
