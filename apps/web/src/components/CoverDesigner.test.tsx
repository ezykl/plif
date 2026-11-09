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

  it("offers artwork modes only for imported art and defaults to the silhouette when enabled", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const onChange = vi.fn();
    const art = "data:image/png;base64,AAAA";
    const { rerender } = render(
      <CoverDesigner
        design={DEFAULT_COVER_DESIGN}
        fallbackTitle="My Book"
        coverArtSrc={art}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Use designed hardbound cover"));
    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_COVER_DESIGN,
      enabled: true,
      artMode: "silhouette",
    });

    const enabled = { ...DEFAULT_COVER_DESIGN, enabled: true, artMode: "silhouette" as const };
    rerender(
      <CoverDesigner
        design={enabled}
        fallbackTitle="My Book"
        coverArtSrc={art}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Silhouette detail"), { target: { value: "70" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, artThreshold: 70 });
    fireEvent.click(screen.getByLabelText("Invert silhouette"));
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, artInvert: true });
    fireEvent.click(screen.getByLabelText("Artwork: Wrap my cover artwork"));
    expect(onChange).toHaveBeenLastCalledWith({ ...enabled, artMode: "full" });
    expect(screen.queryByLabelText("Cover logo")).toBeNull();
    expect((screen.getByLabelText("Cover title") as HTMLInputElement).placeholder).toBe("Optional");
  });

  it("hides artwork controls when there is no imported cover", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    render(
      <CoverDesigner
        design={{ ...DEFAULT_COVER_DESIGN, enabled: true }}
        fallbackTitle="My Book"
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("Silhouette detail")).toBeNull();
    expect(screen.queryByText("Your cover artwork")).toBeNull();
    expect(screen.getByLabelText("Matching back cover")).toBeTruthy();
  });
});
