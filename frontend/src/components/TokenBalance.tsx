"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { STABLECOIN_DECIMALS, tokenContract, tokenLabel } from "@/lib/contracts";

// The account's balance of a stablecoin, refreshed every few seconds so a claim, a payment or an
// incoming payment shows up without a reload.
export function TokenBalance({
  token,
  owner,
  label = "Your balance",
}: {
  token: `0x${string}`;
  owner: `0x${string}`;
  label?: string;
}) {
  const { data } = useReadContract({
    ...tokenContract(token),
    functionName: "balanceOf",
    args: [owner],
    query: { refetchInterval: 3000 },
  });

  const amount =
    data === undefined
      ? "…"
      : Number(formatUnits(data, STABLECOIN_DECIMALS)).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  return (
    <p className="flex items-baseline justify-between rounded-xl bg-neutral-50 px-4 py-2 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium tabular-nums text-neutral-900">
        {amount} {tokenLabel(token)}
      </span>
    </p>
  );
}
