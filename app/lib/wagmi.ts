import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { createConfig } from "wagmi";

// Get WalletConnect Project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// Only initialize connectors on client-side to avoid SSR indexedDB issues
// On server, return empty array - wagmi will handle this gracefully
const connectors =
  typeof window !== "undefined"
    ? connectorsForWallets(
        [
          {
            groupName: "Supported Wallets",
            wallets: [metaMaskWallet, rabbyWallet],
          },
        ],
        {
          appName: "Sablier Airdrops",
          projectId,
        },
      )
    : [];

// Create Wagmi config
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  ssr: true, // Enable for Next.js SSR
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Re-export chains for convenience
export { mainnet, sepolia };
