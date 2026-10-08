"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { monadTestnet } from "@/lib/chain";
import { meraPasskey } from "@/lib/meraConnector";

const wagmiConfig = createConfig({
  chains: [monadTestnet],
  // The UI only offers the two passkey connectors; injected() stays registered so a wallet
  // fallback is a UI change, not a config change.
  connectors: [meraPasskey({ mode: "create" }), meraPasskey({ mode: "signin" }), injected()],
  // Monad blocks land in well under a second; the 4s default would hide that in the settle timer.
  pollingInterval: 400,
  transports: {
    [monadTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
