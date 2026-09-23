import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-semibold">Merchant Rails</h1>
      <p className="text-neutral-600">
        Pay an invoice, settle in under a second.
      </p>
      <Link
        href="/merchant"
        className="rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-700"
      >
        I&apos;m a merchant
      </Link>
      <p className="text-sm text-neutral-400">
        Customers arrive here from a payment link a merchant sends them.
      </p>
    </main>
  );
}
