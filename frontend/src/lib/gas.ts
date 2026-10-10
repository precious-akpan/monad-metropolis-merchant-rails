import { parseEther } from "viem";

// Monad reserves a transaction's gas limit up front and gas here is not cheap: roughly 0.01 MON per
// transaction at ~100 gwei (a faucet claim needs ~0.012 MON in the account, an approve ~0.005, a
// payment about as much as the claim). One full payment flow needs about 0.03 MON, so an account
// below this cannot be trusted to finish one. Shared so the server's top-up rule and the page's
// "needs gas" check cannot drift apart.
export const MIN_GAS_BALANCE = parseEther("0.04");
