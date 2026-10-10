import { encodeAbiParameters, keccak256 } from "viem";
import { monadTestnet } from "./chain";
import { MERCHANT_RAILS_ADDRESS } from "./contracts";

// Mirrors MerchantRails.createInvoice: id = keccak256(abi.encode(chainid, contract, merchant, nonce)),
// where nonce counts the merchant's invoices from zero. Because merchantNonce(merchant) is public, a
// merchant's whole list can be rebuilt from the chain, on any device, with no log queries.
export function invoiceIdFor(merchant: `0x${string}`, nonce: bigint): `0x${string}` {
  return keccak256(
    encodeAbiParameters(
      [{ type: "uint256" }, { type: "address" }, { type: "address" }, { type: "uint256" }],
      [BigInt(monadTestnet.id), MERCHANT_RAILS_ADDRESS, merchant, nonce],
    ),
  );
}

// Newest first, capped so a prolific merchant does not poll hundreds of rows at once.
export function recentInvoiceIds(merchant: `0x${string}`, count: bigint, limit = 50): `0x${string}`[] {
  const ids: `0x${string}`[] = [];
  for (let n = count; n > 0n && ids.length < limit; n--) ids.push(invoiceIdFor(merchant, n - 1n));
  return ids;
}
