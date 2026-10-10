"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { useBalance, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { monadTestnet } from "@/lib/chain";
import { AUSD_ADDRESS, STABLECOIN_DECIMALS, tokenContract } from "@/lib/contracts";
import { MIN_GAS_BALANCE } from "@/lib/gas";
import { checkSend } from "@/lib/sendValidation";
import { formatUsd } from "@/lib/format";

const SLOW_CONFIRM_MS = 20_000;

const linkClass =
  "text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800 disabled:opacity-50";

// Sends AUSD from the signed-in account to any other address. Sends are final, so the recipient is
// checked before signing and shown in full on a confirm screen.
export function SendFunds({ owner }: { owner: `0x${string}` }) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  // What was actually sent, kept so the result still reads right after the balance changes.
  const [last, setLast] = useState<{ to: `0x${string}`; amount: bigint } | null>(null);

  const { data: balance } = useReadContract({
    ...tokenContract(AUSD_ADDRESS),
    functionName: "balanceOf",
    args: [owner],
    query: { refetchInterval: 3000 },
  });
  const { data: native } = useBalance({ address: owner, query: { refetchInterval: 3000 } });
  const lowGas = native !== undefined && native.value < MIN_GAS_BALANCE;

  const send = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: send.data });
  const sent = receipt.data?.status === "success";
  const failed = receipt.data?.status === "reverted" || Boolean(send.error) || Boolean(receipt.error);
  const waiting = Boolean(send.data) && !receipt.data && !receipt.error;

  function reset() {
    send.reset();
    setTo("");
    setAmount("");
    setConfirming(false);
    setFormError(null);
    setSlow(false);
    setLast(null);
  }

  function review() {
    const check = checkSend({ to, amount, from: owner, balance });
    if (!check.ok) return setFormError(check.error);
    setFormError(null);
    setConfirming(true);
  }

  function confirm() {
    const check = checkSend({ to, amount, from: owner, balance });
    if (!check.ok) {
      setConfirming(false);
      return setFormError(check.error);
    }
    setSlow(false);
    setLast({ to: check.to, amount: check.amount });
    setTimeout(() => setSlow(true), SLOW_CONFIRM_MS);
    send.writeContract({
      ...tokenContract(AUSD_ADDRESS),
      functionName: "transfer",
      args: [check.to, check.amount],
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${linkClass} self-start`}>
        Send AUSD
      </button>
    );
  }

  const check = checkSend({ to, amount, from: owner, balance });
  const explorer = send.data ? `${monadTestnet.blockExplorers.default.url}/tx/${send.data}` : null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-500">Send AUSD</h2>
        <button type="button" onClick={() => { reset(); setOpen(false); }} className={linkClass}>
          Close
        </button>
      </div>

      {sent && last ? (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <p>
            Sent {formatUsd(last.amount)} AUSD to <span className="break-all font-mono text-xs">{last.to}</span>.
          </p>
          <div className="mt-2 flex gap-4 text-xs">
            {explorer ? (
              <a href={explorer} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                See it on the explorer
              </a>
            ) : null}
            <button type="button" onClick={reset} className="underline underline-offset-2">
              Send another
            </button>
          </div>
        </div>
      ) : send.data || send.isPending ? (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-neutral-700">{send.data ? "Sending…" : "Signing…"}</p>
          {waiting && slow ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p>Still confirming. It may have gone through, or the network may not have accepted it.</p>
              <div className="mt-1 flex gap-4 text-xs">
                {explorer ? (
                  <a href={explorer} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    See it on the explorer
                  </a>
                ) : null}
                <button type="button" onClick={() => receipt.refetch()} className="underline underline-offset-2">
                  Check again
                </button>
              </div>
            </div>
          ) : null}
          {failed ? (
            <div className="text-red-600">
              <p>
                {receipt.data?.status === "reverted"
                  ? "The transfer didn't go through."
                  : (send.error ?? receipt.error)?.message}
              </p>
              <button type="button" onClick={reset} className={linkClass}>
                Try again
              </button>
            </div>
          ) : null}
        </div>
      ) : confirming && check.ok ? (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-neutral-700">
            Send <span className="font-semibold">{formatUsd(check.amount)} AUSD</span> to:
          </p>
          <p className="break-all rounded-xl bg-neutral-50 p-3 font-mono text-xs text-neutral-900">{check.to}</p>
          <p className="text-xs text-amber-800">
            Sends are final. Check every character of the address. Testnet only.
          </p>
          {send.error ? <p className="text-xs text-red-600">{send.error.message}</p> : null}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={confirm}
              disabled={lowGas}
              className="rounded-xl bg-neutral-900 px-5 py-2 font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lowGas ? "Waiting for network fees…" : "Confirm and send"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={linkClass}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient address"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 rounded-xl border border-neutral-300 px-4 py-2 font-mono text-sm focus:border-neutral-500 focus:outline-none"
          />
          <div className="flex gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount, e.g. 25"
              inputMode="decimal"
              className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-4 py-2 focus:border-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={balance === undefined}
              onClick={() => balance !== undefined && setAmount(formatUnits(balance, STABLECOIN_DECIMALS))}
              className="shrink-0 rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            >
              Max
            </button>
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <button
            type="button"
            onClick={review}
            disabled={!to || !amount}
            className="rounded-xl bg-neutral-900 px-5 py-2 font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Review
          </button>
        </div>
      )}
    </section>
  );
}
