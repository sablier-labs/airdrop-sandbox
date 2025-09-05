import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, polygon } from "wagmi/chains";

// Chain configuration
export const chains = [mainnet, base, arbitrum, polygon] as const;

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

// Wagmi configuration with RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: "Sablier Airdrop Claim",
  chains,
  projectId,
  ssr: true, // Enable server-side rendering
});

// Export chain IDs for easy access
export const CHAIN_IDS = {
  ARBITRUM: arbitrum.id,
  BASE: base.id,
  MAINNET: mainnet.id,
  POLYGON: polygon.id,
} as const;

// Chain names mapping
export const CHAIN_NAMES = {
  [mainnet.id]: "Ethereum",
  [base.id]: "Base",
  [arbitrum.id]: "Arbitrum",
  [polygon.id]: "Polygon",
} as const;

// Types are exported from lib/types/web3.ts
