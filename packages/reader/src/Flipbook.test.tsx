import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseManifest } from "@plif/core";
import { Flipbook, type FlipbookHandle } from "./Flipbook";

const { instance, PageFlipMock } = vi.hoisted(() => {
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
  return { instance, PageFlipMock };
});
vi.mock("page-flip", () => ({ PageFlip: PageFlipMock }));

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
