import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookSettingsPanel } from "./BookSettingsPanel";

afterEach(() => cleanup());

describe("<BookSettingsPanel>", () => {
  it("updates book title and toggles standalone cover mode", () => {
    const onChangeTitle = vi.fn();
    const onChangeHasCover = vi.fn();

    render(
      <BookSettingsPanel
        title="Campus Paper"
        hasCover={true}
        theme="magazine"
        onChangeTitle={onChangeTitle}
        onChangeHasCover={onChangeHasCover}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Book title"), {
      target: { value: "Spring Edition" },
    });
    expect(onChangeTitle).toHaveBeenCalledWith("Spring Edition");

    fireEvent.click(screen.getByLabelText(/standalone front & back cover/i));
    expect(onChangeHasCover).toHaveBeenCalledWith(false);
  });

  it("triggers preset selection, bulk density actions, and theme selection", () => {
    const onSelectPreset = vi.fn();
    const onApplyBulkDensity = vi.fn();
    const onChangeTheme = vi.fn();

    render(
      <BookSettingsPanel
        title="Campus Paper"
        hasCover={true}
        theme="magazine"
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={onChangeTheme}
        onSelectPreset={onSelectPreset}
        onApplyBulkDensity={onApplyBulkDensity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Preset: Newspaper/i }));
    expect(onSelectPreset).toHaveBeenCalledWith("newspaper");

    fireEvent.click(screen.getByRole("button", { name: "Hard Front & Back Cover" }));
    expect(onApplyBulkDensity).toHaveBeenCalledWith("hard-covers");

    fireEvent.click(screen.getByRole("button", { name: /Theme: Newsprint/i }));
    expect(onChangeTheme).toHaveBeenCalledWith("newsprint");
  });

  it("switches reading direction (LTR / RTL) and adds/removes Table of Contents chapters", () => {
    const onChangeDirection = vi.fn();
    const onChangeToc = vi.fn();

    render(
      <BookSettingsPanel
        title="Manga"
        hasCover={true}
        theme="magazine"
        direction="ltr"
        toc={[{ title: "Chapter 1", page: 1 }]}
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
        onChangeDirection={onChangeDirection}
        onChangeToc={onChangeToc}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Right to Left (RTL)" }));
    expect(onChangeDirection).toHaveBeenCalledWith("rtl");

    fireEvent.change(screen.getByLabelText("Chapter title"), {
      target: { value: "Chapter 2" },
    });
    fireEvent.change(screen.getByLabelText("Chapter page"), {
      target: { value: "5" },
    });
    const addChapterBtn = screen.getByRole("button", { name: "Add chapter" });
    expect(addChapterBtn.style.minHeight).toBe("44px");
    fireEvent.click(addChapterBtn);
    expect(onChangeToc).toHaveBeenCalledWith([
      { title: "Chapter 1", page: 1 },
      { title: "Chapter 2", page: 5 },
    ]);

    const removeChapterBtn = screen.getByRole("button", { name: "Remove chapter Chapter 1" });
    expect(removeChapterBtn.style.minHeight).toBe("44px");
    fireEvent.click(removeChapterBtn);
    expect(onChangeToc).toHaveBeenCalledWith([]);
  });

  it("highlights active preset with aria-pressed and Active badge", () => {
    render(
      <BookSettingsPanel
        title="Active Book"
        hasCover={true}
        theme="magazine"
        activePreset="magazine"
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    const magBtn = screen.getByRole("button", { name: /Preset: Magazine/i });
    expect(magBtn.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("applies high-contrast focus ring when book title input is focused", () => {
    render(
      <BookSettingsPanel
        title="Styled Book"
        hasCover={true}
        theme="magazine"
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Book title" });
    expect(input.style.outline).toBe("none");

    fireEvent.focus(input);
    expect(input.style.outline).toContain("2px solid");
    expect(input.style.outline).toContain("#c25e3e");

    fireEvent.blur(input);
    expect(input.style.outline).toBe("none");
  });

  it("selects page format presets and fires onChangePageSize", () => {
    const onChangePageSize = vi.fn();
    render(
      <BookSettingsPanel
        title="Format Book"
        hasCover={true}
        theme="magazine"
        pageSize={{ width: 480, height: 679 }}
        onChangePageSize={onChangePageSize}
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    const a4Btn = screen.getByRole("button", { name: "Page Format: A4 Portrait" });
    expect(a4Btn.getAttribute("aria-pressed")).toBe("true");

    const squareBtn = screen.getByRole("button", { name: "Page Format: Square" });
    fireEvent.click(squareBtn);
    expect(onChangePageSize).toHaveBeenCalledWith({ width: 500, height: 500 });
  });

  it("renders detected original upload size button and allows restoring it", () => {
    const onChangePageSize = vi.fn();
    render(
      <BookSettingsPanel
        title="Original Size Book"
        hasCover={true}
        theme="magazine"
        pageSize={{ width: 480, height: 679 }}
        originalPageSize={{ width: 612, height: 792 }}
        onChangePageSize={onChangePageSize}
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    const origBtn = screen.getByRole("button", {
      name: "Original Uploaded Dimensions: 612 by 792",
    });
    expect(origBtn).toBeTruthy();
    fireEvent.click(origBtn);
    expect(onChangePageSize).toHaveBeenCalledWith({ width: 612, height: 792 });
  });

  it("supports custom dimension inputs and swapping orientation", () => {
    const onChangePageSize = vi.fn();
    render(
      <BookSettingsPanel
        title="Custom Size Book"
        hasCover={true}
        theme="magazine"
        pageSize={{ width: 480, height: 679 }}
        onChangePageSize={onChangePageSize}
        onChangeTitle={vi.fn()}
        onChangeHasCover={vi.fn()}
        onChangeTheme={vi.fn()}
        onSelectPreset={vi.fn()}
        onApplyBulkDensity={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Custom Dimensions\.\.\./i }));

    const widthInput = screen.getByRole("spinbutton", { name: "Custom page width" });
    const heightInput = screen.getByRole("spinbutton", { name: "Custom page height" });
    expect(widthInput).toBeTruthy();
    expect(heightInput).toBeTruthy();

    fireEvent.change(widthInput, { target: { value: "600" } });
    expect(onChangePageSize).toHaveBeenCalledWith({ width: 600, height: 679 });

    fireEvent.change(heightInput, { target: { value: "900" } });
    expect(onChangePageSize).toHaveBeenCalledWith({ width: 480, height: 900 });

    const swapBtn = screen.getByRole("button", { name: "Swap width and height orientation" });
    fireEvent.click(swapBtn);
    expect(onChangePageSize).toHaveBeenCalledWith({ width: 679, height: 480 });
  });
});
