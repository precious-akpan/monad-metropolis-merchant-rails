import { describe, expect, it } from "vitest";
import { describeTxError } from "./txError";
import { formatUsd, parseUsd, truncateAddress } from "./format";

describe("amounts", () => {
  it("parses user input into 6-decimal base units", () => {
    expect(parseUsd("25")).toBe(25_000_000n);
    expect(parseUsd("$25.5")).toBe(25_500_000n);
    expect(parseUsd("0.000001")).toBe(1n);
  });

  it.each(["", "abc", "1.1234567", "-1", "1,000"])("rejects %j", (input) => {
    expect(() => parseUsd(input)).toThrow();
  });

  it("formats base units as dollars", () => {
    expect(formatUsd(25_000_000n)).toBe("$25.00");
    expect(formatUsd(4_985_000n)).toBe("$4.99");
  });

  it("shortens an address", () => {
    expect(truncateAddress("0xb516624A0bC2F17d8AAde2C2b0E00A8AdA8C3B6F")).toBe("0xb516…3B6F");
  });
});

describe("describeTxError", () => {
  it("prefers viem's short message", () => {
    const error = Object.assign(new Error("long\nraw request data"), { shortMessage: "User rejected the request." });
    expect(describeTxError(error)).toBe("User rejected the request.");
  });

  it("keeps only the first line of a plain error", () => {
    expect(describeTxError(new Error("first line\nsecond line"))).toBe("first line");
  });

  it("cuts a very long line", () => {
    expect(describeTxError(new Error("x".repeat(500))).length).toBeLessThanOrEqual(160);
  });

  it("returns an empty string for no error", () => {
    expect(describeTxError(null)).toBe("");
  });
});
