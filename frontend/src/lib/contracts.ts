import { MerchantRailsAbi } from "./abi/MerchantRails";
import { MockUSDAbi } from "./abi/MockUSD";

// Monad testnet (chain 10143) deployment, verified on-chain 2026-09-22
// (see ../../README.md "Deployed" section -- do not point this at either
// of the two abandoned deploys with the wrong feeRecipient).
export const MERCHANT_RAILS_ADDRESS =
  "0x9f3fC6897a1EEA8E5FfCcfAB696C6795a1C8dfc6" as const;
export const MOCK_USD_ADDRESS =
  "0x8954CadCE9B84DF214A77C3dCa5977573fb7E340" as const;

export const merchantRailsContract = {
  address: MERCHANT_RAILS_ADDRESS,
  abi: MerchantRailsAbi,
} as const;

export const mockUsdContract = {
  address: MOCK_USD_ADDRESS,
  abi: MockUSDAbi,
} as const;

export const MOCK_USD_DECIMALS = 6;
