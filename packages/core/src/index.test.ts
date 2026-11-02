import { describe, expect, it } from "vitest";
import { PROJECT_NAME } from "./index";

describe("core", () => {
  it("exposes the project name", () => {
    expect(PROJECT_NAME).toBe("plif");
  });
});
