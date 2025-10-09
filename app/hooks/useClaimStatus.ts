"use client";

import { useReadContract } from "wagmi";
import { defaultCampaignConfig } from "../lib/config/campaign";
import { SablierMerkleInstantAbi } from "../lib/contracts/abis";
import type { ClaimStatus } from "../types/claim.types";

/**
 * Hook to check the claim status for a specific index in the campaign.
 *
 * This hook reads from the contract to check:
 * 1. Whether the index has already been claimed (hasClaimed)
 * 2. Whether the campaign has expired (hasExpired)
 *
 * The hook automatically refreshes on new blocks to stay up-to-date.
 *
 * @param index - The Merkle tree index to check (undefined if user not eligible)
 * @returns ClaimStatus with loading and error states
 *
 * @example
 * ```tsx
 * function ClaimCard() {
 *   const { address } = useAccount();
 *   const eligibility = useEligibility(address);
 *   const claimStatus = useClaimStatus(eligibility.data?.index ?? undefined);
 *
 *   if (claimStatus.isLoading) return <Spinner />;
 *   if (claimStatus.error) return <Error message={claimStatus.error} />;
 *
 *   if (claimStatus.data?.hasClaimed) {
 *     return <AlreadyClaimed />;
 *   }
 *
 *   if (claimStatus.data?.isExpired) {
 *     return <CampaignExpired />;
 *   }
 *
 *   return <ClaimButton />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Display claim timestamp if available
 * function ClaimHistory({ index }: { index: number }) {
 *   const status = useClaimStatus(index);
 *
 *   if (!status.data?.hasClaimed) {
 *     return <div>Not claimed yet</div>;
 *   }
 *
 *   return (
 *     <div>
 *       Claimed on: {status.data.claimTimestamp
 *         ? new Date(status.data.claimTimestamp * 1000).toLocaleDateString()
 *         : "Unknown"}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClaimStatus(index?: number): {
  data: ClaimStatus | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  // Check if the index has been claimed
  const {
    data: hasClaimed = false,
    error: hasClaimedError,
    isLoading: isLoadingClaimed,
    refetch: refetchClaimed,
  } = useReadContract({
    abi: SablierMerkleInstantAbi,
    address: defaultCampaignConfig.contractAddress,
    args: index !== undefined ? [BigInt(index)] : undefined,
    functionName: "hasClaimed",
    query: {
      enabled:
        index !== undefined &&
        index >= 0 &&
        defaultCampaignConfig.contractAddress !== "0x0000000000000000000000000000000000000000",
      // Refetch on every block to stay current
      refetchInterval: 12_000, // 12 seconds (typical block time)
    },
  });

  // Check if the campaign has expired
  const {
    data: hasExpired = false,
    error: hasExpiredError,
    isLoading: isLoadingExpired,
    refetch: refetchExpired,
  } = useReadContract({
    abi: SablierMerkleInstantAbi,
    address: defaultCampaignConfig.contractAddress,
    functionName: "hasExpired",
    query: {
      enabled:
        defaultCampaignConfig.contractAddress !== "0x0000000000000000000000000000000000000000",
      // Expiration doesn't change often, cache longer
      refetchInterval: 60_000, // 1 minute
      staleTime: 30_000, // Consider stale after 30 seconds
    },
  });

  const isLoading = isLoadingClaimed || isLoadingExpired;
  const error = hasClaimedError || hasExpiredError;

  // If no index provided, return null data
  if (index === undefined) {
    return {
      data: null,
      error: null,
      isLoading: false,
      refetch: () => {},
    };
  }

  // Combine data into ClaimStatus
  const data: ClaimStatus = {
    hasClaimed: Boolean(hasClaimed),
    isExpired: Boolean(hasExpired),
    // Note: claimTimestamp and streamId would require additional contract calls
    // or event parsing, which is beyond the basic useReadContract pattern.
    // See CUSTOMIZE section below for implementation examples.
  };

  return {
    data,
    error: error ? (error as Error).message : null,
    isLoading,
    refetch: () => {
      refetchClaimed();
      refetchExpired();
    },
  };
}

/**
 * CUSTOMIZE: Enhanced version with claim timestamp and stream ID
 *
 * This version fetches additional metadata by parsing blockchain events.
 * Useful for displaying claim history and linking to Sablier streams.
 *
 * ```typescript
 * import { usePublicClient } from "wagmi";
 * import { useQuery } from "@tanstack/react-query";
 *
 * export function useClaimStatusEnhanced(index?: number) {
 *   const publicClient = usePublicClient();
 *   const basicStatus = useClaimStatus(index);
 *
 *   // Fetch claim metadata from events
 *   const { data: claimMetadata } = useQuery({
 *     queryKey: ["claim-metadata", index, defaultCampaignConfig.contractAddress],
 *     queryFn: async () => {
 *       if (!index || !publicClient) return null;
 *
 *       // Get Claim events for this index
 *       const logs = await publicClient.getContractEvents({
 *         address: defaultCampaignConfig.contractAddress,
 *         abi: SablierMerkleInstantAbi,
 *         eventName: "Claim",
 *         args: {
 *           index: BigInt(index),
 *         },
 *         fromBlock: "earliest",
 *         toBlock: "latest",
 *       });
 *
 *       if (logs.length === 0) return null;
 *
 *       const claimEvent = logs[0];
 *       const block = await publicClient.getBlock({
 *         blockNumber: claimEvent.blockNumber,
 *       });
 *
 *       return {
 *         claimTimestamp: Number(block.timestamp),
 *         streamId: claimEvent.args.streamId, // For linear/tranched campaigns
 *         blockNumber: claimEvent.blockNumber,
 *         transactionHash: claimEvent.transactionHash,
 *       };
 *     },
 *     enabled: !!index && basicStatus.data?.hasClaimed === true,
 *     staleTime: Infinity, // Claim data never changes
 *   });
 *
 *   if (!basicStatus.data) {
 *     return { ...basicStatus, data: null };
 *   }
 *
 *   return {
 *     ...basicStatus,
 *     data: {
 *       ...basicStatus.data,
 *       claimTimestamp: claimMetadata?.claimTimestamp,
 *       streamId: claimMetadata?.streamId,
 *     },
 *   };
 * }
 * ```
 */

/**
 * CUSTOMIZE: Version with watch mode for real-time updates
 *
 * Uses watchContractEvent to listen for claim events in real-time.
 * Provides instant UI updates when claims happen.
 *
 * ```typescript
 * import { useWatchContractEvent } from "wagmi";
 * import { useState, useEffect } from "react";
 *
 * export function useClaimStatusRealtime(index?: number) {
 *   const [hasClaimed, setHasClaimed] = useState(false);
 *   const [lastClaimTime, setLastClaimTime] = useState<number>();
 *
 *   const basicStatus = useClaimStatus(index);
 *
 *   // Watch for Claim events
 *   useWatchContractEvent({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     eventName: "Claim",
 *     onLogs: (logs) => {
 *       const relevantLog = logs.find(
 *         (log) => index !== undefined && log.args.index === BigInt(index)
 *       );
 *
 *       if (relevantLog) {
 *         setHasClaimed(true);
 *         setLastClaimTime(Date.now());
 *       }
 *     },
 *   });
 *
 *   // Sync with contract state
 *   useEffect(() => {
 *     if (basicStatus.data?.hasClaimed) {
 *       setHasClaimed(true);
 *     }
 *   }, [basicStatus.data?.hasClaimed]);
 *
 *   return {
 *     ...basicStatus,
 *     data: basicStatus.data ? {
 *       ...basicStatus.data,
 *       hasClaimed,
 *       claimTimestamp: lastClaimTime ? Math.floor(lastClaimTime / 1000) : undefined,
 *     } : null,
 *   };
 * }
 * ```
 */

/**
 * CUSTOMIZE: Batch version for checking multiple indices
 *
 * Useful for admin dashboards showing claim status for many recipients.
 *
 * ```typescript
 * import { useReadContracts } from "wagmi";
 *
 * export function useBatchClaimStatus(indices: number[]) {
 *   const contracts = indices.map((index) => ({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     functionName: "hasClaimed" as const,
 *     args: [BigInt(index)],
 *   }));
 *
 *   const { data: hasExpired } = useReadContract({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     functionName: "hasExpired",
 *   });
 *
 *   const { data, isLoading, error } = useReadContracts({
 *     contracts,
 *   });
 *
 *   const statuses: ClaimStatus[] = indices.map((_, i) => ({
 *     hasClaimed: data?.[i]?.result as boolean ?? false,
 *     isExpired: hasExpired ?? false,
 *   }));
 *
 *   return {
 *     data: statuses,
 *     isLoading,
 *     error: error ? error.message : null,
 *   };
 * }
 * ```
 */

/**
 * CUSTOMIZE: Version with claim percentage tracking
 *
 * Track overall campaign progress.
 *
 * ```typescript
 * import { useReadContract } from "wagmi";
 * import { useQuery } from "@tanstack/react-query";
 *
 * export function useCampaignProgress() {
 *   const { data: hasExpired } = useReadContract({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     functionName: "hasExpired",
 *   });
 *
 *   // Get total recipients from tree
 *   const totalRecipients = MOCK_RECIPIENTS.length;
 *
 *   // Count claimed recipients by checking hasClaimed for all indices
 *   const { data: claimCount = 0 } = useQuery({
 *     queryKey: ["campaign-progress", defaultCampaignConfig.contractAddress],
 *     queryFn: async () => {
 *       // This would typically be done off-chain via events or database
 *       // to avoid excessive RPC calls
 *       let count = 0;
 *       for (let i = 0; i < totalRecipients; i++) {
 *         const claimed = await publicClient.readContract({
 *           address: defaultCampaignConfig.contractAddress,
 *           abi: SablierMerkleInstantAbi,
 *           functionName: "hasClaimed",
 *           args: [BigInt(i)],
 *         });
 *         if (claimed) count++;
 *       }
 *       return count;
 *     },
 *     refetchInterval: 60_000, // Refetch every minute
 *   });
 *
 *   return {
 *     totalRecipients,
 *     claimedCount: claimCount,
 *     unclaimedCount: totalRecipients - claimCount,
 *     percentageClaimed: (claimCount / totalRecipients) * 100,
 *     isExpired: hasExpired ?? false,
 *   };
 * }
 * ```
 */
