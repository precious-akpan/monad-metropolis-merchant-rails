import {
  createPasskeyWithPrfOutput,
  getPasskeyPrfOutput,
  isMeraError,
} from "@category-labs/mera";
import type { PasskeyCredentialMetadata } from "@category-labs/mera";
import { accountFromPrfOutput, recoveryPhraseFromPrfOutput, type PasskeyAccount } from "./meraDerive";

// Credential metadata only (credential id + transports); it holds no key material.
const CREDENTIAL_KEY = "merchant-rails:mera-credential";

// Lives in memory only: a reload ends the session and the next sign-in is one passkey prompt.
let current: PasskeyAccount | null = null;

function rpId(): string {
  return window.location.hostname;
}

function readCredential(): PasskeyCredentialMetadata | undefined {
  try {
    const raw = window.localStorage.getItem(CREDENTIAL_KEY);
    return raw ? (JSON.parse(raw) as PasskeyCredentialMetadata) : undefined;
  } catch {
    return undefined;
  }
}

function writeCredential(credential: PasskeyCredentialMetadata): void {
  try {
    window.localStorage.setItem(CREDENTIAL_KEY, JSON.stringify(credential));
  } catch {
    // Storage blocked: sign-in still works, the browser just offers every passkey for this site.
  }
}

export function hasStoredPasskey(): boolean {
  return readCredential() !== undefined;
}

export function currentPasskeyAccount(): PasskeyAccount | null {
  return current;
}

function startSession(prfOutput: Uint8Array): PasskeyAccount {
  endPasskeySession();
  try {
    current = accountFromPrfOutput(prfOutput);
  } finally {
    prfOutput.fill(0);
  }
  return current;
}

export function endPasskeySession(): void {
  current?.session.end();
  current = null;
}

export async function createPasskeyAccount(): Promise<PasskeyAccount> {
  const created = await createPasskeyWithPrfOutput({
    rp: { id: rpId(), name: "Merchant Rails" },
    user: { name: "merchant-rails", displayName: "Merchant Rails account" },
  });
  writeCredential({
    credentialId: created.credentialId,
    transports: created.transports,
  });
  return startSession(created.prfOutput);
}

// By default sign-in is pinned to the passkey last used here. With `choose`, nothing is pinned and
// the browser shows its own picker, which is how a different account's passkey is reached.
export async function signInWithPasskey({
  choose = false,
}: { choose?: boolean } = {}): Promise<PasskeyAccount> {
  const stored = readCredential();
  const { prfOutput, credentialId } = await getPasskeyPrfOutput({
    rpId: rpId(),
    credential: choose ? undefined : stored,
  });
  // Without a pin the browser may have used any discoverable passkey; remember which.
  writeCredential(stored?.credentialId === credentialId ? stored : { credentialId });
  return startSession(prfOutput);
}

// Shows the words behind the signed-in account. It asks for the passkey again (a fresh touch, not
// the in-memory session) and refuses if that passkey is a different account's, so the phrase on
// screen is always the one for the address in the header. Nothing is stored or logged.
export async function revealRecoveryPhrase(expectedAddress: string): Promise<string> {
  const { prfOutput } = await getPasskeyPrfOutput({ rpId: rpId(), credential: readCredential() });
  try {
    const { account, session } = accountFromPrfOutput(prfOutput);
    session.end();
    if (account.address.toLowerCase() !== expectedAddress.toLowerCase()) {
      throw new Error("That passkey belongs to a different account. Use the one you signed in with.");
    }
    return recoveryPhraseFromPrfOutput(prfOutput);
  } finally {
    prfOutput.fill(0);
  }
}

export function describePasskeyError(error: unknown): string {
  if (isMeraError(error)) {
    if (error.code === "PRF_UNAVAILABLE") {
      return "This browser or device can't create a passkey account. Try Chrome signed in to your Google account, or Safari on a recent iPhone or Mac.";
    }
    if (error.code === "PASSKEY_OPERATION_FAILED") {
      return "The passkey prompt was cancelled or didn't finish. Try again.";
    }
  }
  return error instanceof Error ? error.message : "Something went wrong. Try again.";
}
