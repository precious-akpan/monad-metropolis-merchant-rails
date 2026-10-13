// Agora's shared test faucet allows one claim at a time across every user and reverts with
// MaxFrequencyExceeded() (selector 0x20e5bc67) in between. Not our bug, and it clears in seconds.
export const FAUCET_BUSY_MESSAGE =
  "The test-money faucet is busy: it serves one request at a time for everyone. Try again in a few seconds.";

export function isFaucetBusy(error: unknown): boolean {
  for (let e: unknown = error, depth = 0; e && depth < 6; depth++) {
    const err = e as { message?: string; shortMessage?: string; details?: string; data?: unknown; cause?: unknown };
    const text = [err.message, err.shortMessage, err.details, typeof err.data === "string" ? err.data : ""].join(" ");
    if (/MaxFrequencyExceeded|0x20e5bc67/i.test(text)) return true;
    e = err.cause;
  }
  return false;
}

// viem's full message includes the raw request and call data; its shortMessage is the readable part.
// Anything still long is cut to its first line so a form never shows a wall of text.
export function describeTxError(error: Error | null | undefined): string {
  if (!error) return "";
  if (isFaucetBusy(error)) return FAUCET_BUSY_MESSAGE;
  const text = (error as { shortMessage?: string }).shortMessage ?? error.message;
  const firstLine = text.split("\n")[0].trim();
  return firstLine.length > 160 ? `${firstLine.slice(0, 157)}…` : firstLine;
}
