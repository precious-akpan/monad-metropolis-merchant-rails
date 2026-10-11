# Merchant Rails

**Get paid by clients anywhere, in seconds.** A non-custodial invoice checkout on Monad: a freelancer or small
merchant shares one pay link, the client signs in with a passkey (no wallet extension, no seed phrase) and pays
in AUSD, and the money reaches the merchant in under a second. The contract never holds funds.

Built for the Monad Metropolis hackathon, **Track 02: Consumer Products & Payments**, and for the Agora
Cross-Border Payments and Mera-Powered UX bounties.

| | |
|---|---|
| **Live app** | https://merchant-rails.vercel.app/ (Monad testnet; installable on a phone) |
| **Source** | https://github.com/precious-akpan/monad-metropolis-merchant-rails (MIT) |
| **Settlement** | Measured **0.3 to 0.9 s** from broadcast to confirmed receipt on Monad testnet |
| **Contract** | `MerchantRails` at `0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6` ([explorer](https://testnet.monadvision.com/address/0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6)) |
| **Build notes** | [docs/PLAN.md](docs/PLAN.md): the schedule, rules analysis and decision log |

## Try it in two minutes

No login details are needed; accounts are passkeys. Use Chrome, Edge or Safari on a device with a platform
passkey (Google Password Manager, iCloud Keychain, Windows Hello). Passkeys are tied to the site's domain.

1. Open `/merchant` and press **Create account with passkey**. A few seconds later "Setting up your account…" appears and
   clears on its own: the account is topped up with test MON for fees automatically.
2. Enter an amount and a note, press **Create**, then **Copy link**. That is the pay link.
3. Open the link in a second browser profile or a private window and press **Create account with passkey** as
   the client. Wait for the top-up.
4. Press **Get test AUSD (testnet only)** to claim from Agora's AUSD faucet, then **Pay**. The success screen
   shows the settle time and a link to the transaction on the explorer. The merchant dashboard flips to Paid on
   its own.

## How it works

```
merchant                      MerchantRails (Monad)                       client
   | createInvoice(AUSD, amount) -> id                                       |
   |------------------------------------------ pay link /pay/<id> --------->|
   |                                  approve(AUSD) <------------------------|
   |                                  pay(id): AUSD client -> merchant (-0.30%) -> feeRecipient
   |<-- dashboard shows Paid                                   success + explorer link
```

- **Non-custodial.** `pay` moves the stablecoin straight from payer to merchant with `SafeERC20`; the contract
  holds nothing, and tests assert that.
- **Passkey accounts.** A passkey's WebAuthn PRF output becomes the account key through Mera; it lives only in
  memory while signed in. Accounts can be backed up as 24 words, and a merchant's request list is rebuilt from
  the chain, so it follows the account to a new device.
- **Send AUSD.** The dashboard can send AUSD to any other address, with the recipient checked and shown in full
  before signing.

## Why Monad

- **Finality fast enough to feel like a card tap.** A payment confirms in 0.3 to 0.9 s here. The success screen
  shows the real measured time (the clock starts when the pay transaction is broadcast), and links to the
  transaction on MonadVision so the settlement is visible, not just claimed.
- **Plain EVM.** The contract is standard Solidity built and tested with Foundry (`evm_version = cancun`), and
  the app uses viem and wagmi unchanged, so the whole stack worked on Monad without special handling.
- **Known costs, handled.** Monad charges a transaction's full gas limit up front, so an account too low in MON
  cannot send. The app tops new accounts up, holds the buttons while an account is low, and says so on screen.

## Bounties

**Agora: Best Cross-Border Payments App.** *"Build a mobile app letting users send AUSD across borders using
Mera passkey onboarding and instant settlement."*

| Requirement | Where |
|---|---|
| Mobile app | An installable PWA (manifest and icons; "Add to Home Screen", opens standalone). An organizer confirmed a PWA qualifies. |
| Send AUSD across borders | Invoices and payments are in Agora's AUSD; the dashboard also sends AUSD to any address. The framing is a freelancer in one country paid by a client in another. |
| Mera passkey onboarding | Passkey-only sign-in and account creation; no extension, no seed phrase in the UI. |
| Instant settlement | 0.3 to 0.9 s measured, shown on the success screen with the explorer link. |

**Best Mera-Powered UX.** *"Build an app on Monad where Mera is the entire account layer: no seed phrase, no
extension, no custody backend."* Mera is the only account layer; the injected-wallet connector is not offered.
The key is derived in the browser from the passkey and never sent anywhere. The only server code is a
testnet gas-top-up route that never sees a user key.

## Contracts and tests

`contracts/` (Foundry, solc 0.8.28, evm `cancun`, OpenZeppelin v5.6.1 + forge-std as git submodules)

- `src/MerchantRails.sol` — `createInvoice` → `pay` → (`cancelInvoice`). Invoice ids derived on-chain
  (no squatting), state set before transfers, `nonReentrant`, fee capped at 1% (default 0.30%), standard
  ERC-20s only.
- `src/MockUSD.sol` — 6-decimal open-mint demo token. **Testnet only.**
- `test/MerchantRails.t.sol` — 20 tests incl. double-pay, zero amount, expiry boundary, cancel auth, failed pay
  leaves invoice open, and a 1,000-run fuzz proving value conservation and that the contract holds nothing.
- `test/MerchantRailsReentrancy.t.sol` + `test/mocks/ReentrantERC20.sol` — 3 tests using an actively hostile
  token that tries to re-enter `pay()` (same invoice, a different invoice) and `cancelInvoice()` mid-payment.
  Proves both defense layers actually work: the `nonReentrant` guard, and checks-effects-interactions
  (status flips before any external call) independently of the guard.
- `test/invariant/` (`Handler.sol` + `MerchantRailsInvariant.t.sol`) — Foundry stateful fuzzing: random
  sequences of createInvoice/pay/cancelInvoice across multiple payers (128 runs × 200 calls = 25,600 calls),
  checking after every sequence: the contract never custodies funds, no invoice is ever double-settled
  (paid twice, cancelled twice, or both paid and cancelled), and value is conserved across the whole run.
- `script/Deploy.s.sol` — testnet deploy via Foundry keystore.
- `LICENSE` — MIT (required by Rules §7.2; matches forge-std and OpenZeppelin's own licenses).

**Static analysis:** Slither (100 detectors) run 2026-09-22 — 2 low-severity, expected findings ("uses
timestamp for comparisons" on the two `expiresAt` checks; irrelevant at hour/day granularity), nothing else.

**Honest scope note:** this is testnet-hackathon-grade rigor (unit + adversarial + fuzz + invariant tests,
clean static analysis), not a professionally audited contract. The design keeps the blast radius of any
undiscovered bug small — the contract never holds funds, so there's no pooled balance to drain — but the
contract is intentionally not upgradeable: there's no fix path beyond deploying a new address. Treat that
as the real cost of "no admin keys, no proxy," not a gap to paper over.

```sh
cd contracts
forge build && forge test
# deploy (create your keystore yourself first: cast wallet import monad-deployer --interactive)
forge script script/Deploy.s.sol --rpc-url monad_testnet --account monad-deployer --broadcast
```

## Deployed (Monad testnet, chain 10143)

| Contract | Address |
|---|---|
| **MerchantRails** | `0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6` |
| **AUSD** (Agora's stablecoin; the settlement asset) | `0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC` |
| **AUSD testnet faucet** (Agora's; `requestFunds(address)`) | `0xd236c18D274E54FAccC3dd9DDA4b27965a73ee6C` |

AUSD and its faucet are Agora's contracts, not ours; both were checked on Monad testnet on 2026-10-09: AUSD
reports 6 decimals (the same as MockUSD) and is an upgradeable proxy, and the faucet holds AUSD and reports
AUSD as its token. `MerchantRails` takes the token as an argument with no allowlist and moves funds with
SafeERC20, so it works with AUSD without redeploying.

`MockUSD` (`0x8954CadCE9B84DF214A77C3dCa5977573fb7E340`) is an earlier open-mint test token, testnet only and
superseded by AUSD; the app still opens invoices made in it.

**Source verified:** `MerchantRails` is verified on Monad's Sourcify (exact match on the runtime bytecode, 2026-10-10;
[check it](https://sourcify-api-monad.blockvision.org/v2/contract/10143/0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6)),
so its source can be read against what is deployed.

Deployer / fee recipient: `0x013032166b72D40C43Ccc6B8cf776E4763f58162`. `feeBps` = 30 (0.30%), confirmed by
calling `feeRecipient()`/`feeBps()` directly against the deployed bytecode, and the deploy tx's on-chain
`from` field, not just trusted from script output.

## Frontend

Next.js 16 (App Router, Tailwind) with `wagmi` 3, `viem`, `@tanstack/react-query` and **Mera**
(`@category-labs/mera`, pinned to 0.2.0: a preview release whose API may change before 1.0). The RPC URL and
contract and token addresses are public on-chain data in `frontend/src/lib/{chain,contracts}.ts`. The only
secret is a server-side gas-sponsor key, described below.

**Accounts are passkeys only.** A passkey's WebAuthn PRF output becomes the account seed (BIP-39, then the first
BIP-44 Ethereum path), held in an in-memory signing session that is zeroed on sign-out. This follows Mera's own
create-passkey-accounts and send-a-transaction recipes. The same passkey on the same site always reproduces the
same address; a different site (or `localhost`) is a different account.

- `src/lib/meraDerive.ts`: PRF output to account and to the 24-word phrase, pure and free of browser APIs.
- `src/lib/meraAccount.ts`: the passkey ceremonies and the in-memory session; only the credential id (no key
  material) is kept in `localStorage`. `revealRecoveryPhrase` asks for the passkey again and refuses a
  different account's passkey.
- `src/lib/meraConnector.ts`: a wagmi connector that supplies the passkey account as a viem wallet client through
  `getClient()`, so the standard hooks work unchanged.
- `src/components/ConnectButton.tsx`, `RecoveryPhrase.tsx`: create, sign in, "I already have an account" (the
  browser's passkey picker), and "Back up account".
- `src/components/GasNotice.tsx` and `src/app/api/fund/route.ts`: a new account holds no MON, so the notice asks the
  server to send 0.1 MON from a testnet-only sponsor key (server env var `SPONSOR_PRIVATE_KEY`). The amount is
  fixed, accounts that already hold enough gas are left alone, requests must be same-origin, and there is a
  best-effort per-IP limit. If funding is unavailable it shows the address to fund by hand.
- `src/lib/resilientTransport.ts`: an RPC transport for a slow public node. If a send fails because the reply was
  lost, it asks the node whether it knows that transaction's hash and treats a known transaction as success,
  otherwise re-sends the same signed bytes.
- `src/app/merchant/page.tsx`: create a payment request, get a shareable `/pay/<id>` link, watch status (read
  from the contract every 3 s, also in background tabs; there is no indexer). The list is rebuilt from the
  contract's public per-merchant counter (`src/lib/invoiceIds.ts`), so it follows the account across devices.
- `src/app/pay/[id]/PayClient.tsx`: the checkout. It reads the invoice on-chain, shows the payer's AUSD balance,
  offers "Get test AUSD (testnet only)", then one Pay button that sequences `approve` and `pay`. A slow
  confirmation says so and offers the explorer, "Check again" and "Send again".
- `src/components/SendFunds.tsx`, `src/lib/sendValidation.ts`: send AUSD with a checked, fully displayed recipient.
- `src/app/manifest.ts` and the icons: installable, opens standalone. There is no service worker; install does
  not need one and a worker risks caching wallet and RPC traffic.

**Limits, stated plainly.** This is a testnet product and the contract is unaudited. A PRF-capable authenticator
is required (Chrome signed in to Google, Safari on a recent iPhone or Mac, 1Password, and others); other
browsers see a clear message and no fallback, by design. The sponsor wallet holds only faucet-funded testnet MON
and can run dry or be drained by a script. A real on-ramp for payers who hold no stablecoin is not built. The contract lets a merchant cancel an unpaid
request (`cancelInvoice`), but the app has no cancel button yet. The
public RPC is slow and spiky, so a first load can take several seconds.

**What is and is not automated.** The contract has 26 Foundry tests. The app has 46 Vitest tests of its pure logic
(no browser, no network). The screens, the payment sequence and the passkey prompts have no automated tests: they
need a real authenticator and a live chain, so they were exercised by hand.

**Tested end to end** on production with real passkeys on Monad testnet: create an account, receive the
automatic MON top-up, claim test AUSD, pay an AUSD invoice and see **"Settled in 0.4s"** with the transfer on
the explorer; sign back in and get the same address; back up the account; send AUSD; and see a merchant's
requests on a second browser. Cross-device sign-in with a synced passkey is expected to work but is not
confirmed.

## Run it locally

```sh
cd frontend
pnpm install
pnpm dev            # http://localhost:3000
```

Passkey accounts made on `localhost` are separate from production ones. The gas top-up route needs a funded,
testnet-only key in `frontend/.env.local` (`SPONSOR_PRIVATE_KEY=0x...`); without it the app shows the address to
fund by hand. Tests: `pnpm test` (46 tests of the app's pure logic: account derivation and recovery phrase, Send checks,
invoice ids, amounts) and `cd contracts && forge build && forge test` (26 contract tests).

## AI tool disclosure

I used an AI coding agent (Claude Code) throughout this project, under my direction and review.
Specifically:

- **Contracts, tests, deploy script.** Drafted with the agent. I specified the payment and fee logic and every
  adversarial test case, and checked them line by line. The reentrancy mock (`ReentrantERC20.sol`), its 3 tests,
  and the invariant handler and campaign were agent-drafted; I ran and inspected them (26/26 passing, 25,600
  fuzzed calls, 0 invariant violations) before trusting them.
- **Frontend.** Written by the agent end to end: pages, components, the on-chain read and write hooks.
- **Passkey accounts (Mera), the gas-funding route, the RPC transport, the AUSD switch, the recovery phrase, Send
  AUSD, the installable-app manifest and the copy.** Also agent-written, following Mera's published recipes and the documentation bundled
  with Next.js 16 and wagmi 3.
- **This README and the submission text.** Drafted with the agent and edited against what was verified.

**What I did and did not review by hand.** I reviewed the contract line by line. I did not review the
frontend that way: my review there was at the level of running it, type-checking, and exercising the real
flows, since none of it takes custody of funds the way the contract would. What backs it: 46 committed Vitest
tests of the pure logic (the derived address is deterministic, matches viem's independent derivation and
standard BIP-39 vectors, and signs; the Send checks; the invoice ids); `curl` checks of the funding route's
validation and no-key paths and a local fake RPC that drops replies to test the transport (both run during
development, not committed); type-check and lint, which are clean; and my own end-to-end runs with a real
passkey on Monad testnet (create an account, receive the MON drip, claim test AUSD, pay an invoice, confirm the
transfer on the explorer). I checked that the tests can fail by deliberately breaking the code under test.

**Defects found by running it, then fixed:** the success screen vanishing when a status poll saw "Paid" mid-
payment; a settle timer that counted the payer's approval time; a dashboard that did not show a newly created
invoice; and a favicon file that made every page return an error.

## Before real funds

This is a testnet build, and I would not put real money through it as it stands. What would have to change:

- **Gas sponsorship is a drainable hot wallet.** The funding route sends 0.1 MON from a key held as a server
  environment variable. Its per-IP limit lives in memory, which serverless instances do not share, so a script
  can mint fresh addresses and drain the wallet. With real money it needs a paymaster or capped sponsorship, a
  real rate-limit store, a key held in a KMS with a small float, and monitoring.
- **Gas costs real money per payer.** On testnet a transaction costs about 0.01 MON (roughly 102 gwei, and
  Monad reserves the gas limit up front), and a payer's first payment is three transactions: claim test AUSD,
  approve, pay. AUSD implements EIP-2612 permit (its `DOMAIN_SEPARATOR` and `nonces` respond), so approve and
  pay could be a single transaction. I have not built that.
- **Recovery is limited, and accounts are tied to one hostname.** The address is derived from the passkey's PRF
  output, so the same passkey always gives the same account. If the passkey syncs (Google Password Manager,
  iCloud Keychain), signing in on another device with "I already have an account" should reach the same
  account; I have only confirmed same-device sign-in, not that cross-device path. A second passkey is *not* a
  backup: a different passkey is a different account. "Back up account" shows the 24-word phrase behind the
  account after a fresh passkey touch, so it can be restored in any wallet at `m/44'/60'/0'/0/0`. The phrase
  is a new leak surface (anyone who sees it controls the account), it is never stored, and it hides after a
  minute. There is no guardian or social recovery, and a passkey belongs to the site's hostname, so moving
  domains strands accounts unless the phrase is used (WebAuthn related origins are untested with Mera). The
  address also depends on Mera's fixed PRF salt, so `@category-labs/mera` stays pinned at 0.2.0.
  A merchant's request list is rebuilt from the contract's public per-merchant counter, so it follows the
  account to a new device.
- **Sends are final, and a typo loses the money.** "Send AUSD" on the dashboard checks the address (checksum,
  zero address, own address, this project's contracts) and shows it in full before signing, but nothing can
  undo a transfer to the wrong address. AUSD is issued by Agora and the issuer may be able to freeze balances;
  I have not checked what controls it has.
- **The key lives in browser memory while signed in.** Mera zeroes it on sign-out, but a compromised page or
  dependency could read it in the meantime. Mera is a preview release, and its README describes an internal
  security review only.
- **The contract is unaudited and not upgradeable, and AUSD is not mine.** AUSD is an upgradeable proxy that its
  issuer controls. I did not find a standard pause or freeze function under common names, which is not proof
  there is none, so a payment could be blocked by something I cannot see. The contract never holds funds, which
  limits the damage, but the fee recipient is a single address.
- **Reliability.** The app talks to one public RPC with response times that spike to around ten seconds, so a
  payment's confirmation can lag. Real money needs a dedicated RPC provider and monitoring.
- **Everything is public on-chain:** payments, references and account addresses.
- **Compliance is unaddressed.** Sanctions screening, KYC and money-transmission rules for cross-border
  payments. This is not legal advice; it needs a lawyer before any real use.

## License

MIT. See [LICENSE](LICENSE).
