import { MerchantRailsAbi } from "./abi/MerchantRails";
import { MockUSDAbi } from "./abi/MockUSD";

// Monad testnet (chain 10143) deployment, verified on-chain 2026-09-22
// (see ../../README.md "Deployed" section -- do not point this at either
// of the two abandoned deploys with the wrong feeRecipient).
export const MERCHANT_RAILS_ADDRESS =
  "0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6" as const;
export const MOCK_USD_ADDRESS =
  "0x8954CadCE9B84DF214A77C3dCa5977573fb7E340" as const;

// Agora's AUSD on Monad testnet (6 decimals, an upgradeable proxy), verified on-chain 2026-10-09.
// The faucet is the same address Agora documents for Sepolia; it is live on Monad testnet, holds
// AUSD, and `token()` returns the AUSD address above. Its docs list ~10,000 AUSD per call.
export const AUSD_ADDRESS = "0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC" as const;
export const AUSD_FAUCET_ADDRESS = "0xd236c18D274E54FAccC3dd9DDA4b27965a73ee6C" as const;

export const merchantRailsContract = {
  address: MERCHANT_RAILS_ADDRESS,
  abi: MerchantRailsAbi,
} as const;

export const mockUsdContract = {
  address: MOCK_USD_ADDRESS,
  abi: MockUSDAbi,
} as const;

export const ausdFaucetContract = {
  address: AUSD_FAUCET_ADDRESS,
  abi: [
    {
      type: "function",
      name: "requestFunds",
      stateMutability: "nonpayable",
      inputs: [{ name: "recipient", type: "address" }],
      outputs: [],
    },
  ],
} as const;

// Any ERC-20 the contract accepts: the test token's ABI already carries balanceOf, allowance and approve.
export function tokenContract(address: `0x${string}`) {
  return { address, abi: MockUSDAbi } as const;
}

export function isAusd(token: string): boolean {
  return token.toLowerCase() === AUSD_ADDRESS.toLowerCase();
}

export function tokenLabel(token: string): string {
  return isAusd(token) ? "AUSD" : "test USD";
}

// AUSD and the test token both use 6 decimals.
export const STABLECOIN_DECIMALS = 6;
