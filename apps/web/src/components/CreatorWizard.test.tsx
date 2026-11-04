import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseManifest, type ImportedPage } from "@plif/core";
import { CreatorWizard, type CreatorWizardProps } from "./CreatorWizard";

afterEach(() => cleanup());

const samplePages: ImportedPage[] = [
  { id: "p1", src: "blob:1", width: 480, height: 679, alt: "Page 1" },
  { id: "p2", src: "blob:2", width: 480, height: 679, alt: "Page 2" },
];

function makeProps(overrides: Partial<CreatorWizardProps> = {}): CreatorWizardProps {
  return {
    step: "upload",
    onStepChange: vi.fn(),
    title: "School Paper",
    hasCover: true,
    theme: "magazine",
    pages: samplePages,
    onUploadFiles: vi.fn(),
    onChangePages: vi.fn(),
    onChangeTitle: vi.fn(),
    onChangeHasCover: vi.fn(),
    onChangeTheme: vi.fn(),
    onSelectPreset: vi.fn(),
    onApplyBulkDensity: vi.fn(),
    onResetToSample: vi.fn(),
    ...overrides,
  };
}

describe("<CreatorWizard>", () => {
  it("navigates across the 3 wizard steps via step tabs and Next/Back buttons", () => {
    const onStepChange = vi.fn();
    render(<CreatorWizard {...makeProps({ step: "upload", onStepChange })} />);

    fireEvent.click(screen.getByRole("button", { name: /Next: Arrange & Style/i }));
    expect(onStepChange).toHaveBeenCalledWith("arrange");

    fireEvent.click(screen.getByRole("tab", { name: /3\. Preview & Publish/i }));
    expect(onStepChange).toHaveBeenCalledWith("publish");
  });

  it("renders BookSettingsPanel and PageOrganizer in the arrange step", () => {
    render(<CreatorWizard {...makeProps({ step: "arrange" })} />);
    expect(screen.getByLabelText("Book title")).toBeTruthy();
    expect(screen.getByLabelText("Imported pages")).toBeTruthy();
  });

  it("renders publish summary and reset button in the publish step", () => {
    const onResetToSample = vi.fn();
    render(
      <CreatorWizard
        {...makeProps({
          step: "publish",
          direction: "ltr",
          toc: [{ title: "Ch 1", page: 1 }],
          onResetToSample,
        })}
      />,
    );

    expect(screen.getByText(/Ready to Publish/i)).toBeTruthy();
    expect(screen.getByText(/School Paper/i)).toBeTruthy();
    expect(screen.getByText(/Left-to-Right \(LTR\)/i)).toBeTruthy();
    expect(screen.getByText(/1 TOC chapters/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Load Sample Book/i }));
    expect(onResetToSample).toHaveBeenCalledTimes(1);
  });

  it("renders PublishPanel in publish step when manifest and download callbacks are provided", () => {
    const manifest = parseManifest({
      version: 1,
      title: "School Paper",
      pageSize: { width: 480, height: 679 },
      hasCover: true,
      theme: "magazine",
      direction: "ltr",
      toc: [],
      pages: [{ src: "p1.webp" }],
    });

    render(
      <CreatorWizard
        {...makeProps({
          step: "publish",
          manifest,
          onDownloadHtml: vi.fn(),
          onDownloadManifest: vi.fn(),
        })}
      />,
    );

    expect(screen.getByText(/Export & Embed/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Standalone HTML" })).toBeTruthy();
  });

  it("renders publish summary without crashing when manifest and download callbacks are omitted", () => {
    render(
      <CreatorWizard
        {...makeProps({
          step: "publish",
        })}
      />,
    );

    expect(screen.getByText(/Ready to Publish/i)).toBeTruthy();
    expect(screen.queryByText(/Export & Embed/i)).toBeNull();
  });
});
