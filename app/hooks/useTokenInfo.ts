"use client";

import type { Address } from "viem";
import { useReadContracts } from "wagmi";

/**
 * Standard ERC20 ABI for reading token metadata
 * Only includes the functions we need: name, symbol, decimals
 */
const ERC20_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * ERC20 token metadata
 */
export interface TokenInfo {
  /**
   * Token name (e.g., "USD Coin")
   */
  name: string | undefined;

  /**
   * Token symbol (e.g., "USDC")
   */
  symbol: string | undefined;

  /**
   * Number of decimals (typically 6 or 18)
   */
  decimals: number | undefined;

  /**
   * Whether token data is currently loading
   */
  isLoading: boolean;

  /**
   * Whether token data is currently refetching
   */
  isRefetching: boolean;

  /**
   * Error from contract reads, if any
   */
  error: Error | null;

  /**
   * Manually trigger a refetch of token data
   */
  refetch: () => void;
}

/**
 * Hook for reading ERC20 token information
 *
 * Fetches standard token metadata (name, symbol, decimals) for any ERC20 token.
 * Uses batched reads for efficiency and provides comprehensive error handling.
 *
 * Features:
 * - Batched contract reads for optimal performance
 * - Auto-refresh with configurable polling
 * - Type-safe return values
 * - Works with any ERC20-compliant token
 *
 * @param tokenAddress - Address of the ERC20 token contract
 * @param options - Optional configuration for polling and caching
 * @returns Token metadata with loading states
 *
 * @example
 * ```tsx
 * function TokenDisplay({ address }: { address: Address }) {
 *   const { name, symbol, decimals, isLoading } = useTokenInfo(address);
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <h2>{name} ({symbol})</h2>
 *       <p>Decimals: {decimals}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenInfo(
  tokenAddress: Address | undefined,
  options?: {
    /**
     * Polling interval in milliseconds (default: 0 = no polling)
     * Token metadata rarely changes, so polling is disabled by default
     */
    pollingInterval?: number;

    /**
     * Time in milliseconds before data is considered stale (default: Infinity)
     * Token metadata is effectively immutable, so we cache forever by default
     */
    staleTime?: number;

    /**
     * Whether to refetch on window focus (default: false)
     * Token metadata doesn't change, so refetching is disabled by default
     */
    refetchOnWindowFocus?: boolean;
  },
): TokenInfo {
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: rawRefetch,
  } = useReadContracts({
    contracts: [
      {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "name",
      },
      {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "symbol",
      },
      {
        abi: ERC20_ABI,
        address: tokenAddress,
        functionName: "decimals",
      },
    ],
    query: {
      // Only query if we have a valid token address
      enabled: !!tokenAddress,
      // Token metadata is immutable, so we don't poll by default
      refetchInterval: options?.pollingInterval ?? 0,
      // Don't refetch on window focus (metadata won't change)
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      // Cache token metadata indefinitely
      staleTime: options?.staleTime ?? Number.POSITIVE_INFINITY,
    },
  });

  // Extract results from batched read
  const name = data?.[0]?.status === "success" ? (data[0].result as string) : undefined;
  const symbol = data?.[1]?.status === "success" ? (data[1].result as string) : undefined;
  const decimals = data?.[2]?.status === "success" ? (data[2].result as number) : undefined;

  return {
    decimals,
    error: error as Error | null,
    isLoading,
    isRefetching,
    name,
    refetch: () => {
      rawRefetch();
    },
    symbol,
  };
}
