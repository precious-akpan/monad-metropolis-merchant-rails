import { createSecp256k1SigningSession } from "@category-labs/mera";
import type { Secp256k1SigningSession } from "@category-labs/mera";
import { toViemAccount } from "@category-labs/mera/viem";
import { HDKey } from "@scure/bip32";
import { entropyToMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import type { LocalAccount } from "viem";

// First BIP-44 Ethereum account; same mapping as Mera's "Create passkey accounts" recipe.
export const EVM_ACCOUNT_PATH = "m/44'/60'/0'/0/0";

export type PasskeyAccount = {
  account: LocalAccount;
  session: Secp256k1SigningSession;
};

export function accountFromPrfOutput(prfOutput: Uint8Array): PasskeyAccount {
  const seed = mnemonicToSeedSync(entropyToMnemonic(prfOutput, wordlist));
  const root = HDKey.fromMasterSeed(seed);
  const node = root.derive(EVM_ACCOUNT_PATH);
  try {
    if (node.privateKey === null) throw new Error("derivation produced no key");
    // The session copies the key and zeroes only its own copy on end(); wipe ours below.
    const session = createSecp256k1SigningSession({ privateKey: node.privateKey });
    return { account: toViemAccount(session), session };
  } finally {
    node.wipePrivateData();
    root.wipePrivateData();
    seed.fill(0);
  }
}
