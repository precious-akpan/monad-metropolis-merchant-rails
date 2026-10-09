import { formatUnits, parseUnits } from "viem";
import { STABLECOIN_DECIMALS } from "./contracts";

/** Base units (bigint) -> a "$25.00"-style display string. */
export function formatUsd(amount: bigint): string {
  const n = Number(formatUnits(amount, STABLECOIN_DECIMALS));
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "$25" / "25" / "25.5" user input -> base units (bigint). Throws on garbage input. */
export function parseUsd(input: string): bigint {
  const cleaned = input.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,6})?$/.test(cleaned) || cleaned === "") {
    throw new Error("Enter an amount like 25 or 25.50");
  }
  return parseUnits(cleaned, STABLECOIN_DECIMALS);
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
