import { describe, expect, it } from "vitest";
import { AUSD_ADDRESS, AUSD_FAUCET_ADDRESS, MERCHANT_RAILS_ADDRESS, MOCK_USD_ADDRESS } from "./contracts";
import { checkSend } from "./sendValidation";

const from = "0xb516624A0bC2F17d8AAde2C2b0E00A8AdA8C3B6F";
const good = "0x013032166b72D40C43Ccc6B8cf776E4763f58162";
const balance = 100_000_000n; // 100 AUSD, 6 decimals
const check = (over: Partial<Parameters<typeof checkSend>[0]>) =>
  checkSend({ to: good, amount: "25", from, balance, ...over });

describe("checkSend", () => {
  it("accepts a valid send and returns the checksummed address and base units", () => {
    expect(check({})).toEqual({ ok: true, to: good, amount: 25_000_000n });
  });

  it("accepts an all-lowercase address", () => {
    expect(check({ to: good.toLowerCase() }).ok).toBe(true);
  });

  it("accepts sending the exact balance", () => {
    expect(check({ amount: "100" }).ok).toBe(true);
  });

  it.each([
    ["a short address", "0x1234"],
    ["no address", ""],
    ["a mixed-case address with a bad checksum", good.slice(0, 3) + good.slice(3).toUpperCase()],
  ])("rejects %s", (_name, to) => {
    expect(check({ to }).ok).toBe(false);
  });

  it("rejects the zero address", () => {
    expect(check({ to: "0x0000000000000000000000000000000000000000" }).ok).toBe(false);
  });

  it("rejects the sender's own address, in any case", () => {
    expect(check({ to: from }).ok).toBe(false);
    expect(check({ to: from.toLowerCase() }).ok).toBe(false);
  });

  it.each([
    ["AUSD", AUSD_ADDRESS],
    ["the AUSD faucet", AUSD_FAUCET_ADDRESS],
    ["MerchantRails", MERCHANT_RAILS_ADDRESS],
    ["MockUSD", MOCK_USD_ADDRESS],
  ])("rejects %s as a recipient", (_name, to) => {
    expect(check({ to }).ok).toBe(false);
  });

  it.each([
    ["zero", "0"],
    ["text", "abc"],
    ["empty", ""],
    ["too many decimals", "1.1234567"],
    ["negative", "-5"],
  ])("rejects an amount that is %s", (_name, amount) => {
    expect(check({ amount }).ok).toBe(false);
  });

  it("rejects more than the balance by one base unit", () => {
    expect(check({ amount: "100.000001" }).ok).toBe(false);
  });

  it("does not block on balance while it is still loading", () => {
    expect(check({ balance: undefined }).ok).toBe(true);
  });
});
