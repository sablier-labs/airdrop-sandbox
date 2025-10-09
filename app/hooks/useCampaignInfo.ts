"use client";

import type { Address } from "viem";
import { useReadContracts } from "wagmi";
import { defaultCampaignConfig } from "../lib/config/campaign";
import {
  SablierMerkleInstantAbi,
  SablierMerkleLLAbi,
  SablierMerkleLTAbi,
} from "../lib/contracts/abis";
import type { DistributionType } from "../types/campaign.types";

/**
 * Campaign information aggregated from contract state
 */
export interface CampaignInfo {
  /**
   * ERC20 token address being distributed
   */
  tokenAddress: Address | undefined;

  /**
   * Merkle root hash for claim verification
   */
  merkleRoot: `0x${string}` | undefined;

  /**
   * Fee required to claim in native token (wei)
   */
  claimFee: bigint | undefined;

  /**
   * Whether the campaign has expired
   */
  hasExpired: boolean | undefined;

  /**
   * Campaign name from config
   */
  campaignName: string;

  /**
   * Distribution type from config
   */
  distributionType: DistributionType;

  /**
   * Expiration timestamp from config
   */
  expiresAt: number;

  /**
   * Whether contract data is currently loading
   */
  isLoading: boolean;

  /**
   * Whether contract data is currently refetching
   */
  isRefetching: boolean;

  /**
   * Error from contract reads, if any
   */
  error: Error | null;

  /**
   * Manually trigger a refetch of campaign data
   */
  refetch: () => void;
}

/**
 * Get the appropriate ABI based on distribution type
 */
function getAbiForDistributionType(distributionType: DistributionType) {
  switch (distributionType) {
    case "instant":
      return SablierMerkleInstantAbi;
    case "linear":
      return SablierMerkleLLAbi;
    case "tranched":
      return SablierMerkleLTAbi;
  }
}

/**
 * Hook for reading campaign information from contract
 *
 * This hook aggregates multiple contract reads into a single, type-safe
 * interface. It batches RPC calls for efficiency and provides proper
 * loading/error states.
 *
 * Features:
 * - Batched contract reads for optimal performance
 * - Auto-refresh with configurable polling
 * - Type-safe return values
 * - Comprehensive error handling
 * - Combines on-chain data with campaign config
 *
 * @param contractAddress - Optional override for contract address (defaults to config)
 * @param options - Optional configuration for polling and caching
 * @returns Aggregated campaign information with loading states
 *
 * @example
 * ```tsx
 * function CampaignDetails() {
 *   const { tokenAddress, merkleRoot, claimFee, hasExpired, isLoading } = useCampaignInfo();
 *
 *   if (isLoading) return <Spinner />;
 *   if (hasExpired) return <CampaignExpired />;
 *
 *   return (
 *     <div>
 *       <p>Token: {tokenAddress}</p>
 *       <p>Fee: {formatEther(claimFee || 0n)} ETH</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCampaignInfo(
  contractAddress?: Address,
  options?: {
    /**
     * Polling interval in milliseconds (default: 30000 = 30s)
     * Set to 0 to disable polling
     */
    pollingInterval?: number;

    /**
     * Time in milliseconds before data is considered stale (default: 60000 = 1min)
     */
    staleTime?: number;

    /**
     * Whether to refetch on window focus (default: true)
     */
    refetchOnWindowFocus?: boolean;
  },
): CampaignInfo {
  const address = contractAddress || defaultCampaignConfig.contractAddress;
  const abi = getAbiForDistributionType(defaultCampaignConfig.distributionType);

  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: rawRefetch,
  } = useReadContracts({
    contracts: [
      {
        abi,
        address,
        functionName: "TOKEN",
      },
      {
        abi,
        address,
        functionName: "MERKLE_ROOT",
      },
      {
        abi,
        address,
        functionName: "FEE",
      },
      {
        abi,
        address,
        functionName: "hasExpired",
      },
    ],
    query: {
      // Enable query even if contract address is invalid (will error gracefully)
      enabled: true,
      // Default: poll every 30 seconds for live updates
      refetchInterval: options?.pollingInterval ?? 30_000,
      // Refetch when user returns to tab
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
      // Data is fresh for 1 minute
      staleTime: options?.staleTime ?? 60_000,
    },
  });

  // Extract results from batched read
  const tokenAddress = data?.[0]?.status === "success" ? (data[0].result as Address) : undefined;
  const merkleRoot =
    data?.[1]?.status === "success" ? (data[1].result as `0x${string}`) : undefined;
  const claimFee = data?.[2]?.status === "success" ? (data[2].result as bigint) : undefined;
  const hasExpired = data?.[3]?.status === "success" ? (data[3].result as boolean) : undefined;

  return {
    // Config data
    campaignName: defaultCampaignConfig.campaignName,
    claimFee,
    distributionType: defaultCampaignConfig.distributionType,
    error: error as Error | null,
    expiresAt: defaultCampaignConfig.expiresAt,
    hasExpired,

    // Query states
    isLoading,
    isRefetching,
    merkleRoot,
    refetch: () => {
      rawRefetch();
    },
    // On-chain data
    tokenAddress,
  };
}
