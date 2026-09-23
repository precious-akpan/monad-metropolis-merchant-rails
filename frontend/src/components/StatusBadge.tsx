import { InvoiceStatus, type InvoiceStatusValue } from "@/lib/useInvoice";

const STYLES: Record<InvoiceStatusValue, string> = {
  [InvoiceStatus.None]: "bg-neutral-100 text-neutral-500",
  [InvoiceStatus.Open]: "bg-blue-100 text-blue-700",
  [InvoiceStatus.Paid]: "bg-green-100 text-green-700",
  [InvoiceStatus.Cancelled]: "bg-neutral-200 text-neutral-500",
};

const LABELS: Record<InvoiceStatusValue, string> = {
  [InvoiceStatus.None]: "Not found",
  [InvoiceStatus.Open]: "Awaiting payment",
  [InvoiceStatus.Paid]: "Paid",
  [InvoiceStatus.Cancelled]: "Cancelled",
};

export function StatusBadge({ status }: { status: InvoiceStatusValue }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
