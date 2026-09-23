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

## AI tool disclosure (Rules §4.1.4 requires this before submission)

Contracts, tests, deploy script, and this README were drafted with an AI coding agent (Claude Code) under
close human review — payment/fee logic and every adversarial test case were specified and checked line by
line by the human author, per the project's own "needs a human driving" list below. The reentrancy mock
(`ReentrantERC20.sol`), its 3 tests, and the invariant handler/campaign were agent-drafted and then run and
inspected by the human author (test output reviewed line by line: 26/26 passing, 25,600 fuzzed calls, 0
invariant violations) before being trusted. Frontend scaffolding, SDK wiring, and boilerplate are expected
to lean on the agent more heavily. Keep this section current and specific — a vague "AI was used"
disclosure is weaker than naming which parts.

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
- [ ] **Sep 22–23** — decide on the Agora Cross-Border bounty (Mera + AUSD + "mobile app" question)
- [ ] **Sep 24–30** — Next.js (TS) checkout + merchant dashboard updating live from a real testnet tx; Envio indexer
- [ ] **Oct 1–5** — "vs card" comparison UI driven by the real transaction; run Slither/own scan on the contract
- [ ] **Oct 6–9** — realistic seed merchant, cold-start test with a non-teammate, write-up naming each
      integration, finalize the AI-disclosure section with specifics
- [ ] **Oct 10–11** — record video (**must be ≤ 3:00, hard cap**), submit, confirm the submission shows
      complete (not draft)
- Oct 12–13 — emergency buffer only. Never plan to use the last day.

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
contract, on-chain invoice ids, indexed live feed). 2:30–3:00 impact and ask.

## Open decisions

- Keep or cut Envio indexing (cheapest thing to drop if behind schedule).
- Whether to pursue any sponsor bounty once the dashboard's actual terms are visible — bounties are scored
  40% on adherence to *their* published requirements, so only take one if we can read and hit those terms.
- Mainnet vs testnet for the final demo — Rules allow either; testnet remains the safer default.
