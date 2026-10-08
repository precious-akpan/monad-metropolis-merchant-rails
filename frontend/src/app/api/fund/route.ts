import { createPublicClient, createWalletClient, getAddress, http, isAddress, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "@/lib/chain";

export const runtime = "nodejs";

// Testnet-only gas for brand-new passkey accounts. The amount is fixed here, never taken from the
// caller, and only accounts that cannot yet pay for a transaction are topped up.
const DRIP = parseEther("0.1");
const ENOUGH_GAS = parseEther("0.02");
const SPONSOR_RESERVE = parseEther("0.01");
const IP_WINDOW_MS = 60_000;

// Best effort only: serverless instances do not share memory, so this slows casual repeats and
// nothing more. The balance check above it is what actually bounds each address.
const recentByIp = new Map<string, number>();

const rpcUrl = monadTestnet.rpcUrls.default.http[0];

function reply(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      // A malformed Origin (for example the literal "null") is treated as foreign.
    }
    if (originHost !== host) return reply({ status: "forbidden" }, 403);
  }

  let address: unknown;
  try {
    ({ address } = await request.json());
  } catch {
    return reply({ status: "bad-request", error: "Send a JSON body with an address." }, 400);
  }
  if (typeof address !== "string" || !isAddress(address)) {
    return reply({ status: "bad-request", error: "That is not a valid address." }, 400);
  }
  const to = getAddress(address);

  const publicClient = createPublicClient({ chain: monadTestnet, transport: http(rpcUrl) });
  let balance: bigint;
  try {
    balance = await publicClient.getBalance({ address: to });
  } catch {
    return reply({ status: "error", error: "Couldn't check the account balance just now." }, 502);
  }
  if (balance >= ENOUGH_GAS) {
    return reply({ status: "not-needed" });
  }

  const key = process.env.SPONSOR_PRIVATE_KEY;
  if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) {
    return reply({ status: "unavailable", error: "Automatic funding isn't set up here." }, 503);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const last = recentByIp.get(ip);
  if (last !== undefined && now - last < IP_WINDOW_MS) {
    return reply({ status: "rate-limited", error: "Please wait a minute and try again." }, 429);
  }
  if (recentByIp.size > 1000) recentByIp.clear();
  recentByIp.set(ip, now);

  const sponsor = privateKeyToAccount(key as `0x${string}`);
  try {
    const sponsorBalance = await publicClient.getBalance({ address: sponsor.address });
    if (sponsorBalance < DRIP + SPONSOR_RESERVE) {
      recentByIp.delete(ip);
      return reply({ status: "unavailable", error: "Funding is temporarily out of test MON." }, 503);
    }
    const wallet = createWalletClient({ account: sponsor, chain: monadTestnet, transport: http(rpcUrl) });
    const hash = await wallet.sendTransaction({ to, value: DRIP });
    return reply({ status: "sent", hash });
  } catch {
    // Nothing was sent, so do not make the caller wait out the rate limit to retry.
    recentByIp.delete(ip);
    return reply({ status: "error", error: "Couldn't send test MON just now." }, 502);
  }
}
