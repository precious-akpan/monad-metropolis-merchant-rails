"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { StatusBadge } from "@/components/StatusBadge";
import { monadTestnet } from "@/lib/chain";
import {
  MERCHANT_RAILS_ADDRESS,
  merchantRailsContract,
  mockUsdContract,
} from "@/lib/contracts";
import { formatUsd, truncateAddress } from "@/lib/format";
import { InvoiceStatus, useInvoice } from "@/lib/useInvoice";

type Step = "idle" | "approving" | "paying" | "done";

export function PayClient({ id }: { id: `0x${string}` }) {
  const { invoice, exists, isLoading, refetch } = useInvoice(id);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-xl font-semibold">Merchant Rails</h1>
      </header>

      {isLoading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : !exists || !invoice ? (
        <p className="text-neutral-600">
          We couldn&apos;t find this payment request. Double-check the link.
        </p>
      ) : invoice.status === InvoiceStatus.Paid ? (
        <SettledCard label="This has already been paid." />
      ) : invoice.status === InvoiceStatus.Cancelled ? (
        <SettledCard label="This payment request was cancelled." />
      ) : (
        <OpenInvoice id={id} amount={invoice.amount} merchant={invoice.merchant} onSettled={refetch} />
      )}
    </main>
  );
}

function SettledCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-neutral-600">
      {label}
    </div>
  );
}

function OpenInvoice({
  id,
  amount,
  merchant,
  onSettled,
}: {
  id: `0x${string}`;
  amount: bigint;
  merchant: `0x${string}`;
  onSettled: () => void;
}) {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-sm text-neutral-500">
          {truncateAddress(merchant)} is requesting
        </p>
        <p className="mt-1 text-4xl font-semibold">{formatUsd(amount)}</p>
      </div>

      {!isConnected ? (
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      ) : (
        <NetworkGuard>
          <PaymentFlow id={id} amount={amount} payer={address!} onSettled={onSettled} />
        </NetworkGuard>
      )}
    </div>
  );
}

function PaymentFlow({
  id,
  amount,
  payer,
  onSettled,
}: {
  id: `0x${string}`;
  amount: bigint;
  payer: `0x${string}`;
  onSettled: () => void;
}) {
  const [step, setStep] = useState<Step>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...mockUsdContract,
    functionName: "balanceOf",
    args: [payer],
    query: { refetchInterval: 3000 },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...mockUsdContract,
    functionName: "allowance",
    args: [payer, MERCHANT_RAILS_ADDRESS],
  });

  const mint = useWriteContract();
  const mintReceipt = useWaitForTransactionReceipt({ hash: mint.data });
  useEffect(() => {
    if (mintReceipt.data) refetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintReceipt.data]);

  const approve = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });

  const pay = useWriteContract();
  const payReceipt = useWaitForTransactionReceipt({ hash: pay.data });

  // Sequence: once approve confirms, move on to pay automatically.
  useEffect(() => {
    if (step === "approving" && approveReceipt.data) {
      refetchAllowance();
      setStep("paying");
      pay.writeContract({ ...merchantRailsContract, functionName: "pay", args: [id] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveReceipt.data]);

  useEffect(() => {
    if (step === "paying" && payReceipt.data && startedAt) {
      setElapsedMs(Date.now() - startedAt);
      setStep("done");
      onSettled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payReceipt.data]);

  const hasFunds = balance !== undefined && balance >= amount;
  const hasAllowance = allowance !== undefined && allowance >= amount;

  function handlePay() {
    setStartedAt(Date.now());
    if (!hasAllowance) {
      setStep("approving");
      approve.writeContract({
        ...mockUsdContract,
        functionName: "approve",
        args: [MERCHANT_RAILS_ADDRESS, amount],
      });
    } else {
      setStep("paying");
      pay.writeContract({ ...merchantRailsContract, functionName: "pay", args: [id] });
    }
  }

  if (step === "done" && payReceipt.data) {
    return (
      <SuccessCard txHash={payReceipt.data.transactionHash} elapsedMs={elapsedMs} />
    );
  }

  const busy = step === "approving" || step === "paying";
  const label =
    step === "approving"
      ? approveReceipt.isLoading
        ? "Approving…"
        : "Confirm in wallet…"
      : step === "paying"
        ? payReceipt.isLoading
          ? "Paying…"
          : "Confirm in wallet…"
        : "Pay";

  return (
    <div className="flex flex-col gap-3">
      {!hasFunds ? (
        <button
          onClick={() => {
            mint.writeContract({
              ...mockUsdContract,
              functionName: "mint",
              args: [payer, amount],
            });
          }}
          disabled={mint.isPending || mintReceipt.isLoading}
          className="rounded-xl border border-neutral-300 px-5 py-3 font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          {mint.isPending || mintReceipt.isLoading
            ? "Adding test funds…"
            : "Add test funds (testnet only)"}
        </button>
      ) : null}
      <button
        onClick={handlePay}
        disabled={busy || !hasFunds}
        className="rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {(approve.error || pay.error || mint.error) ? (
        <p className="text-sm text-red-600">
          {(approve.error ?? pay.error ?? mint.error)?.message}
        </p>
      ) : null}
    </div>
  );
}

function SuccessCard({
  txHash,
  elapsedMs,
}: {
  txHash: `0x${string}`;
  elapsedMs: number | null;
}) {
  const seconds = elapsedMs !== null ? (elapsedMs / 1000).toFixed(1) : null;
  const explorerUrl = `${monadTestnet.blockExplorers.default.url}/tx/${txHash}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
      <StatusBadge status={InvoiceStatus.Paid} />
      <p className="text-lg font-medium text-green-900">
        {seconds ? `Settled in ${seconds}s.` : "Settled."}
      </p>
      <p className="text-sm text-green-700">
        A card payment takes 2–3 business days and around 3% in fees.
      </p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 text-sm font-medium text-green-800 underline underline-offset-2"
      >
        See it settle on-chain →
      </a>
    </div>
  );
}
