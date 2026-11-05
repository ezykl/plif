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
    fireEvent.click(screen.getByRole("button", { name: "Add chapter" }));
    expect(onChangeToc).toHaveBeenCalledWith([
      { title: "Chapter 1", page: 1 },
      { title: "Chapter 2", page: 5 },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Remove chapter Chapter 1" }));
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
});
