import {
  createPasskeyWithPrfOutput,
  getPasskeyPrfOutput,
  isMeraError,
} from "@category-labs/mera";
import type { PasskeyCredentialMetadata } from "@category-labs/mera";
import { accountFromPrfOutput, type PasskeyAccount } from "./meraDerive";

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

export async function signInWithPasskey(): Promise<PasskeyAccount> {
  const known = readCredential();
  const { prfOutput, credentialId } = await getPasskeyPrfOutput({
    rpId: rpId(),
    credential: known,
  });
  // With no stored record the browser may have used any discoverable passkey; remember which.
  writeCredential(known?.credentialId === credentialId ? known : { credentialId });
  return startSession(prfOutput);
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
