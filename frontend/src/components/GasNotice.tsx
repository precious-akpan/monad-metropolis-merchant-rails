"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { MIN_GAS_BALANCE } from "@/lib/gas";

// Addresses already asked this session, so remounting (page changes) does not ask again.
const requested = new Set<string>();

// How long to wait for the test MON to show up before offering the manual route.
const ARRIVAL_TIMEOUT_MS = 30_000;

// Set when automatic funding is unavailable for one address; keyed by address so it cannot leak
// onto a different account that signs in later.
type ManualFallback = { address: string; message: string | null };

// A passkey account starts with no MON and spends it on every transaction, so a payment can fail for
// want of gas. When the balance is too low to finish one, ask the server to send a little and say so
// while it arrives. If that is not possible, show the address to fund by hand.
// Disappears on its own once the balance arrives.
export function GasNotice() {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    query: { enabled: Boolean(address), refetchInterval: 3000 },
  });
  const [fallback, setFallback] = useState<ManualFallback | null>(null);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Below the amount one payment needs, not only at zero: an account used a few times is low but not empty.
  const needsGas = Boolean(address) && data !== undefined && data.value < MIN_GAS_BALANCE;
  const manual = fallback !== null && fallback.address === address;

  // Once an account is topped up, forget the request so it can be topped up again after it is spent.
  useEffect(() => {
    if (address && data !== undefined && data.value >= MIN_GAS_BALANCE) {
      requested.delete(address.toLowerCase());
    }
  }, [address, data]);

  useEffect(() => {
    if (!needsGas || !address) return;
    const key = address.toLowerCase();
    if (requested.has(key)) return;
    requested.add(key);

    fetch("/api/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { status?: string; error?: string };
        if (body.status !== "sent" && body.status !== "not-needed") {
          setFallback({ address, message: body.error ?? null });
        }
      })
      .catch(() => {
        setFallback({ address, message: "Couldn't reach the funding service." });
      });
  }, [needsGas, address, attempt]);

  useEffect(() => {
    if (!needsGas || !address || manual) return;
    const timer = setTimeout(() => {
      setFallback({ address, message: "This is taking longer than expected." });
    }, ARRIVAL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [needsGas, address, manual, attempt]);

  if (!needsGas || !address) return null;

  if (!manual) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        Adding a little test MON for network fees…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-2 text-sm text-amber-900">
        This account needs a little test MON to cover network fees before it can send a payment.
        {fallback?.message ? ` ${fallback.message}` : ""}
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
      <button
        onClick={() => {
          requested.delete(address.toLowerCase());
          setFallback(null);
          setAttempt((n) => n + 1);
        }}
        className="mt-2 text-xs text-amber-900 underline underline-offset-2 hover:text-amber-700"
      >
        Try again
      </button>
    </div>
  );
}
