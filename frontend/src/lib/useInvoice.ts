import { useReadContract } from "wagmi";
import { merchantRailsContract } from "./contracts";

export const InvoiceStatus = {
  None: 0,
  Open: 1,
  Paid: 2,
  Cancelled: 3,
} as const;

export type InvoiceStatusValue = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface Invoice {
  merchant: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  expiresAt: bigint;
  status: InvoiceStatusValue;
}

/**
 * Live on-chain invoice state. No indexer in v1 (see lib/invoiceStorage.ts) -- this hook is the
 * source of truth for status, polled on an interval so dashboard rows and the pay page both
 * reflect a payment as soon as it lands, without a manual refresh.
 */
export function useInvoice(id: `0x${string}` | undefined) {
  const { data, isLoading, isError, refetch } = useReadContract({
    ...merchantRailsContract,
    functionName: "invoices",
    args: id ? [id] : undefined,
    query: {
      enabled: Boolean(id),
      refetchInterval: 3000,
    },
  });

  // invoices() returns a positional tuple: [merchant, token, amount, expiresAt, status]
  const invoice: Invoice | undefined = data
    ? {
        merchant: data[0],
        token: data[1],
        amount: data[2],
        expiresAt: data[3],
        status: data[4] as InvoiceStatusValue,
      }
    : undefined;

  const exists = invoice !== undefined && invoice.status !== InvoiceStatus.None;

  return { invoice, exists, isLoading, isError, refetch };
}
