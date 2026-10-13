import { describe, expect, it } from "vitest";
import { FAUCET_BUSY_MESSAGE, describeTxError, isFaucetBusy } from "./txError";

describe("isFaucetBusy", () => {
  it("recognises the faucet's selector in viem's message", () => {
    const e = new Error('The contract function "requestFunds" reverted with the following signature: 0x20e5bc67');
    expect(isFaucetBusy(e)).toBe(true);
  });
  it("recognises the decoded name, including inside a cause chain", () => {
    const inner = new Error("execution reverted: MaxFrequencyExceeded()");
    expect(isFaucetBusy(Object.assign(new Error("outer"), { cause: inner }))).toBe(true);
  });
  it("ignores other errors", () => {
    expect(isFaucetBusy(new Error("User rejected the request"))).toBe(false);
    expect(isFaucetBusy(null)).toBe(false);
  });
});

describe("describeTxError", () => {
  it("replaces the faucet's raw revert with a plain sentence", () => {
    expect(describeTxError(new Error("reverted with the following signature: 0x20e5bc67"))).toBe(FAUCET_BUSY_MESSAGE);
  });
  it("keeps other messages as they were", () => {
    expect(describeTxError(new Error("Something else\nsecond line"))).toBe("Something else");
  });
});
