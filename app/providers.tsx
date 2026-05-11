"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

/**
 * Wallet + data providers. The wagmi config uses cookie storage so it's SSR-safe, but
 * RainbowKit + its hooks reach for browser-only APIs at render time. We mount the
 * `RainbowKitProvider` (and the wallet-driven page content) only after the client hydrates.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 300_000, // 5 minutes
            retry: 3,
            staleTime: 60_000, // 1 minute for blockchain data
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted ? <RainbowKitProvider>{children}</RainbowKitProvider> : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
