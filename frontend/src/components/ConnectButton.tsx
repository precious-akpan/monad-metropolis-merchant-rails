"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/format";
import { describePasskeyError, hasStoredPasskey } from "@/lib/meraAccount";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();
  // localStorage is browser-only, so decide which action leads after mount.
  const [returning, setReturning] = useState(false);
  useEffect(() => setReturning(hasStoredPasskey()), [isConnected]);

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
          Sign out
        </button>
      </div>
    );
  }

  const create = connectors.find((c) => c.id === "mera-create");
  const signIn = connectors.find((c) => c.id === "mera-signin");
  const lead = returning ? signIn : create;
  const other = returning ? create : signIn;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={() => lead && connect({ connector: lead })}
        disabled={!lead || isPending}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Waiting for your passkey…"
          : returning
            ? "Sign in with passkey"
            : "Create account with passkey"}
      </button>
      <button
        onClick={() => {
          reset();
          if (other) connect({ connector: other });
        }}
        disabled={!other || isPending}
        className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800 disabled:opacity-50"
      >
        {returning ? "Create a new account instead" : "I already have an account"}
      </button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-600">
          {describePasskeyError(error)}
        </p>
      ) : null}
    </div>
  );
}
