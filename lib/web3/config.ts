import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base } from "wagmi/chains";

// Single chain configuration - Base only
export const chains = [base] as const;

// Default chain for the app
export const DEFAULT_CHAIN = base;
export const DEFAULT_CHAIN_ID = base.id;

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

// Wagmi configuration using RainbowKit's getDefaultConfig for Base chain only
export const wagmiConfig = getDefaultConfig({
  appName: "Sablier Airdrop Claim",
  chains,
  projectId,
  ssr: true, // Enable server-side rendering
  transports: {
    [base.id]: http(),
  },
});

// Types are exported from lib/types/web3.ts
