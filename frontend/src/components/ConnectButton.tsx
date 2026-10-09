"use client";

import { useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/format";
import { describePasskeyError, hasStoredPasskey } from "@/lib/meraAccount";

const subscribeNever = () => () => {};

const linkClass =
  "text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800 disabled:opacity-50";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();
  // localStorage is browser-only: read it as an external store, false while rendering on the server
  // so hydration matches, and re-read on every render so a passkey saved by connecting is seen.
  const returning = useSyncExternalStore(subscribeNever, hasStoredPasskey, () => false);
  const [confirmingCreate, setConfirmingCreate] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          title={`${address} (click to copy)`}
          aria-label={`Your account address is ${address}. Click to copy it.`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // Clipboard blocked: the full address is still in the tooltip.
              setCopied(false);
            }
          }}
          className="font-mono text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          {copied ? "Copied" : truncateAddress(address)}
        </button>
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
  const pick = connectors.find((c) => c.id === "mera-pick");

  function start(connector: typeof create) {
    reset();
    setConfirmingCreate(false);
    if (connector) connect({ connector });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={() => start(returning ? signIn : create)}
        disabled={!(returning ? signIn : create) || isPending}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Waiting for your passkey…"
          : returning
            ? "Sign in with passkey"
            : "Create account with passkey"}
      </button>

      {returning ? (
        <div className="flex gap-4">
          <button onClick={() => start(pick)} disabled={!pick || isPending} className={linkClass}>
            Use a different passkey
          </button>
          <button
            onClick={() => setConfirmingCreate(true)}
            disabled={isPending}
            className={linkClass}
          >
            Create a new account
          </button>
        </div>
      ) : (
        <button onClick={() => start(pick)} disabled={!pick || isPending} className={linkClass}>
          I already have an account
        </button>
      )}

      {confirmingCreate ? (
        <div className="max-w-xs rounded-xl border border-amber-200 bg-amber-50 p-3 text-right">
          <p className="mb-2 text-xs text-amber-900">
            You already have an account on this device. A new passkey makes a different, empty
            account.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmingCreate(false)} className={linkClass}>
              Cancel
            </button>
            <button
              onClick={() => start(create)}
              disabled={!create || isPending}
              className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              Create new account
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="max-w-xs text-right text-xs text-red-600">
          {describePasskeyError(error)}
        </p>
      ) : null}
    </div>
  );
}
