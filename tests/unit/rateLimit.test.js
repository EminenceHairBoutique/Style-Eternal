import { describe, it, expect } from "vitest";
import { getClientIp } from "../../api/_utils/rateLimit.js";

const reqWith = (headers = {}, socket = {}) => ({ headers, socket });

describe("getClientIp", () => {
  it("prefers the platform-set x-vercel-forwarded-for header", () => {
    const req = reqWith({
      "x-vercel-forwarded-for": "203.0.113.7",
      "x-forwarded-for": "6.6.6.6, 203.0.113.7",
    });
    expect(getClientIp(req)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const req = reqWith({ "x-real-ip": "198.51.100.2" });
    expect(getClientIp(req)).toBe("198.51.100.2");
  });

  it("uses the RIGHTMOST x-forwarded-for hop, ignoring client-prepended spoof values", () => {
    // A client can send its own X-Forwarded-For; proxies append the true IP
    // at the end. The leftmost value is attacker-controlled.
    const req = reqWith({ "x-forwarded-for": "6.6.6.6, 10.0.0.1, 203.0.113.9" });
    expect(getClientIp(req)).toBe("203.0.113.9");
  });

  it("spoofed single-hop x-forwarded-for cannot rotate the key when platform headers exist", () => {
    const base = { "x-vercel-forwarded-for": "203.0.113.7" };
    const spoofA = getClientIp(reqWith({ ...base, "x-forwarded-for": "1.1.1.1" }));
    const spoofB = getClientIp(reqWith({ ...base, "x-forwarded-for": "2.2.2.2" }));
    expect(spoofA).toBe(spoofB);
    expect(spoofA).toBe("203.0.113.7");
  });

  it("falls back to the socket address, then 'unknown'", () => {
    expect(getClientIp(reqWith({}, { remoteAddress: "127.0.0.1" }))).toBe("127.0.0.1");
    expect(getClientIp({ headers: {} })).toBe("unknown");
  });
});
