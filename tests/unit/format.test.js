import { describe, it, expect } from "vitest";
import { formatMoney, formatBytes } from "../../src/utils/format.js";

describe("formatMoney", () => {
  it("formats whole-dollar amounts with thousands separators", () => {
    expect(formatMoney(75)).toBe("$75");
    expect(formatMoney(1234.5)).toBe("$1,235");
  });

  it("treats null/undefined/invalid as zero", () => {
    expect(formatMoney(null)).toBe("$0");
    expect(formatMoney(undefined)).toBe("$0");
  });
});

describe("formatBytes", () => {
  it("formats KB and MB", () => {
    expect(formatBytes(1536)).toBe("2 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });

  it("floors at 0 KB", () => {
    expect(formatBytes(0)).toBe("0 KB");
    expect(formatBytes(-5)).toBe("0 KB");
  });
});
