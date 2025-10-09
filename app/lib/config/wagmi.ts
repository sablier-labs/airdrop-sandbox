import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { SUPPORTED_CHAINS } from "./chains";

/**
 * Wagmi configuration for Web3 wallet connections
 *
 * This configuration:
 * - Client-only initialization (no SSR cookie storage)
 * - Supports MetaMask and Rabby wallets
 * - Uses WalletConnect for additional wallet support
 * - Configures RPC transports for all supported chains
 *
 * Note: SSR cookie storage is intentionally disabled to avoid client-only
 * function calls during server-side rendering. This doesn't impact functionality
 * as wallet state is ephemeral and reconnection on page load is standard UX.
 *
 * @see https://wagmi.sh/react/config
 * @see https://www.rainbowkit.com/docs/installation
 */

// Validate required environment variable
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required. Get one at https://cloud.walletconnect.com",
  );
}

/**
 * Create wagmi config (only on client)
 *
 * This function creates the config immediately if called on client,
 * or throws if called on server. Import this file only in client components.
 */
function createWagmiConfig() {
  return getDefaultConfig({
    appName: "Sablier Airdrop Campaign",
    chains: SUPPORTED_CHAINS,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    // Client-only config - no SSR storage
    ssr: false,
    // Configure HTTP transport for each chain
    transports: SUPPORTED_CHAINS.reduce(
      (acc, chain) => {
        acc[chain.id] = http();
        return acc;
      },
      {} as Record<number, ReturnType<typeof http>>,
    ),
    wallets: [
      {
        groupName: "Recommended",
        wallets: [metaMaskWallet, rabbyWallet],
      },
    ],
  });
}

/**
 * Wagmi configuration singleton
 *
 * Only initialized on client-side. Do not import this module in server components.
 */
export const wagmiConfig = typeof window !== "undefined" ? createWagmiConfig() : null;

/**
 * Type declaration for wagmi config
 * This enables proper TypeScript inference throughout the app
 */
declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig extends null ? never : NonNullable<typeof wagmiConfig>;
  }
}
