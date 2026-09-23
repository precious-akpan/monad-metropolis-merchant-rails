import { defineChain } from "viem";

// https://docs.monad.xyz/guides/deploy-smart-contract/foundry
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    // "MonadVision" per Monad's own Foundry deployment guide. testnet.monadexplorer.com
    // 308-redirects here; verified 2026-09-23.
    default: {
      name: "MonadVision",
      url: "https://testnet.monadvision.com",
    },
  },
  testnet: true,
});
