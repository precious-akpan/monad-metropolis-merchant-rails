// viem's full message includes the raw request and call data; its shortMessage is the readable part.
// Anything still long is cut to its first line so a form never shows a wall of text.
export function describeTxError(error: Error | null | undefined): string {
  if (!error) return "";
  const text = (error as { shortMessage?: string }).shortMessage ?? error.message;
  const firstLine = text.split("\n")[0].trim();
  return firstLine.length > 160 ? `${firstLine.slice(0, 157)}…` : firstLine;
}
