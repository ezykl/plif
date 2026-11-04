import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ImportedPage } from "@plif/core";
import { PageOrganizer } from "./PageOrganizer";

afterEach(() => cleanup());

const pages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 600, height: 800, alt: "Cover" },
  { id: "p2", src: "blob:2", width: 600, height: 800, alt: "Spread Left" },
  { id: "p3", src: "blob:3", width: 600, height: 800, alt: "Spread Right" },
];

describe("<PageOrganizer>", () => {
  it("calls onUploadFiles when files are selected via the file input", () => {
    const onUploadFiles = vi.fn();
    render(<PageOrganizer pages={[]} onUploadFiles={onUploadFiles} onChangePages={vi.fn()} />);

    const input = screen.getByLabelText(/upload pdf or images/i);
    const file = new File(["%PDF"], "issue.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onUploadFiles).toHaveBeenCalledTimes(1);
    expect(onUploadFiles).toHaveBeenCalledWith([file]);
  });

  it("reorders pages when Move left / Move right buttons are clicked", () => {
    const onChangePages = vi.fn();
    render(<PageOrganizer pages={pages} onUploadFiles={vi.fn()} onChangePages={onChangePages} />);

    fireEvent.click(screen.getByRole("button", { name: "Move page 1 right" }));
    expect(onChangePages).toHaveBeenCalledWith([pages[1], pages[0], pages[2]]);

    fireEvent.click(screen.getByRole("button", { name: "Move page 2 left" }));
    expect(onChangePages).toHaveBeenLastCalledWith([pages[1], pages[0], pages[2]]);
  });

  it("toggles page density between soft and hard and removes pages", () => {
    const onChangePages = vi.fn();
    render(<PageOrganizer pages={pages} onUploadFiles={vi.fn()} onChangePages={onChangePages} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle hard cover for page 1" }));
    expect(onChangePages).toHaveBeenCalledWith([
      { ...pages[0], density: "hard" },
      pages[1],
      pages[2],
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Remove page 2" }));
    expect(onChangePages).toHaveBeenLastCalledWith([pages[0], pages[2]]);
  });
});
