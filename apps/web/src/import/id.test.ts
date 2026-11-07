import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePageId } from "./id";

describe("generatePageId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "uuid-123" });
    expect(generatePageId()).toBe("uuid-123");
  });

  it("falls back to a unique id when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});
    const a = generatePageId();
    const b = generatePageId();
    expect(a).toMatch(/^page-/);
    expect(a).not.toBe(b);
  });
});
