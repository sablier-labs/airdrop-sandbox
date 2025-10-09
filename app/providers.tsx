"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./lib/config/wagmi";

/**
 * Query client configuration
 *
 * Configured for optimal Web3 data fetching:
 * - 30s default stale time (blockchain data doesn't change frequently)
 * - No retries for failed queries (let user manually retry)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Global providers wrapper for the application
 *
 * Sets up the Web3 provider stack:
 * 1. WagmiProvider - Core Web3 functionality
 * 2. QueryClientProvider - React Query for data fetching
 * 3. RainbowKitProvider - Wallet connection UI
 *
 * Note: Returns null during SSR to avoid hydration mismatches with wagmi config
 */
export function Providers({ children }: ProvidersProps) {
  // Track if we're mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR/prerender, return null to avoid hydration mismatch
  if (!isMounted || !wagmiConfig) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
