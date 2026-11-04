import { forwardRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FlipbookHandle, FlipbookProps } from "@plif/reader";

vi.mock("@plif/reader", () => ({
  Flipbook: forwardRef<FlipbookHandle, FlipbookProps>(function FlipbookMock({ manifest }) {
    return <div role="region" aria-label={manifest.title} />;
  }),
}));

import { App } from "./App";

afterEach(() => cleanup());

describe("<App>", () => {
  it("switches wizard steps, applies presets/themes, and updates the live Flipbook stage", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Sample Magazine" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));

    fireEvent.change(screen.getByLabelText("Book title"), {
      target: { value: "The Campus Chronicle" },
    });
    expect(screen.getByRole("heading", { name: "The Campus Chronicle" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Preset: Newspaper/i }));
    expect(screen.getByText("1–2 / 12")).toBeTruthy();
  });
});
