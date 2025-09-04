import { useMemo } from "react";
import type { Address } from "viem";
import { formatUnits, parseUnits } from "viem";
import { useChainId, useReadContracts } from "wagmi";
import type { ChainId } from "@/lib/config/airdrop";
import { sapienAirdropCampaign } from "@/lib/config/airdrop";
import { erc20Abi } from "@/lib/contracts/abi";

/**
 * Complete token information from contract and configuration
 */
export type TokenInfo = {
  /** Token contract address */
  address: Address;
  /** Token name from contract */
  name: string;
  /** Token symbol from contract */
  symbol: string;
  /** Number of decimal places */
  decimals: number;
  /** Total supply from contract */
  totalSupply: bigint;
  /** Token logo URL from config */
  logoUrl?: string;
  /** Campaign-specific metadata */
  campaign: {
    /** Total amount being distributed in this campaign */
    totalDistribution: bigint;
    /** Number of eligible recipients */
    totalRecipients: number;
    /** Average amount per recipient */
    averageAmount: bigint;
  };
};

/**
 * Hook return type with loading states and error handling
 */
export type UseTokenInfoReturn = {
  /** Token information if successfully loaded */
  tokenInfo?: TokenInfo;
  /** Error object if any operation failed */
  error: Error | null;
  /** Whether any data is currently loading */
  isLoading: boolean;
  /** Whether data has been successfully loaded */
  isSuccess: boolean;
  /** Function to manually refetch token data */
  refetch: () => void;
  /** Utility functions for formatting token amounts */
  formatAmount: (amount: bigint) => string;
  /** Utility function for parsing token amounts from strings */
  parseAmount: (amount: string) => bigint;
};

/**
 * Hook for comprehensive token information
 *
 * Fetches token details from contract and combines with campaign configuration:
 * - Token metadata (name, symbol, decimals)
 * - Contract state (total supply)
 * - Campaign-specific information (distribution amounts, recipients)
 * - Utility functions for amount formatting and parsing
 *
 * @param tokenAddress - Optional token address override
 * @returns Token information with formatting utilities
 *
 * @example
 * ```tsx
 * function TokenDisplay() {
 *   const { tokenInfo, formatAmount, isLoading, error } = useTokenInfo();
 *
 *   if (isLoading) return <div>Loading token info...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!tokenInfo) return <div>No token info available</div>;
 *
 *   return (
 *     <div>
 *       <h2>{tokenInfo.name} ({tokenInfo.symbol})</h2>
 *       <p>Total Supply: {formatAmount(tokenInfo.totalSupply)}</p>
 *       <p>Distribution: {formatAmount(tokenInfo.campaign.totalDistribution)}</p>
 *       <p>Recipients: {tokenInfo.campaign.totalRecipients.toLocaleString()}</p>
 *       <p>Average: {formatAmount(tokenInfo.campaign.averageAmount)}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom token address
 * function CustomTokenInfo({ address }: { address: Address }) {
 *   const { tokenInfo, formatAmount } = useTokenInfo(address);
 *
 *   return tokenInfo ? (
 *     <div>
 *       <h3>{tokenInfo.name}</h3>
 *       <p>Supply: {formatAmount(tokenInfo.totalSupply)}</p>
 *     </div>
 *   ) : null;
 * }
 * ```
 */
export function useTokenInfo(tokenAddress?: Address): UseTokenInfoReturn {
  const chainId = useChainId();

  // Get token address from campaign config or use provided address
  const contractAddress =
    tokenAddress || sapienAirdropCampaign.contracts[chainId as ChainId]?.tokenContract;

  // Read multiple contract values in parallel
  const { data, error, isLoading, isSuccess, refetch } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "name",
      },
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "symbol",
      },
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address: contractAddress,
        functionName: "totalSupply",
      },
    ],
    query: {
      enabled: !!contractAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Process the contract data
  const tokenInfo = useMemo((): TokenInfo | undefined => {
    if (!data || !contractAddress) return undefined;

    const [nameResult, symbolResult, decimalsResult, totalSupplyResult] = data;

    // Check if all reads were successful
    if (nameResult.error || symbolResult.error || decimalsResult.error || totalSupplyResult.error) {
      return undefined;
    }

    const name = nameResult.result as string;
    const symbol = symbolResult.result as string;
    const decimals = decimalsResult.result as number;
    const totalSupply = totalSupplyResult.result as bigint;

    // Get campaign metadata
    const campaignConfig = sapienAirdropCampaign;

    return {
      address: contractAddress,
      campaign: {
        averageAmount: campaignConfig.distribution.averageAmount,
        totalDistribution: campaignConfig.distribution.totalAmount,
        totalRecipients: campaignConfig.distribution.totalRecipients,
      },
      decimals,
      logoUrl: campaignConfig.token.logoUrl,
      name,
      symbol,
      totalSupply,
    };
  }, [data, contractAddress]);

  // Enhanced error handling
  const enhancedError = useMemo(() => {
    if (!contractAddress) {
      return new Error(`No token contract found for chain ${chainId}`);
    }
    if (error) {
      return error;
    }
    if (data?.some((result) => result.error)) {
      const errorResults = data.filter((result) => result.error);
      return new Error(
        `Failed to fetch token data: ${errorResults.map((r) => r.error?.message).join(", ")}`,
      );
    }
    return null;
  }, [contractAddress, chainId, error, data]);

  // Format amount utility
  const formatAmount = useMemo(() => {
    return (amount: bigint): string => {
      if (!tokenInfo) return amount.toString();

      try {
        return formatUnits(amount, tokenInfo.decimals);
      } catch (error) {
        console.warn("Failed to format amount:", error);
        return amount.toString();
      }
    };
  }, [tokenInfo]);

  // Parse amount utility
  const parseAmount = useMemo(() => {
    return (amount: string): bigint => {
      if (!tokenInfo) throw new Error("Token info not available");

      try {
        return parseUnits(amount, tokenInfo.decimals);
      } catch (error) {
        throw new Error(
          `Failed to parse amount "${amount}": ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    };
  }, [tokenInfo]);

  return {
    error: enhancedError,
    formatAmount,
    isLoading,
    isSuccess: isSuccess && !!tokenInfo,
    parseAmount,
    refetch,
    tokenInfo,
  };
}

// Note: Multi-chain token comparison should be implemented at the component level
// to avoid violating React hooks rules. Each chain should use a separate hook call.

/**
 * Utility hook for token amount calculations and validations
 *
 * @param tokenAddress - Token contract address
 * @returns Calculation utilities with proper decimal handling
 *
 * @example
 * ```tsx
 * function TokenCalculator({ tokenAddress }: { tokenAddress: Address }) {
 *   const calc = useTokenCalculations(tokenAddress);
 *
 *   if (!calc.ready) return <div>Loading...</div>;
 *
 *   const amount1 = calc.parseAmount("100.5");
 *   const amount2 = calc.parseAmount("50.25");
 *   const sum = calc.addAmounts(amount1, amount2);
 *   const percentage = calc.calculatePercentage(amount1, sum);
 *
 *   return (
 *     <div>
 *       <p>Amount 1: {calc.formatAmount(amount1)}</p>
 *       <p>Amount 2: {calc.formatAmount(amount2)}</p>
 *       <p>Sum: {calc.formatAmount(sum)}</p>
 *       <p>Percentage: {percentage}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTokenCalculations(tokenAddress?: Address) {
  const { tokenInfo, formatAmount, parseAmount, isSuccess } = useTokenInfo(tokenAddress);

  return useMemo(() => {
    if (!isSuccess || !tokenInfo) {
      return {
        addAmounts: (a: bigint, b: bigint) => a + b,
        calculatePercentage: (_part: bigint, _total: bigint) => 0,
        divideAmount: (amount: bigint, divisor: number) => amount / BigInt(divisor),
        formatAmount: (amount: bigint) => amount.toString(),
        isValidAmount: (_amount: string) => false,
        multiplyAmount: (amount: bigint, multiplier: number) =>
          (amount * BigInt(Math.floor(multiplier * 100))) / 100n,
        parseAmount: (_amount: string) => {
          throw new Error("Token info not ready");
        },
        ready: false,
        subtractAmounts: (a: bigint, b: bigint) => a - b,
      };
    }

    return {
      /**
       * Add two token amounts
       */
      addAmounts: (a: bigint, b: bigint): bigint => a + b,

      /**
       * Calculate percentage (part/total * 100)
       */
      calculatePercentage: (part: bigint, total: bigint): number => {
        if (total === 0n) return 0;
        return Number((part * 10000n) / total) / 100; // 2 decimal precision
      },

      /**
       * Divide amount by a number
       */
      divideAmount: (amount: bigint, divisor: number): bigint => {
        if (divisor === 0) throw new Error("Cannot divide by zero");
        return amount / BigInt(divisor);
      },
      formatAmount,

      /**
       * Validate if a string represents a valid token amount
       */
      isValidAmount: (amount: string): boolean => {
        try {
          const parsed = parseAmount(amount);
          return parsed >= 0n;
        } catch {
          return false;
        }
      },

      /**
       * Multiply amount by a number (with precision handling)
       */
      multiplyAmount: (amount: bigint, multiplier: number): bigint => {
        const precision = 10000; // 4 decimal places
        return (amount * BigInt(Math.floor(multiplier * precision))) / BigInt(precision);
      },
      parseAmount,
      ready: true,

      /**
       * Subtract two token amounts
       */
      subtractAmounts: (a: bigint, b: bigint): bigint => a - b,
    };
  }, [isSuccess, tokenInfo, formatAmount, parseAmount]);
}
