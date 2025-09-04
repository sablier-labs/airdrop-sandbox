"use client";

import { http } from "viem";
import { createConfig } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { chain } from "./chains";

// Get WalletConnect project ID from environment (sensitive data stays in env vars)
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// Default app branding (will be updated from JSON config at runtime if needed)
const appName = "Sablier Airdrop Sandbox";
const appDescription = "Airdrop sandbox for Sablier Airdrops";

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    injected(),
    coinbaseWallet({ appName }),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            metadata: {
              description: appDescription,
              icons: [],
              name: appName,
              url:
                typeof window !== "undefined" ? window.location.origin : "https://localhost:3000",
            },
            projectId: walletConnectProjectId,
          }),
        ]
      : []),
  ],
  transports: {
    [chain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
