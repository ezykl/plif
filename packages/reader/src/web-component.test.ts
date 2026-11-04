import { describe, expect, it } from "vitest";
import { PlifBookElement } from "./web-component";

describe("<plif-book> custom element", () => {
  it("registers plif-book in customElements registry", () => {
    expect(customElements.get("plif-book")).toBe(PlifBookElement);
  });

  it("creates an instance with observed attributes", () => {
    const el = document.createElement("plif-book") as PlifBookElement;
    expect(el).toBeInstanceOf(PlifBookElement);
    expect(PlifBookElement.observedAttributes).toEqual(["src", "theme", "direction"]);
  });

  it("updates attributes cleanly", () => {
    const el = document.createElement("plif-book") as PlifBookElement;
    document.body.appendChild(el);
    el.setAttribute("src", "https://example.com/manifest.json");
    el.setAttribute("direction", "rtl");
    expect(el.getAttribute("src")).toBe("https://example.com/manifest.json");
    expect(el.getAttribute("direction")).toBe("rtl");
    document.body.removeChild(el);
  });
});
