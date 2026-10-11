import { describe, expect, it } from "vitest";
import { invoiceIdFor, recentInvoiceIds } from "./invoiceIds";

// A real invoice on Monad testnet: the third request (nonce 2) made by this merchant.
const merchant = "0xb516624A0bC2F17d8AAde2C2b0E00A8AdA8C3B6F" as const;
const liveId = "0x439c57c1ba40b41bc2a9e8c8f027cfe62ded390bbd1aab806d93c1d591551617";

describe("invoice ids", () => {
  it("reproduces the id the deployed contract assigned", () => {
    expect(invoiceIdFor(merchant, 2n)).toBe(liveId);
  });

  it("lists newest first", () => {
    const ids = recentInvoiceIds(merchant, 3n);
    expect(ids).toEqual([invoiceIdFor(merchant, 2n), invoiceIdFor(merchant, 1n), invoiceIdFor(merchant, 0n)]);
    expect(ids[0]).toBe(liveId);
  });

  it("is empty for a merchant with no requests", () => {
    expect(recentInvoiceIds(merchant, 0n)).toEqual([]);
  });

  it("caps how many it returns", () => {
    expect(recentInvoiceIds(merchant, 500n)).toHaveLength(50);
    expect(recentInvoiceIds(merchant, 500n, 5)).toHaveLength(5);
  });

  it("gives each merchant different ids", () => {
    const other = "0x013032166b72D40C43Ccc6B8cf776E4763f58162" as const;
    expect(invoiceIdFor(other, 0n)).not.toBe(invoiceIdFor(merchant, 0n));
  });
});
