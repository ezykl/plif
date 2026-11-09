import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_COVER_DESIGN } from "@plif/core";
import { CoverDesigner } from "./CoverDesigner";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("<CoverDesigner>", () => {
  it("hides controls until the hardbound cover is enabled, then emits updates", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const onChange = vi.fn();
    const { rerender } = render(
      <CoverDesigner design={DEFAULT_COVER_DESIGN} fallbackTitle="My Book" onChange={onChange} />,
    );

    expect(screen.queryByLabelText("Cover title")).toBeNull();
    fireEvent.click(screen.getByLabelText("Use designed hardbound cover"));
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_COVER_DESIGN, enabled: true });

    const enabled = { ...DEFAULT_COVER_DESIGN, enabled: true };
    rerender(<CoverDesigner design={enabled} fallbackTitle="My Book" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Cover color: Burgundy"));
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, color: "#5a1a26" });

    fireEvent.click(screen.getByLabelText("Material: Leather"));
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, material: "leather" });

    fireEvent.click(screen.getByLabelText("Finish: Silver foil"));
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, foil: "silver" });

    fireEvent.change(screen.getByLabelText("Cover title"), { target: { value: "Annual Report" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, title: "Annual Report" });

    expect((screen.getByLabelText("Cover title") as HTMLInputElement).placeholder).toBe("My Book");
  });
});
