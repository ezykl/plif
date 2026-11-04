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
});
