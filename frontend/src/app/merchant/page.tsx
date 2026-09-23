"use client";

import { useState } from "react";
import { parseEventLogs, stringToHex } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { StatusBadge } from "@/components/StatusBadge";
import { merchantRailsContract, MOCK_USD_ADDRESS } from "@/lib/contracts";
import { formatUsd, parseUsd } from "@/lib/format";
import { listInvoiceIds, saveInvoiceId } from "@/lib/invoiceStorage";
import { useInvoice } from "@/lib/useInvoice";

export default function MerchantPage() {
  const { address, isConnected } = useAccount();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Merchant Rails</h1>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <p className="text-neutral-600">
          Connect to start creating payment requests.
        </p>
      ) : (
        <NetworkGuard>
          <CreateInvoiceCard merchantAddress={address!} />
          <InvoiceList merchantAddress={address!} />
        </NetworkGuard>
      )}
    </main>
  );
}

function CreateInvoiceCard({ merchantAddress }: { merchantAddress: `0x${string}` }) {
  const [amountInput, setAmountInput] = useState("");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { writeContract, data: txHash, isPending: isSigning, error: writeError } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  // Once the tx confirms, pull the real invoice id out of the InvoiceCreated event -- reading it
  // off the receipt is more honest than recomputing it client-side.
  if (receipt && createdLink === null) {
    const [event] = parseEventLogs({
      abi: merchantRailsContract.abi,
      eventName: "InvoiceCreated",
      logs: receipt.logs,
    });
    if (event) {
      const id = event.args.id;
      saveInvoiceId(merchantAddress, id);
      setCreatedLink(`${window.location.origin}/pay/${id}`);
    }
  }

  function handleCreate() {
    setFormError(null);
    setCreatedLink(null);
    setCopied(false);
    let amount: bigint;
    try {
      amount = parseUsd(amountInput);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Invalid amount");
      return;
    }
    // bytes32, truncated/zero-padded from the free-text reference (already capped at 30 chars in
    // the input, well within 32 bytes for typical ASCII/UTF-8 order references).
    const refBytes = stringToHex(reference, { size: 32 });

    writeContract({
      ...merchantRailsContract,
      functionName: "createInvoice",
      args: [MOCK_USD_ADDRESS, amount, 0n, refBytes],
    });
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-medium text-neutral-500">
        Request a payment
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          placeholder="Amount, e.g. 25"
          inputMode="decimal"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 text-lg focus:border-neutral-500 focus:outline-none"
        />
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value.slice(0, 30))}
          placeholder="What's it for? (optional)"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-2 focus:border-neutral-500 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={isSigning || isConfirming || !amountInput}
          className="rounded-xl bg-neutral-900 px-5 py-2 font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSigning ? "Confirm in wallet…" : isConfirming ? "Creating…" : "Create"}
        </button>
      </div>
      {formError ? <p className="mt-2 text-sm text-red-600">{formError}</p> : null}
      {writeError ? (
        <p className="mt-2 text-sm text-red-600">{writeError.message}</p>
      ) : null}
      {createdLink ? (
        <div className="mt-4 rounded-xl bg-green-50 p-4">
          <p className="mb-2 text-sm text-green-800">Payment request ready.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-neutral-700">
              {createdLink}
            </code>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(createdLink);
                setCopied(true);
              }}
              className="rounded-lg border border-green-300 px-3 py-2 text-xs font-medium text-green-800 hover:bg-green-100"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InvoiceList({ merchantAddress }: { merchantAddress: `0x${string}` }) {
  const ids = listInvoiceIds(merchantAddress);

  if (ids.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Payment requests you create in this browser will show up here.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-neutral-500">
        Your payment requests
      </h2>
      {ids.map((id) => (
        <InvoiceRow key={id} id={id} />
      ))}
    </section>
  );
}

function InvoiceRow({ id }: { id: `0x${string}` }) {
  const { invoice, exists, isLoading } = useInvoice(id);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${id}`;

  if (isLoading || !exists || !invoice) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
      <div>
        <p className="font-medium">{formatUsd(invoice.amount)}</p>
        <a
          href={link}
          className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
        >
          Copy pay link
        </a>
      </div>
      <StatusBadge status={invoice.status} />
    </div>
  );
}
