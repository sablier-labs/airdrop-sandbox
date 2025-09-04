"use client";

import { http } from "viem";
import { createConfig } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { supportedChains } from "./chains";

// Get WalletConnect project ID from environment
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Sablier Airdrop Sandbox" }),
    ...(walletConnectProjectId
      ? [
          walletConnect({
            metadata: {
              description: "Airdrop sandbox for Sablier Airdrops",
              icons: [],
              name: "Sablier Airdrop Sandbox",
              url:
                typeof window !== "undefined" ? window.location.origin : "https://localhost:3000",
            },
            projectId: walletConnectProjectId,
          }),
        ]
      : []),
  ],
  transports: {
    [supportedChains[0].id]: http(), // mainnet
    [supportedChains[1].id]: http(), // base
    [supportedChains[2].id]: http(), // sepolia
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
