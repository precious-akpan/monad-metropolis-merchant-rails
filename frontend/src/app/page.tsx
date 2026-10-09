import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-semibold">Get paid by clients anywhere, in seconds.</h1>
      <p className="text-neutral-600">
        Send a pay link. Your client pays in AUSD and the money reaches you in under a second, not days.
      </p>
      <Link
        href="/merchant"
        className="rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-700"
      >
        Create a payment link
      </Link>
      <p className="text-sm text-neutral-400">
        Paying someone? Open the link they sent you.
      </p>
    </main>
  );
}
