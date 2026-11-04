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

  it("handles drag-and-drop file upload and respects isImporting guard", () => {
    const onUploadFiles = vi.fn();
    const { rerender } = render(
      <PageOrganizer
        pages={[]}
        isImporting={false}
        onUploadFiles={onUploadFiles}
        onChangePages={vi.fn()}
      />,
    );

    const dropZone = screen.getByLabelText(/upload pdf or images/i);
    const file = new File(["%PDF"], "issue.pdf", { type: "application/pdf" });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(onUploadFiles).toHaveBeenCalledTimes(1);
    expect(onUploadFiles).toHaveBeenCalledWith([file]);

    // Test importing guard
    rerender(
      <PageOrganizer
        pages={[]}
        isImporting={true}
        onUploadFiles={onUploadFiles}
        onChangePages={vi.fn()}
      />,
    );
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(onUploadFiles).toHaveBeenCalledTimes(1); // Should not increase
  });

  it("reorders pages when Move left / Move right buttons are clicked and respects boundary disabled states", () => {
    const onChangePages = vi.fn();
    render(<PageOrganizer pages={pages} onUploadFiles={vi.fn()} onChangePages={onChangePages} />);

    const movePage1Left = screen.getByRole("button", {
      name: "Move page 1 left",
    }) as HTMLButtonElement;
    const movePage3Right = screen.getByRole("button", {
      name: "Move page 3 right",
    }) as HTMLButtonElement;
    expect(movePage1Left.disabled).toBe(true);
    expect(movePage3Right.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Move page 1 right" }));
    expect(onChangePages).toHaveBeenCalledWith([pages[1], pages[0], pages[2]]);

    fireEvent.click(screen.getByRole("button", { name: "Move page 2 left" }));
    expect(onChangePages).toHaveBeenLastCalledWith([pages[1], pages[0], pages[2]]);
  });

  it("reorders pages via HTML5 drag and drop", () => {
    const onChangePages = vi.fn();
    render(<PageOrganizer pages={pages} onUploadFiles={vi.fn()} onChangePages={onChangePages} />);

    const pageItems = screen.getAllByRole("listitem");
    fireEvent.dragStart(pageItems[0]!);
    fireEvent.drop(pageItems[2]!);

    expect(onChangePages).toHaveBeenCalledWith([pages[1], pages[2], pages[0]]);
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

  it("renders progressText and errorText when passed", () => {
    render(
      <PageOrganizer
        pages={pages}
        isImporting={true}
        progressText="Importing 2 of 5 pages..."
        errorText="Failed to parse PDF."
        onUploadFiles={vi.fn()}
        onChangePages={vi.fn()}
      />,
    );

    expect(screen.getByRole("status").textContent).toBe("Importing 2 of 5 pages...");
    expect(screen.getByRole("alert").textContent).toBe("Failed to parse PDF.");
  });
});
