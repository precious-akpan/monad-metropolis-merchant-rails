"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/format";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-neutral-600">
          {truncateAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const connector = connectors[0];

  return (
    <button
      onClick={() => connector && connect({ connector })}
      disabled={!connector || isPending}
      className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? "Connecting…"
        : connector
          ? "Get started"
          : "No wallet found"}
    </button>
  );
}
