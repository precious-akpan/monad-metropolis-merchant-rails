"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";

// A new passkey account holds no MON, so its first transaction would fail. Say so, and show the
// address to fund. Disappears on its own once the balance arrives.
export function GasNotice() {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    query: { enabled: Boolean(address), refetchInterval: 3000 },
  });
  const [copied, setCopied] = useState(false);

  if (!address || !data || data.value > 0n) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 text-sm text-amber-900">
        This account needs a little test MON to cover network fees before it can send a payment.
      </p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-neutral-700">
          {address}
        </code>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(address);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className="shrink-0 rounded-lg border border-amber-300 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
        >
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>
    </div>
  );
}
