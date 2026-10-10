"use client";

import { useEffect, useState } from "react";
import { describePasskeyError, revealRecoveryPhrase } from "@/lib/meraAccount";

const AUTO_HIDE_MS = 60_000;

const linkClass =
  "text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800 disabled:opacity-50";

// Backing up an account means writing down its 24 words. They are derived again from a fresh passkey
// touch, shown for a minute, and held only in this component's state, never saved anywhere.
export function RecoveryPhrase({ address }: { address: `0x${string}` }) {
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setWords(null);
    setError(null);
    setOpen(false);
  }

  useEffect(() => {
    if (!words) return;
    const timer = setTimeout(() => setWords(null), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [words]);

  async function reveal() {
    setBusy(true);
    setError(null);
    try {
      setWords((await revealRecoveryPhrase(address)).split(" "));
    } catch (e) {
      setError(describePasskeyError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={linkClass}>
        Back up account
      </button>
    );
  }

  return (
    <div className="absolute right-0 top-full z-10 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-lg">
      <p className="text-sm font-medium text-neutral-900">Back up your account</p>
      <p className="mt-1 text-xs text-neutral-600">
        Your account lives in your passkey, which Google or Apple sync across your devices. These 24
        words are the same account written down, so you can restore it in any wallet if the passkey
        is ever lost.
      </p>

      {words ? (
        <>
          <ol className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1 rounded-xl bg-neutral-50 p-3 font-mono text-xs">
            {words.map((word, i) => (
              <li key={i} className="text-neutral-900">
                <span className="mr-1 text-neutral-400">{i + 1}.</span>
                {word}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-amber-800">
            Anyone with these words controls this account. Write them down; don&apos;t screenshot or
            share them. They hide again in a minute.
          </p>
          <button type="button" onClick={close} className={`${linkClass} mt-2`}>
            Hide
          </button>
        </>
      ) : (
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={reveal}
            disabled={busy}
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {busy ? "Waiting for your passkey…" : "Show recovery phrase"}
          </button>
          <button type="button" onClick={close} className={linkClass}>
            Cancel
          </button>
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
