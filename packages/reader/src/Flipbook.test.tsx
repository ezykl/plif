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

beforeEach(() => vi.clearAllMocks());

describe("<Flipbook>", () => {
  it("creates the engine and loads page images", () => {
    render(<Flipbook manifest={manifest} />);
    expect(PageFlipMock).toHaveBeenCalledTimes(1);
    expect(instance.loadFromImages).toHaveBeenCalledWith(["a.webp", "b.webp"]);
  });

  it("applies per-page density from the manifest", () => {
    const setDensity = vi.fn();
    instance.getPage.mockReturnValue({ setDensity });
    render(<Flipbook manifest={manifest} />);
    expect(instance.getPage).toHaveBeenCalledWith(1);
    expect(setDensity).toHaveBeenCalledWith("hard");
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
    fireEvent.keyDown(region, { key: "ArrowRight" });
    fireEvent.keyDown(region, { key: "ArrowLeft" });
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
