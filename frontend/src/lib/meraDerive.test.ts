import { randomBytes } from "node:crypto";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { recoverMessageAddress, toHex } from "viem";
import { mnemonicToAccount, privateKeyToAddress } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { EVM_ACCOUNT_PATH, accountFromPrfOutput, recoveryPhraseFromPrfOutput } from "./meraDerive";

const prf = () => new Uint8Array(randomBytes(32));

describe("passkey account derivation", () => {
  it("is deterministic: the same PRF output gives the same address", () => {
    const output = prf();
    const a = accountFromPrfOutput(output);
    const b = accountFromPrfOutput(output);
    expect(a.account.address).toBe(b.account.address);
    a.session.end();
    b.session.end();
  });

  it("gives different accounts for different PRF outputs", () => {
    const a = accountFromPrfOutput(prf());
    const b = accountFromPrfOutput(prf());
    expect(a.account.address).not.toBe(b.account.address);
    a.session.end();
    b.session.end();
  });

  it("matches an independent BIP-39 / BIP-44 derivation of the same phrase", () => {
    const output = prf();
    const phrase = recoveryPhraseFromPrfOutput(output);
    const key = HDKey.fromMasterSeed(mnemonicToSeedSync(phrase)).derive(EVM_ACCOUNT_PATH).privateKey!;
    const { account, session } = accountFromPrfOutput(output);
    expect(account.address).toBe(privateKeyToAddress(toHex(key)));
    session.end();
  });

  it("signs messages that recover to the account address", async () => {
    const { account, session } = accountFromPrfOutput(prf());
    const signature = await account.signMessage({ message: "merchant rails" });
    expect(await recoverMessageAddress({ message: "merchant rails", signature })).toBe(account.address);
    session.end();
  });

  it("cannot sign once the session has ended", async () => {
    const { account, session } = accountFromPrfOutput(prf());
    session.end();
    await expect(account.signMessage({ message: "after sign-out" })).rejects.toThrow();
  });

  it("does not modify the PRF output it is given", () => {
    const output = prf();
    const copy = new Uint8Array(output);
    accountFromPrfOutput(output).session.end();
    expect(output).toEqual(copy);
  });
});

describe("recovery phrase", () => {
  it("is 24 valid BIP-39 words and deterministic", () => {
    const output = prf();
    const phrase = recoveryPhraseFromPrfOutput(output);
    expect(phrase.split(" ")).toHaveLength(24);
    expect(validateMnemonic(phrase, wordlist)).toBe(true);
    expect(recoveryPhraseFromPrfOutput(output)).toBe(phrase);
  });
});

// Fixed vectors, so the PRF-to-phrase mapping itself is pinned (not just self-consistent). All-zero and
// all-ones 256-bit entropy are the standard BIP-39 test vectors; viem derives the expected address from
// the literal phrase with its own, separate implementation.
describe("known BIP-39 vectors", () => {
  const vectors: [string, Uint8Array, string][] = [
    ["all-zero entropy", new Uint8Array(32), `${"abandon ".repeat(23)}art`],
    ["all-ones entropy", new Uint8Array(32).fill(0xff), `${"zoo ".repeat(23)}vote`],
    // The two above read the same backwards; this official vector does not, so byte order is pinned too.
    [
      "asymmetric entropy",
      Uint8Array.from(Buffer.from("f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f", "hex")),
      "void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold",
    ],
  ];

  it.each(vectors)("%s gives the standard phrase and the account viem derives from it", (_name, output, phrase) => {
    expect(recoveryPhraseFromPrfOutput(output)).toBe(phrase);
    const { account, session } = accountFromPrfOutput(output);
    expect(account.address).toBe(mnemonicToAccount(phrase).address);
    session.end();
  });
});
