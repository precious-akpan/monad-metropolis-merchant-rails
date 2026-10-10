import { getAddress, isAddress, zeroAddress } from "viem";
import { AUSD_ADDRESS, AUSD_FAUCET_ADDRESS, MERCHANT_RAILS_ADDRESS, MOCK_USD_ADDRESS } from "./contracts";
import { parseUsd } from "./format";

// Tokens sent to these contracts cannot be taken back out, so they are refused as recipients.
const CONTRACTS = [AUSD_ADDRESS, AUSD_FAUCET_ADDRESS, MERCHANT_RAILS_ADDRESS, MOCK_USD_ADDRESS].map((a) =>
  a.toLowerCase(),
);

export type SendCheck =
  | { ok: true; to: `0x${string}`; amount: bigint }
  | { ok: false; error: string };

// Everything that can be wrong with a send, checked before anything is signed. A mixed-case address
// must carry a valid checksum (isAddress enforces it); an all-lowercase one is accepted as typed.
export function checkSend(input: {
  to: string;
  amount: string;
  from: string;
  balance: bigint | undefined;
}): SendCheck {
  const to = input.to.trim();
  if (!isAddress(to)) return { ok: false, error: "That isn't a valid address. Check it and try again." };
  const checksummed = getAddress(to);
  if (checksummed === zeroAddress) return { ok: false, error: "That address can't receive funds." };
  if (checksummed.toLowerCase() === input.from.toLowerCase()) {
    return { ok: false, error: "That's your own address." };
  }
  if (CONTRACTS.includes(checksummed.toLowerCase())) {
    return { ok: false, error: "That's a contract address, and funds sent there can't be recovered." };
  }
  let amount: bigint;
  try {
    amount = parseUsd(input.amount);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Enter an amount like 25 or 25.50" };
  }
  if (amount === 0n) return { ok: false, error: "Enter an amount above zero." };
  if (input.balance !== undefined && amount > input.balance) {
    return { ok: false, error: "That's more than your balance." };
  }
  return { ok: true, to: checksummed, amount };
}
