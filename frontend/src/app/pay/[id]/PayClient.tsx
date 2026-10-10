"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { StatusBadge } from "@/components/StatusBadge";
import { monadTestnet } from "@/lib/chain";
import { MIN_GAS_BALANCE } from "@/lib/gas";
import {
  MERCHANT_RAILS_ADDRESS,
  ausdFaucetContract,
  isAusd,
  merchantRailsContract,
  mockUsdContract,
  tokenContract,
  tokenLabel,
} from "@/lib/contracts";
import { TokenBalance } from "@/components/TokenBalance";
import { formatUsd, truncateAddress } from "@/lib/format";
import { InvoiceStatus, useInvoice } from "@/lib/useInvoice";

type Step = "idle" | "approving" | "paying" | "done";

// How long a pay transaction may have a hash and no receipt before we say so and offer a way to check.
const SLOW_CONFIRM_MS = 20_000;
type Settlement = { txHash: `0x${string}`; elapsedMs: number | null };

export function PayClient({ id }: { id: `0x${string}` }) {
  const { invoice, exists, isLoading, refetch } = useInvoice(id);
  // Held here, above the live-status switch, so the refetch that follows a payment flipping the
  // invoice to Paid can't unmount the success screen out from under the payer.
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  // The 3s status poll can see Paid in the gap between this payer's tx landing and its receipt
  // resolving. While their own payment is in flight, Paid must not swap the flow out, or the
  // success state is unmounted before it is ever set.
  const [payInFlight, setPayInFlight] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-xl font-semibold">Merchant Rails</h1>
      </header>

      {settlement ? (
        <SuccessCard txHash={settlement.txHash} elapsedMs={settlement.elapsedMs} />
      ) : isLoading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : !exists || !invoice ? (
        <p className="text-neutral-600">
          We couldn&apos;t find this payment request. Double-check the link.
        </p>
      ) : invoice.status === InvoiceStatus.Paid && !payInFlight ? (
        <SettledCard label="This has already been paid." />
      ) : invoice.status === InvoiceStatus.Cancelled ? (
        <SettledCard label="This payment request was cancelled." />
      ) : (
        <OpenInvoice
          id={id}
          amount={invoice.amount}
          merchant={invoice.merchant}
          token={invoice.token}
          onPayStart={() => setPayInFlight(true)}
          onSettled={(result) => {
            setSettlement(result);
            refetch();
          }}
        />
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
  token,
  onPayStart,
  onSettled,
}: {
  id: `0x${string}`;
  amount: bigint;
  merchant: `0x${string}`;
  token: `0x${string}`;
  onPayStart: () => void;
  onSettled: (result: Settlement) => void;
}) {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-sm text-neutral-500">
          {truncateAddress(merchant)} is requesting
        </p>
        <p className="mt-1 text-4xl font-semibold">{formatUsd(amount)}</p>
        <p className="mt-1 text-xs text-neutral-400">Paid in {tokenLabel(token)}</p>
      </div>

      {!isConnected ? (
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      ) : (
        <NetworkGuard>
          <PaymentFlow
            id={id}
            amount={amount}
            token={token}
            payer={address!}
            onPayStart={onPayStart}
            onSettled={onSettled}
          />
        </NetworkGuard>
      )}
    </div>
  );
}

function PaymentFlow({
  id,
  amount,
  token,
  payer,
  onPayStart,
  onSettled,
}: {
  id: `0x${string}`;
  amount: bigint;
  token: `0x${string}`;
  payer: `0x${string}`;
  onPayStart: () => void;
  onSettled: (result: Settlement) => void;
}) {
  const [step, setStep] = useState<Step>("idle");
  const { invoice, refetch: refetchInvoice } = useInvoice(id);
  // Runs the finish once, whichever signal (receipt or invoice status) arrives first.
  const finished = useRef(false);
  // Set when a pay transaction has had a hash for a while with no receipt seen yet.
  const [slow, setSlow] = useState(false);
  const erc20 = tokenContract(token);
  // Clock starts when the pay transaction is broadcast (the wallet hands back a hash), not when the
  // button is clicked, so the settle time excludes however long the payer took to approve popups.
  const paySentAt = useRef<number | null>(null);

  // Monad reserves a transaction's whole gas limit up front, so an account too low in MON cannot send
  // the claim, approve or pay. Sending anyway leaves the payer waiting on a transaction that never
  // lands; hold the buttons until the gas notice has topped the account up.
  const { data: native } = useBalance({ address: payer, query: { refetchInterval: 3000 } });
  const lowGas = native !== undefined && native.value < MIN_GAS_BALANCE;

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...erc20,
    functionName: "balanceOf",
    args: [payer],
    query: { refetchInterval: 3000 },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...erc20,
    functionName: "allowance",
    args: [payer, MERCHANT_RAILS_ADDRESS],
  });

  // Testnet only: AUSD comes from Agora's faucet; the older test token has an open mint.
  const claim = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claim.data });
  useEffect(() => {
    if (claimReceipt.data) refetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimReceipt.data]);

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
    if (pay.data) paySentAt.current = Date.now();
  }, [pay.data]);

  useEffect(() => {
    if (step !== "paying" || !pay.data) return;
    const timer = setTimeout(() => setSlow(true), SLOW_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [step, pay.data]);

  function finish(txHash: `0x${string}`) {
    if (finished.current) return;
    finished.current = true;
    setStep("done");
    onSettled({
      txHash,
      elapsedMs: paySentAt.current !== null ? Date.now() - paySentAt.current : null,
    });
  }

  // Signal one: the receipt for our pay transaction.
  useEffect(() => {
    if (step === "paying" && payReceipt.data) finish(payReceipt.data.transactionHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payReceipt.data]);

  // Signal two: the invoice itself turned Paid after we sent our pay transaction. On a slow or flaky
  // RPC the receipt can be missed even though the payment landed, so do not wait on it alone. (If
  // someone else paid the same invoice first, the explorer link shows what happened to ours.)
  useEffect(() => {
    if (step === "paying" && pay.data && invoice?.status === InvoiceStatus.Paid) finish(pay.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pay.data, invoice?.status]);

  const hasFunds = balance !== undefined && balance >= amount;
  const hasAllowance = allowance !== undefined && allowance >= amount;

  function handlePay() {
    paySentAt.current = null;
    finished.current = false;
    setSlow(false);
    onPayStart();
    if (!hasAllowance) {
      setStep("approving");
      approve.writeContract({
        ...erc20,
        functionName: "approve",
        args: [MERCHANT_RAILS_ADDRESS, amount],
      });
    } else {
      setStep("paying");
      pay.writeContract({ ...merchantRailsContract, functionName: "pay", args: [id] });
    }
  }

  // If sending the approve or the pay failed, nothing is in flight any more: let the payer try again
  // instead of leaving a disabled button behind.
  const failed =
    (step === "approving" && Boolean(approve.error)) || (step === "paying" && Boolean(pay.error));
  const busy = (step === "approving" || step === "paying") && !failed;
  const label = failed
    ? "Try again"
    : lowGas && !busy
      ? "Waiting for network fees…"
      : step === "approving"
      ? approve.data
        ? "Approving…"
        : "Signing…"
      : step === "paying"
        ? pay.data
          ? "Paying…"
          : "Signing…"
        : "Pay";

  return (
    <div className="flex flex-col gap-3">
      <TokenBalance token={token} owner={payer} />
      {!hasFunds ? (
        <button
          onClick={() => {
            if (isAusd(token)) {
              claim.writeContract({
                ...ausdFaucetContract,
                functionName: "requestFunds",
                args: [payer],
              });
            } else {
              claim.writeContract({
                ...mockUsdContract,
                functionName: "mint",
                args: [payer, amount],
              });
            }
          }}
          disabled={claim.isPending || claimReceipt.isLoading || lowGas}
          className="rounded-xl border border-neutral-300 px-5 py-3 font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          {claim.isPending || claimReceipt.isLoading
            ? `Getting test ${tokenLabel(token)}…`
            : `Get test ${tokenLabel(token)} (testnet only)`}
        </button>
      ) : null}
      <button
        onClick={handlePay}
        disabled={busy || !hasFunds || lowGas}
        className="rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {step === "paying" && slow && pay.data ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p>Still confirming. It may have gone through, or the network may not have accepted it.</p>
          <div className="mt-1 flex gap-4 text-xs">
            <a
              href={`${monadTestnet.blockExplorers.default.url}/tx/${pay.data}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              See it on the explorer
            </a>
            <button
              type="button"
              onClick={() => {
                payReceipt.refetch();
                refetchInvoice();
              }}
              className="underline underline-offset-2"
            >
              Check again
            </button>
            <button type="button" onClick={handlePay} className="underline underline-offset-2">
              Send again
            </button>
          </div>
        </div>
      ) : null}
      {(approve.error || pay.error || claim.error || approveReceipt.error || payReceipt.error || claimReceipt.error) ? (
        <p className="text-sm text-red-600">
          {errorText(
            approve.error ?? pay.error ?? claim.error ?? approveReceipt.error ?? payReceipt.error ?? claimReceipt.error,
          )}
        </p>
      ) : null}
    </div>
  );
}

// viem's full message includes the raw request and call data; its shortMessage is the readable part.
function errorText(error: Error | null | undefined): string {
  if (!error) return "";
  return (error as { shortMessage?: string }).shortMessage ?? error.message;
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
        Card and bank payments across borders can take days to settle.
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
