"use client";

import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, stringToHex } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { TokenBalance } from "@/components/TokenBalance";
import { SendFunds } from "@/components/SendFunds";
import { StatusBadge } from "@/components/StatusBadge";
import { AUSD_ADDRESS, merchantRailsContract } from "@/lib/contracts";
import { recentInvoiceIds } from "@/lib/invoiceIds";
import { formatUsd, parseUsd } from "@/lib/format";
import { listInvoiceIds, saveInvoiceId } from "@/lib/invoiceStorage";
import { InvoiceStatus, useInvoice } from "@/lib/useInvoice";

export default function MerchantPage() {
  const { address, isConnected } = useAccount();
  // Held here so a freshly created invoice appears in the list straight away; the list used to read
  // localStorage only on its own renders, which creating an invoice never triggered.
  const [stored, setStored] = useState<`0x${string}`[]>([]);

  useEffect(() => {
    setStored(address ? listInvoiceIds(address) : []);
  }, [address]);

  // The chain knows how many requests this account has made, and each id follows from that count, so
  // the list follows the account to a new device. localStorage covers the moment before that read.
  const { data: count, refetch: refetchCount } = useReadContract({
    ...merchantRailsContract,
    functionName: "merchantNonce",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const ids = useMemo(
    () => (address && count !== undefined ? recentInvoiceIds(address, count) : stored),
    [address, count, stored],
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="whitespace-nowrap text-xl font-semibold">Merchant Rails</h1>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <p className="text-neutral-600">
          Sign in with a passkey to start creating payment requests.
        </p>
      ) : (
        <NetworkGuard>
          <TokenBalance token={AUSD_ADDRESS} owner={address!} label="Your balance" />
          <SendFunds owner={address!} />
          <CreateInvoiceCard
            merchantAddress={address!}
            onCreated={() => {
              setStored(listInvoiceIds(address!));
              refetchCount();
            }}
          />
          <InvoiceList ids={ids} />
        </NetworkGuard>
      )}
    </main>
  );
}

function CreateInvoiceCard({
  merchantAddress,
  onCreated,
}: {
  merchantAddress: `0x${string}`;
  onCreated: () => void;
}) {
  const [amountInput, setAmountInput] = useState("");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: `0x${string}`; link: string } | null>(null);

  const { writeContract, data: txHash, isPending: isSigning, error: writeError } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  // Once the tx confirms, pull the real invoice id out of the InvoiceCreated event -- reading it
  // off the receipt is more honest than recomputing it client-side.
  useEffect(() => {
    if (!receipt) return;
    const [event] = parseEventLogs({
      abi: merchantRailsContract.abi,
      eventName: "InvoiceCreated",
      logs: receipt.logs,
    });
    if (event) {
      const id = event.args.id;
      saveInvoiceId(merchantAddress, id);
      setCreated({ id, link: `${window.location.origin}/pay/${id}` });
      onCreated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  function handleCreate() {
    setFormError(null);
    setCreated(null);
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
      args: [AUSD_ADDRESS, amount, 0n, refBytes],
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
          className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-4 py-2 text-lg focus:border-neutral-500 focus:outline-none"
        />
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value.slice(0, 30))}
          placeholder="What's it for? e.g. Logo design, NYC client"
          className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-4 py-2 focus:border-neutral-500 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={isSigning || isConfirming || !amountInput}
          className="shrink-0 rounded-xl bg-neutral-900 px-5 py-2 font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSigning ? "Signing…" : isConfirming ? "Creating…" : "Create"}
        </button>
      </div>
      {formError ? <p className="mt-2 text-sm text-red-600">{formError}</p> : null}
      {writeError ? (
        <p className="mt-2 text-sm text-red-600">{writeError.message}</p>
      ) : null}
      {created ? <ReadyLink id={created.id} link={created.link} /> : null}
    </section>
  );
}

// The link a merchant just created, shown until it has done its job. Once the invoice is paid or
// cancelled the list below carries the status, so the card goes away on its own.
function ReadyLink({ id, link }: { id: `0x${string}`; link: string }) {
  const { invoice } = useInvoice(id);
  const [copied, setCopied] = useState(false);

  if (invoice && invoice.status !== InvoiceStatus.Open) return null;

  return (
    <div className="mt-4 rounded-xl bg-green-50 p-4">
      <p className="mb-2 text-sm text-green-800">Payment request ready.</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-neutral-700">
          {link}
        </code>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className="shrink-0 rounded-lg border border-green-300 px-3 py-2 text-xs font-medium text-green-800 hover:bg-green-100"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function InvoiceList({ ids }: { ids: `0x${string}`[] }) {
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

// Only an open invoice can still be paid, so only it offers its link. This copies; the old "Copy pay
// link" was an anchor that opened the pay page instead.
function CopyPayLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
    >
      {copied ? "Copied" : "Copy pay link"}
    </button>
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
        {invoice.status === InvoiceStatus.Open ? <CopyPayLink link={link} /> : null}
      </div>
      <StatusBadge status={invoice.status} />
    </div>
  );
}
