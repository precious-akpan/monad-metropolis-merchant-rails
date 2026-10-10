"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { monadTestnet } from "@/lib/chain";
import { meraPasskey } from "@/lib/meraConnector";
import { resilientHttp } from "@/lib/resilientTransport";

const wagmiConfig = createConfig({
  chains: [monadTestnet],
  // The UI only offers the passkey connectors; injected() stays registered so a wallet
  // fallback is a UI change, not a config change.
  connectors: [
    meraPasskey({ mode: "create" }),
    meraPasskey({ mode: "signin" }),
    meraPasskey({ mode: "pick" }),
    injected(),
  ],
  // A passkey session lives in memory only, so a saved connection can never be restored after a
  // reload. With the default storage, wagmi reported the saved address as connected while it
  // re-checked, so Pay was clickable, failed with "No active passkey session", then signed out.
  storage: null,
  // Monad blocks land in well under a second; the 4s default would hide that in the settle timer.
  pollingInterval: 400,
  transports: {
    [monadTestnet.id]: resilientHttp(monadTestnet.rpcUrls.default.http[0]),
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
