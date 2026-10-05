# Merchant Rails — Monad Metropolis Hackathon

Non-custodial merchant checkout on Monad: a merchant creates an invoice, a customer pays it in one
transaction, the stablecoin lands with the merchant in under a second, and the contract never holds funds.

- **Hackathon:** [Metropolis](https://www.monad.xyz/developers/hackathons/metropolis) · platform: https://hackathon.monad.xyz/
- **Repo:** https://github.com/precious-akpan/monad-metropolis-merchant-rails (public, MIT) — this is the
  GitHub link to give the hackathon platform at submission.
- **Track:** 02 — Consumer Products & Payments. Official definition (Rules §3.3): *"products whose primary
  user is a consumer who may not identify as a crypto user, and whose core value is a financial experience
  rather than a trading or market making product."* Merchant Rails is a direct fit.
- **Plan of record:** this README. A Google Doc mirror exists for phone reading (Drive id
  `1nWEbjz7hnKcy1lS5KtFaDQthLfPIq2mOUa1Z5yhLQi4`, "Metropolis Roadmap (latest, binding Rules)"). Both earlier
  Drive docs (`15FJu4M_...` from 8 Sep and `1C3Ptpp...` "corrected 2026-09-22") are renamed `[SUPERSEDED]`
  and point to this one. If the README and the Drive doc ever disagree, the README is correct — regenerate
  the Drive doc from it, don't edit the Drive doc's facts by hand.

## Binding facts — from the official "Metropolis Hackathon Rules & Guidelines" modal, v3.0, last updated 3 Sep 2026

Read in full from the onboarding page on 2026-09-22. **This modal is the actual Terms & Conditions and
overrides the public marketing page and the platform's Prizes page wherever they conflict.**

| | |
|---|---|
| **Total prize pool** | **$145,000** (Rules §3.2) — $25,000 Overall Winner + $120,000 across 4 tracks ($30,000 each, $10,000 to each of the top 3). The "$250,000+" headline on the marketing/Prizes pages includes *sponsor-funded bounties, which "may be added and announced during the Hackathon period, each with their own terms."* Treat sponsor bounties as unconfirmed upside, not part of the $145k. |
| **Submission deadline** | **October 13, 2026, 11:59 PM ET**, stated explicitly (Rules §4.2). Matches the platform countdown (Oct 14, 03:59 UTC). Rolling submission from Sept 1; late submissions not accepted; a submission may be edited until the deadline, and the version at the deadline is what's judged. |
| **Team size** | **1–5 members** (Rules §2.4), not "no stated limit." One primary contact designated; prize money goes to them and they're responsible for distributing it. |
| **One submission, one track** | One project per participant; each submission competes in exactly one track; can't win multiple main-track prizes for the same project (Rules §2.5, §3.3). |
| **Open source is MANDATORY** | Rules §7.2: *"All submissions must be open source under an OSI-approved license... Code must be publicly accessible on GitHub throughout and after the Hackathon."* This **contradicts** the marketing page's "encouraged but not required" — the Rules control. `LICENSE` (MIT) added to this repo. |
| **Demo video** | **Hard cap: no more than 3 minutes** (Rules §4.1, §9.4), not a default assumption. Publicly accessible (YouTube/Loom/Vimeo), must show the product actually operating and show Monad blockchain interactions — not mockups or slides. |
| **AI coding tools** | Permitted, but **"must be disclosed in the README"** (Rules §4.1.4). We're using one heavily — add a disclosure section before submitting (see checklist). |
| **Commit history** | Must cover the build window; "the substantial majority of the work" must be created during the Hackathon period. Pre-existing code may be a foundation only if identified in the README, with substantial new functionality added during the window. |
| **Monad integration requirements** | Contract addresses or tx hashes; mainnet **or** testnet (either is fine); document why Monad's capabilities are used (Rules §9.2). |
| **Eligibility** | 18+; standard OFAC/EU/UN sanctioned-jurisdiction exclusions; Monad Foundation/Sponsor/judge employees and immediate family can participate but can't win. |
| **Prize payment** | USDC or equivalent, within 30 days of winner announcement or KYC completion, whichever is later, to the primary contact's wallet. KYC may be required. Winners are solely responsible for taxes. |
| **Non-confidential review** | Rules §5.3: judges/mentors include investors and operators who may independently build similar products; submissions are reviewed non-confidentially. **Don't put anything in the repo we're not willing to make fully public — no trade secrets, keys, or credentials.** |

### Judging criteria — now published verbatim (Rules §5.2)

This replaces the earlier "no rubric, VC-heavy panel, inferred priorities" guess.

**All tracks, evenly weighted 20% each:**
1. Product Quality & Completeness
2. Technical Excellence
3. Monad Integration
4. Track Fit & Problem Relevance
5. Innovation & Impact

**Sponsor bounties (if we pursue any), weighted differently:**
1. Adherence to the published bounty requirements — 40%
2. Technical Implementation — 30%
3. Monad Integration — 20%
4. Innovation — 10%

### Sponsor bounties — verified verbatim from the dashboard's "Tracks & Bounties" page (2026-09-22)

This **replaces** an earlier version of this table that only guessed sponsor names from the public
marketing page. None of these are selected/committed yet — track 02 is locked in, bounties are not.

**Fit our track (Consumer Products & Payments) or All Tracks, realistic for Merchant Rails:**

| Bounty | Sponsor | Requirement (verbatim) | Prize |
|---|---|---|---|
| Best Cross-Border Payments App on Monad (Agora Payments Bounty) | Agora | "Build a **mobile app** letting users send AUSD across borders using **Mera passkey onboarding** and instant settlement." | $10,000 |
| Best Use of Envio | Envio | "Meaningfully use Envio's HyperIndex, HyperSync, or HyperRPC to power real on-chain data driving a core feature in your app." | $1,000 |
| Best Mera-Powered UX on Monad | Monad Foundation | "Build an app on Monad where Mera is the entire account layer — no seed phrase, no extension, no custody backend." | $2,500 |
| Bring Any-Chain Liquidity to Monad | Aurora Intents | "Integrate Aurora Intents (powered by NEAR Intents) ... for any-chain deposits, swaps, or deposit-and-execute flows." | $5,000 |
| Best Projects using Alchemy | Alchemy | "Build a functional project deployed on Monad that meaningfully integrates at least one Alchemy service or tool." | $1,000 credits |
| Best workflow with CRE | Chainlink | Use a CRE Workflow "as an orchestration layer within your project." | $3,000 |
| Best Use of Dynamic | Dynamic | Auth/wallet SDK — **mutually exclusive with the Mera bounties above**, pick one account layer. | $5,000 |
| Privy! | Privy | "Integrate Privy beyond authentication — login-only integrations will not qualify." — also mutually exclusive with Mera. | $5,000 |

**Out of scope for this project** (wrong track or wrong product shape): Best Mobile Trading App (Agora,
Onchain Finance & Trading), Cleanverse (Trust/Identity), Kuru ×2 (Onchain Finance & Trading), Best Analytics
/ Risk Tool (Perpl, Onchain Finance & Trading), Perpl API (trading bot), Nansen, Hunyuan/KIMI/Qwen (AI-model
credits, different tracks), Best Agent Wallet Plugin (MetaMask, Onchain Finance & Trading), Best Community
Team Project (requires being "a team from Metropolis community supporters" — not us).

### Decided 2026-09-22: Agora Cross-Border bounty — "ask organizers first, build the safe plan meanwhile"

The Agora bounty ($10k, the single largest fit) requires Mera specifically, says "mobile app" (our plan is a
responsive web checkout, not a native app), and requires AUSD (not our MockUSD). Research done:
- **Mera:** checked its own docs at mera.category.xyz directly — still no concrete function names, no working
  code snippet, no stated version. Same thin-docs picture as its GitHub README. High risk for AI-agent-assisted
  coding specifically (an agent is likely to invent an API that doesn't exist).
- **AUSD:** *is* deployed on Monad testnet, contract `0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC` (confirmed
  via [Agora's contract-deployments docs](https://docs.agora.finance/developer/contract-deployments)). No
  confirmed public faucet address found for it specifically, unlike the standard MON faucet.
- **"Mobile app":** no doc clarifies whether a responsive/PWA web app counts. Only the organizers can answer.

**Decision:** default plan stays the safe one — a standard wallet connector, MockUSD, no Mera — so nothing
blocks on this. Two questions were posted **2026-09-23** to the platform's own Support Forum
(`hackathon.monad.xyz/support?tab=forum` — a better fit than Discord: structured, categorized, routes
directly to organizers, not just the general dev server):
1. "Does a responsive/PWA web checkout qualify as 'mobile app' for the Agora Cross-Border Payments bounty?"
   — category: Rules and eligibility.
2. "Where's the Monad testnet AUSD faucet?" — category: Other.

Both status "Awaiting organizer" as of posting. Check back on these threads directly rather than Discord.

**Cutoff: before frontend wallet-integration work starts (target Sep 24).** If both answers are favorable
with time to spare, revisit switching to Mera + AUSD then. If no answer by the cutoff, or either answer is
unfavorable, stay on the safe plan — don't let this bounty consume schedule risk. **Not committed to any
bounty yet — track selection only.**

### Still to verify

- Whether the registration "Agreement" checkbox (accepting this Rules doc + Monad Foundation TOS + Privacy
  Policy) has been ticked — **that's the user's decision, not filled in by the assistant.** (Done — see schedule.)

## What exists

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

### Deployed (Monad testnet, chain 10143) — verified on-chain 2026-09-22, not just from script logs

| Contract | Address |
|---|---|
| **MerchantRails** | `0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6` |
| **MockUSD** (testnet only) | `0x8954CadCE9B84DF214A77C3dCa5977573fb7E340` |

Deployer / fee recipient: `0x013032166b72D40C43Ccc6B8cf776E4763f58162`. `feeBps` = 30 (0.30%), confirmed by
calling `feeRecipient()`/`feeBps()` directly against the deployed bytecode, and the deploy tx's on-chain
`from` field, not just trusted from script output.

**Note:** two earlier deploys at different addresses were abandoned after an ambient `FEE_RECIPIENT`
environment variable (unexplained source — not in this repo, dotfiles, `.env`, or direnv; never resolved)
leaked into the script and pointed the immutable `feeRecipient` at an unrelated wallet. Fixed by passing
`FEE_RECIPIENT=<deployer address>` explicitly on the deploy command, which overrides any ambient value
deterministically. The abandoned contracts are harmless (non-custodial design, no invoices or funds ever
touched them) but should not be referenced anywhere — only the addresses above are current.

## Frontend (Next.js 16 + TypeScript, `frontend/`)

`pnpm create next-app` (TypeScript, Tailwind, App Router, `src/`) + `wagmi` + `viem` +
`@tanstack/react-query`. **Wallet connector: `wagmi`'s built-in `injected()` only** — deliberately no
WalletConnect (would need an external cloud.reown.com account signup) and no Mera, matching the safe-plan
default from the Agora/Mera decision above. No `.env` needed — RPC URL and contract addresses are public
on-chain data, hardcoded in `frontend/src/lib/{chain,contracts}.ts`.

- `src/app/merchant/page.tsx` — connect, create a payment request (amount + optional reference), get a
  shareable `/pay/<id>` link, see your requests' status update live (polled directly from the contract
  every 3s — no indexer; the invoice *id list* is per-browser `localStorage`,
  `src/lib/invoiceStorage.ts` — an explicit v1 limitation, not cross-device. Envio would replace this if
  there's time; it's the first thing to cut either way per the "Open decisions" section above).
- `src/app/pay/[id]/PayClient.tsx` — the checkout: reads the invoice on-chain, shows a not-found/
  already-settled state plainly, an "Add test funds" button (calls `MockUSD.mint` directly — intentionally
  open for demos), then one "Pay" button that sequences `approve` → `pay` under the hood with clear step
  labels. On success: elapsed time from real `Date.now()` timestamps around the transaction, framed against
  a card-payment baseline ("Settled in 0.8s. A card payment takes 2–3 business days and ~3% in fees.") —
  the "vs card" differentiator, driven by the real transaction, not a canned number. A clearly-labeled
  **"See it settle on-chain →"** link to the transaction on MonadVision. This is deliberate: per
  memory-only competitive intel (not detailed here — see the assistant's own notes), the closest Track 02
  competitor hid/removed their explorer link entirely behind a database-only "payment." Ours stays visible
  as a feature, satisfying Track Fit (no wallet/gas/seed-phrase language in the primary flow) *and* Monad
  Integration (proof, not just a claim) at the same time.
- `src/components/NetworkGuard.tsx` — blocks page content with a one-click "Switch to Monad Testnet" if the
  connected wallet is on the wrong chain, the most common way a live demo fails silently.
- Block explorer: **MonadVision**, `https://testnet.monadvision.com` — `testnet.monadexplorer.com`
  308-redirects here; verified against Monad's own Foundry docs, which name "MonadVision" but give no URL.

**Fully verified end to end, 2026-09-23**, with a real wallet (Rabby) against live Monad testnet — every
step confirmed independently on-chain via `cast`, not just trusted from the UI:
- Connect → NetworkGuard correctly detected the wallet on the wrong chain (mainnet) and switched cleanly.
- Create invoice → the on-chain invoice matched the form input exactly (merchant, token, $5.00 amount).
- Add test funds → `MockUSD.mint` landed, balance updated.
- Pay → `approve` then `pay`; final on-chain state: invoice status **Paid**, merchant balance **4.985
  mUSD** — exactly `$5.00 − 0.30% fee`, matching the contract's fee math precisely.

**One real snag hit and resolved, worth remembering for demo day:** the first several `pay()` attempts got
stuck showing "Paying…" indefinitely. Diagnosed thoroughly (ruled out: app code — a raw
`window.ethereum.request` bypass hit the identical failure; network mismatch — cross-checked
`testnet-rpc.monad.xyz` against Monad's `rpc-testnet.monadinfra.com`, same chain ID, blocks within 3 of
each other, our contract's bytecode identical on both, neither had any record of the stuck transaction;
contract logic — a `cast call` dry-run of the exact same `pay()` call succeeded with no revert). The actual
cause: Rabby's own "pending" status was misleading — its signed transaction never actually reached any
real mempool (matching a `"message channel closed before a response was received"` console warning), an
extension-side glitch, not a bug here. **Fixed by clearing Rabby's signature/activity record** and
retrying with a fresh page load. If this recurs during the actual demo recording, that's the fix.

## AI tool disclosure (Rules §4.1.4 requires this before submission)

Contracts, tests, deploy script, and this README were drafted with an AI coding agent (Claude Code) under
close human review — payment/fee logic and every adversarial test case were specified and checked line by
line by the human author, per the project's own "needs a human driving" list below. The reentrancy mock
(`ReentrantERC20.sol`), its 3 tests, and the invariant handler/campaign were agent-drafted and then run and
inspected by the human author (test output reviewed line by line: 26/26 passing, 25,600 fuzzed calls, 0
invariant violations) before being trusted. The frontend (`frontend/`) was agent-scaffolded end to end —
provider setup, pages, components, the on-chain read/write hooks — leaning on the agent heavily as
expected for this kind of work; the human author's review here was at the build/type-check and read-only
runtime-verification level, not line-by-line, since none of it touches funds custody the way the contract
does. The full signed-transaction flow (create → pay, real wallet) was human-verified end to end on
2026-09-23, including diagnosing and working around a wallet-extension issue unrelated to the app code.

## Schedule (re-based 2026-09-22; 21 days to the Oct 13, 11:59 PM ET deadline — not the UTC countdown, when in doubt)

- [x] **Sep 21** — contracts v0 + tests green
- [x] **Sep 22 (AM)** — read the binding Rules modal; corrected prize pool, judging rubric, team size,
      open-source requirement, video length, AI disclosure; added LICENSE; regenerated the Drive doc and
      marked the two earlier ones `[SUPERSEDED]`
- [x] **Sep 22** — pushed to a public GitHub remote: https://github.com/precious-akpan/monad-metropolis-merchant-rails
      (first commit `45d81be`). Commit early and often from here forward — a single squashed commit near
      the deadline is the wrong shape for the Rules' "commit history covers the build window" requirement.
- [x] **Sep 22** — registration submitted (profile: Software Engineer, Nigeria/Ikorodu, GitHub
      `precious-akpan` as the social link, solo — "Looking for a team" left off). Dashboard confirms:
      registration open through 6 Oct; **submission form itself opens Oct 2**, closes **14 Oct, 04:59 GMT+1**
      (= Oct 13, 11:59 PM ET — same deadline, different timezone display, no conflict).
- [x] **Sep 22** — solo team created on the dashboard ("Precious Akpan · you", 1 member). Next dashboard
      step: Create project (name/description/track), then select tracks & bounties, then submit.
- [x] **Sep 22** — project created on the dashboard: name "Merchant Rails", one-line description, full
      description, repository link, primary track **Consumer Products & Payments** selected. Also pulled
      the real, verified sponsor-bounty list (see "Sponsor bounties" above) — replacing the earlier guess
      from the marketing page. No bounties selected yet; that's an open decision (see above).
      Note: the platform's "one-line description" field has an undocumented length limit — a full-sentence
      pitch got a silent `400` on save; a short tagline worked. Keep that field short if editing again.
- [x] **Sep 22** — hardened the contract before deploying: ran Slither (clean), added reentrant-token
      tests and a 25,600-call invariant campaign (see "Static analysis" / "Honest scope note" above).
- [x] **Sep 22** — deployed to Monad testnet: `MerchantRails` at `0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6`,
      `MockUSD` at `0x8954CadCE9B84DF214A77C3dCa5977573fb7E340`. Verified on-chain (bytecode, `feeRecipient`,
      `feeBps`, tx sender), not just trusted from script output — good thing, since two earlier deploy
      attempts had to be abandoned over a `feeRecipient` mix-up (see "Deployed" section above).
- [x] **Sep 22–23** — Agora Cross-Border bounty decided (safe plan; both questions posted to the platform
      Support Forum, awaiting organizer). Contract hardened (Slither, reentrant-token tests, invariant
      fuzzing) and deployed + verified on-chain — see sections above.
- [x] **Sep 23** — Next.js (TS) frontend v1 built, a day ahead of schedule (see "Frontend" section below):
      merchant dashboard, checkout/pay page, live on-chain status polling, "vs card" comparison driven by
      the real transaction's timing. `pnpm build` passes clean. Envio indexer intentionally skipped for v1
      (README's own "cheapest thing to drop" call) — invoice status is read directly from the contract.
- [x] **Sep 23** — full wallet-connected smoke test passed, real wallet (Rabby) against live Monad testnet:
      connect → create invoice → add test funds → approve → pay, every step verified independently
      on-chain (see "Frontend" section above for the fee-math check and the Rabby glitch hit along the way).
- ~~**Sep 24–30** — Envio indexer if time allows; otherwise move to polish.~~ **Lapsed — no work done
  Sep 24 – Oct 1** (last commit is `748e7b8`, Sep 23). Recorded honestly rather than quietly re-dated: the
  commit history will show the gap either way, and the re-base below is built around the runway that's
  actually left, not the one originally planned.

### Re-based 2026-10-02 — 11 days left (Oct 2 → Oct 13, 11:59 PM ET)

The original plan had ~20 days of slack; it now has none. The two schedule-level consequences: **Envio is
cut by default** (it was already flagged as the cheapest thing to drop) and **the submission gets filled in
early** rather than at the end — the form opened Oct 2 and stays editable until the deadline, so there is no
reason to carry form-surprise risk into the last 48 hours.

- ~~**Oct 2** — forum replies, submission draft, dashboard progress update.~~ **Lapsed.**
- ~~**Oct 3–5** — frontend polish pass.~~ **Lapsed.** Nothing was committed Oct 2–5 either; the README
  re-base above sat uncommitted in the working tree. Last commit is still `748e7b8` (Sep 23).

### Re-based 2026-10-05 — full remaining scope across 5 working days (Oct 5–9)

Two consecutive blocks have now lapsed, but the lapses were never a scope problem — the remaining work is
~4 days against a 5-day window. Scope is kept in full. What changes is the *ordering*: the earlier plans
sequenced work by rubric weight (polish first, because it's 20% of the score), which left the one **binary**
item — the submission existing at all — until last. A polished project that misses the submission scores
zero; an unpolished one that submits scores on four of five criteria. So the submission goes first, and the
polish lands on top of a submission that already counts.

What makes that cheap rather than wasteful: the product already works, and was re-verified on **2026-10-05**
— contracts live on chain 10143 (`feeBps` 30, `feeRecipient` = deployer, `mUSD` responding), deployer funded
at 4.53 MON, 26/26 tests passing with 25,600 fuzzed calls and 0 invariant violations, `pnpm build` clean on
Next.js 16.3.5. A demo-able app exists *today*. The insurance take costs ~2 hrs and one throwaway recording.

- [ ] **Day 1 — Oct 5: insurance submission (~2–3 hrs).** A complete, valid, scoring submission exists
      before any polish is attempted.
      1. Commit and push the README re-base — starts closing the 12-day history gap the Rules care about.
      2. Record a ≤ 3:00 demo video of the flow **as it stands**. Rough is fine; it must show real testnet
         interactions. (If Rabby shows a stuck "pending" mid-take, clear its signature/activity record and
         reload — known wallet-extension issue, documented above, not a code bug.)
      3. Fill the submission form, attach the video, **submit as complete, not draft.**
      4. Reload and confirm server-side that it reads as submitted.
      5. Post the dashboard progress update (also unlocks mentor support access).
- [x] **Day 1 also — PRF go/no-go: PASSED 2026-10-05.** Tested on the actual demo machine: Chrome 154 on
      Linux, authenticator = **Google Password Manager passkey** (signed-in Chrome profile). Browser reports
      `extension:prf: true`; Mera's live demo (`mera.category.xyz/demo/`, *not* `/prf-demo/`, which is only a
      static explainer) completed **Create account → Sign in with the same address both times**, i.e. PRF
      output is stable end to end. The gating risk for the $12.5k is cleared. Caveats that remain: Linux isn't
      in Mera's published support table (this run is the evidence it works here), and the passkey is bound to
      the *demo's* `rp.id` — our own app's `rp.id`/domain still has to be settled before onboarding is built.
- [ ] **Day 2 — Oct 6: Mera passkey account layer, on a branch.** Work on `feat/mera-passkey`, never on
      `main` — the insurance submission from Day 1 must stay intact and demo-able at all times. Build:
      passkey create + recover flows, session lifecycle (including `session.end()`), and the
      `toViemAccount` → `walletClient` wiring for the customer pay path. Settle `rp.id` / the demo domain
      first, since passkeys are domain-bound.
- [ ] **Day 3 — Oct 7: AUSD swap + end-to-end verification, then a hard go/no-go.** Swap `MockUSD` → AUSD
      (`0xa9012a...22dC`, 6 decimals — check the decimals assumption in the UI formatting) and replace the
      "Add test funds" mint with the faucet's `requestFunds(address)`. Verify the full passkey → approve →
      pay round trip on live testnet with `cast`, not just the UI.
      **Go/no-go at end of Day 3: if the round trip isn't green, abandon the branch and keep `main`.** This
      is the commitment point — do not carry a half-working account layer into Day 4.
- [ ] **Day 4 — Oct 8: real PWA + cross-border framing + cold-start test.** The PWA work is now
      **bounty-load-bearing**, not incidental polish — the organizer confirmed a PWA qualifies, so it has to
      actually be one:
      - Web app manifest, service worker, icon set, standalone display mode.
      - **Installability verified on a real phone** ("Add to Home Screen", launches without browser chrome).
        Do not take this on trust from a desktop devtools audit.
      - Cross-border framing in the **UI copy and seed data**: the Nigerian-freelancer-invoices-US-client
        scenario, with the settle-time and fee comparison stated against correspondent banking, not just
        against cards.
      - Consumer-facing copy pass — no "wallet", "gas", "approve" or "seed phrase" as user-facing jargon.
      - Loading and error states on every on-chain call.
      - Cold-start test: hand the pay link to a non-teammate and watch them complete it unaided. Passkey
        onboarding makes this *more* important, not less — it is a brand-new flow nobody has used yet.
- [ ] **Day 5 — Oct 9: finalize.** Re-record the video against the demo script — it must now show passkey
      onboarding, AUSD, the PWA, and the cross-border story, since all four are scored bounty terms. Swap it
      into the submission, final AI-disclosure pass covering the Mera work, walk the judging checklist item by
      item, re-verify server-side that the submission reads complete. **Select both bounties on the dashboard:
      Agora Cross-Border ($10,000) and Best Mera-Powered UX ($2,500).**
- Oct 10–11 — slack. Now genuinely needed rather than spare: Mera consumed most of the former margin.
- Oct 12–13 — emergency buffer, untouched. Never plan to use the last day.

**What this costs:** polish drops from ~2 days to ~1 (Day 4 absorbs it alongside the PWA pass and cold-start
test), and Oct 10–11 stops being spare capacity. The trade is deliberate: Mera improves the 20% Track Fit
score on the main $30k track regardless of any bounty, so it isn't competing with polish so much as doing
the same job by better means. The branch discipline plus the Day 3 go/no-go is what keeps the downside
bounded to lost time rather than a lost submission.

**Scope decisions standing as of 2026-10-05:**
- **Envio indexer** ($1,000) — cut. Nothing depends on it; invoice status is polled from the contract.
- **Mera is back in.** See the reversal below — the Sep 22 "too thin to code against" assessment was wrong.

### Reversal 2026-10-05: Mera is integrable, and the earlier assessment was wrong

The Sep 22 decision to avoid Mera was based on reading its **documentation site**, which had no concrete
function names. That was the wrong artifact to judge. The published npm package
**`@category-labs/mera@0.2.0`** (created 2026-07-23, last modified 2026-08-12, MIT/Apache dual-licensed)
was inspected directly on 2026-10-05 and is the opposite of thin:

- **Full TypeScript source ships in the tarball** (`src/*.ts`), not just built output — so there is no
  hallucination risk in coding against it. Every exported function carries exhaustive JSDoc naming its
  explicit failure modes (`PRF_UNAVAILABLE`, `INPUT_INVALID`, `PASSKEY_OPERATION_FAILED`, `SESSION_ENDED`).
- **Its peer dependency is `viem ^2.28.0`** — the stack this frontend already runs — and it ships a
  dedicated `./viem` export.
- **`toViemAccount(session)` returns a standard viem `LocalAccount`.** That is the decisive fact: it drops
  into the existing viem/wagmi code rather than requiring an architectural rip-out.

**The whole integration surface is four functions:** `createPasskeyWithPrfOutput` (new user) or
`getPasskeyPrfOutput` (returning user) → `createSecp256k1SigningSession({ privateKey: prfOutput })` →
`toViemAccount(session)` → `getEvmAddress(session.publicKey)`. The PRF output is 32 bytes and deterministic
for a given passkey + salt + relying party, so the same passkey always reproduces the same address.

What Mera is *not*: a smart-account or custody stack. Per its own README it provides authenticator-bound
entropy and signing sessions and leaves "account derivation, recovery, storage, and product flows under
application control." We own the derivation choice. That is more design responsibility than a drop-in wallet
SDK, but it is also exactly what the Mera bounty asks for — "no seed phrase, no extension, no custody
backend."

**Two incidental wins that matter more than the bounty:**
1. **It improves the main-track score on its own merits.** Track 02 is defined as a consumer "who may not
   identify as a crypto user." A customer paying an invoice with Face ID and no browser extension *is* that
   definition. This is core Track Fit work (20%) that happens to unlock a bounty — not bounty-chasing.
2. **It removes the single known hazard from the demo recording.** Per `toViemAccount`'s docs, signing
   "never shows a passkey prompt" — no extension in the signing path at all, which eliminates the Rabby
   stuck-pending failure that disrupted the Sep 23 testing and was the main risk to a clean take.

**The real remaining risk is WebAuthn PRF support**, not the SDK. `PRF_UNAVAILABLE` is a documented failure
when the authenticator doesn't evaluate PRF. This must be verified on the actual demo machine and browser
*before* any integration work — it is Day 1's first task, via Mera's own PRF demo at
`mera.category.xyz/prf-demo/`. Also note passkeys are bound to the relying party (`rp.id`): a passkey made
on `localhost` will not work on a deployed domain, so the demo domain must be settled before onboarding is
built.

### Organizer answers — both questions ANSWERED 2026-09-23, 05:40 GMT+1 (recorded 2026-10-05)

Both Support Forum threads were answered ~90 minutes after posting. An earlier check caught them at
"Awaiting organizer" and was never repeated, so these answers sat unread for 12 days and the Agora bounty was
written off on an inference the organizers had already overruled. **Re-check threads after posting; a status
read minutes later proves nothing.**

**Q: "Does a responsive/PWA web checkout qualify as 'mobile app' for the Agora Cross-Border Payments
bounty?"** (Rules and eligibility)
> **Organizer: "Yes, a PWA qualifies."**

Unambiguous. **The Agora $10,000 bounty is reachable** — no native iOS/Android build required. This is the
authoritative read on the bounty's "mobile app" wording and overrides any inference from Mera shipping a
React Native client.

**Q: "Where's the Monad testnet AUSD faucet?"** (Other)
> **Organizer:** pointed at `docs.agora.finance/instant-settlement/guides/getting-testnet-tokens`.

**That answer does not actually resolve it** — that page documents **Sepolia only**, and Agora's
contract-deployments page lists Monad's faucet as "N/A". The working answer came from our own RPC research
instead: the *same* faucet address is live on Monad testnet. Re-verified 2026-10-05:
`0xd236c18D274E54FAccC3dd9DDA4b27965a73ee6C` holds **~997M AUSD** and a `requestFunds(address)` dry-run
succeeds with no revert. AUSD itself is live at `0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC`, symbol `AUSD`,
**6 decimals**. Don't rely on the organizer's link for this — rely on the verified addresses above.

### Bounty targets, updated 2026-10-05 — both now reachable, $12,500 combined

- **Best Mera-Powered UX ($2,500)** — needs Mera as the entire account layer. Reachable, no open questions.
- **Best Cross-Border Payments App / Agora ($10,000)** — "Build a mobile app letting users send AUSD across
  borders using Mera passkey onboarding and instant settlement." Now reachable. Status of each clause:
  - *mobile app* — **PWA qualifies per the organizer.** Must be a genuinely installable PWA, not merely
    responsive: web app manifest, service worker, icons, and installability verified on a real phone.
  - *AUSD* — verified live, faucet working (above).
  - *Mera passkey onboarding* — the Day 2 work. **Explicitly named in the bounty terms**, so it is mandatory
    for this $10k, not optional.
  - *instant settlement* — already built and demonstrated; the sub-second settle is the core pitch.
  - *"send AUSD across borders"* — **the one genuine adherence gap.** Merchant Rails settles invoices; the
    wording reads person-to-person remittance. Closing it by **framing, not new scope**: the demo scenario
    becomes a Nigerian freelancer invoicing a US client — settles in under a second at 0.3% versus 3–5 days
    and ~7% through correspondent banking. That is authentically cross-border, fits Track 02's consumer
    definition, and reuses the "realistic seed merchant" work already budgeted. The cross-border framing must
    land in the **UI copy and the demo narrative**, not just this README — bounties score 40% on adherence to
    the published terms, and a judge reading "invoice settlement" will not infer "cross-border" unaided.

**Consequence for the Day 3 go/no-go: the stakes are now $12,500, not $2,500.** Both bounties name Mera, so
if the Mera integration fails, both are lost. That makes the Day 1 PRF check the highest-leverage hour in the
whole plan — it is the one failure mode with no workaround, and it now gates $12.5k rather than $2.5k.

## Judging checklist (mapped to the real rubric)

- [ ] **Product Quality & Completeness (20%)** — working end-to-end flow, not a happy-path stub; polished
      merchant dashboard and checkout
- [ ] **Technical Excellence (20%)** — tests green (20/20 + fuzz), contract reviewed/scanned, clean repo
- [ ] **Monad Integration (20%)** — real testnet (or mainnet) transactions on camera; contract addresses and
      why Monad's speed/cost matters stated explicitly, not just implied
- [ ] **Track Fit & Problem Relevance (20%)** — demo reads as a consumer/merchant product, never mentions
      wallets/gas/seed phrases to the end user
- [ ] **Innovation & Impact (20%)** — the "vs card" comparison and non-custodial design are the differentiators;
      make them visible, not just claimed
- [ ] Public GitHub repo, MIT `LICENSE`, README with setup instructions, external code attributed, commit
      history spans the build window
- [ ] AI tool use disclosed in README, specifically
- [ ] Demo video ≤ 3:00, publicly hosted, shows the product actually operating and Monad interactions
- [ ] Nothing in the repo we wouldn't want fully public (review is non-confidential — no keys, no trade secrets)
- [ ] Submitted through the Hackathon website with a day or more of margin before Oct 13, 11:59 PM ET

**Demo script (≤ 3:00):** 0:00–0:30 problem (slow, costly merchant settlement, named persona). 0:30–2:00 live
checkout, real testnet payment, dashboard updating. 2:00–2:30 technical differentiation (non-custodial
contract, on-chain invoice ids, live status read straight from the chain). 2:30–3:00 impact and ask.

## Open decisions

- ~~Keep or cut Envio indexing.~~ **Decided 2026-10-02: cut**, as a consequence of the re-based schedule
  (see above). Don't describe the app as having an "indexed live feed" anywhere — status is polled from the
  contract, and the demo script above was corrected to match.
- Whether to pursue any sponsor bounty once the dashboard's actual terms are visible — bounties are scored
  40% on adherence to *their* published requirements, so only take one if we can read and hit those terms.
- Mainnet vs testnet for the final demo — Rules allow either; testnet remains the safer default.
