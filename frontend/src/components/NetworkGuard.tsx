"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/lib/chain";

/**
 * Wrong network is the single most common way a demo fails silently (calls just revert).
 * If the connected wallet isn't on Monad testnet, block the page content with a one-click
 * fix instead of letting a customer/merchant hit a confusing revert.
 */
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected) return <>{children}</>;
  if (chainId === monadTestnet.id) return <>{children}</>;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="mb-3 text-sm text-amber-900">
        This only works on Monad Testnet right now.
      </p>
      <button
        onClick={() => switchChain({ chainId: monadTestnet.id })}
        disabled={isPending}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {isPending ? "Switching…" : "Switch to Monad Testnet"}
      </button>
      {error ? (
        <p className="mt-3 text-xs text-amber-700">{error.message}</p>
      ) : null}
    </div>
  );
}
