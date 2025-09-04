import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import type { ChainId } from "@/lib/config/airdrop";
import { getDistributorContract, sapienAirdropCampaign } from "@/lib/config/airdrop";
import { sablierMerkleAbi } from "@/lib/contracts/abi";
import type { MerkleProof } from "@/lib/contracts/merkle";
import {
  findEligibleRecipient,
  generateProofForAddress,
  validateMerkleProof,
} from "@/lib/contracts/merkle";

/**
 * Eligibility status for a user address
 */
export type EligibilityStatus =
  | "eligible"
  | "not-eligible"
  | "already-claimed"
  | "paused"
  | "expired";

/**
 * Complete eligibility information for a user
 */
export type EligibilityInfo = {
  /** User's eligibility status */
  status: EligibilityStatus;
  /** Amount user is eligible for (0 if not eligible) */
  amount: bigint;
  /** Whether the user has already claimed */
  hasClaimed: boolean;
  /** Merkle proof data (null if not eligible) */
  proof: MerkleProof | null;
  /** Human-readable reason for the status */
  reason: string;
};

/**
 * Hook return type with loading states and error handling
 */
export type UseEligibilityReturn = {
  /** Eligibility information if successfully loaded */
  eligibility?: EligibilityInfo;
  /** Error object if any operation failed */
  error: Error | null;
  /** Whether any data is currently loading */
  isLoading: boolean;
  /** Whether data has been successfully loaded */
  isSuccess: boolean;
  /** Function to manually refetch eligibility data */
  refetch: () => void;
};

/**
 * Hook for checking user eligibility for airdrop claims
 *
 * This hook:
 * - Checks if user address is in the eligible recipients list
 * - Generates Merkle proof for the address
 * - Verifies eligibility against contract state
 * - Checks if already claimed using hasClaimed()
 * - Considers campaign status (paused, expired)
 *
 * @param address - User address to check eligibility for
 * @returns Eligibility status, amount, proof data, and loading states
 *
 * @example
 * ```tsx
 * function EligibilityChecker({ userAddress }: { userAddress: Address }) {
 *   const { eligibility, isLoading, error } = useEligibility(userAddress);
 *
 *   if (isLoading) return <div>Checking eligibility...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!eligibility) return <div>No eligibility data</div>;
 *
 *   return (
 *     <div>
 *       <p>Status: {eligibility.status}</p>
 *       <p>Amount: {eligibility.amount.toString()}</p>
 *       <p>Reason: {eligibility.reason}</p>
 *       {eligibility.proof && <p>Proof ready ✅</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useEligibility(address: Address | undefined): UseEligibilityReturn {
  const chainId = useChainId();
  const distributorAddress = getDistributorContract(chainId as ChainId);

  // Check if user has already claimed
  const hasClaimedQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    args: address ? [address] : undefined,
    functionName: "hasClaimed",
    query: {
      enabled: !!address && !!distributorAddress,
      staleTime: 10_000, // 10 seconds
    },
  });

  // Check if contract is paused
  const isPausedQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "paused",
    query: {
      enabled: !!distributorAddress,
      staleTime: 30_000, // 30 seconds
    },
  });

  // Generate eligibility data using React Query
  const eligibilityQuery = useQuery({
    enabled:
      !!address && !!distributorAddress && hasClaimedQuery.isSuccess && isPausedQuery.isSuccess,
    queryFn: async (): Promise<EligibilityInfo> => {
      if (!address) throw new Error("Address is required");
      if (!distributorAddress) throw new Error("No distributor contract for current chain");

      const hasClaimed = hasClaimedQuery.data ?? false;
      const isPaused = isPausedQuery.data ?? false;
      const isActive = sapienAirdropCampaign.isActive;

      // Check if campaign is paused
      if (isPaused) {
        return {
          amount: 0n,
          hasClaimed: false,
          proof: null,
          reason: "Airdrop campaign is currently paused",
          status: "paused",
        };
      }

      // Check if campaign is expired/inactive
      if (!isActive) {
        return {
          amount: 0n,
          hasClaimed: false,
          proof: null,
          reason: "Airdrop campaign has ended",
          status: "expired",
        };
      }

      // Check if already claimed
      if (hasClaimed) {
        // Try to find original allocation to show amount
        const recipient = findEligibleRecipient(
          sapienAirdropCampaign.distribution.totalRecipients > 0
            ? [] // TODO: Replace with actual recipients data
            : [],
          address,
        );

        return {
          amount: recipient?.amount ?? 0n,
          hasClaimed: true,
          proof: null,
          reason: "Tokens have already been claimed for this address",
          status: "already-claimed",
        };
      }

      // For demo purposes, we'll create mock recipient data
      // In a real implementation, this would come from your backend/API
      const mockRecipients = [
        {
          address: "0x1234567890123456789012345678901234567890" as Address,
          amount: BigInt("1000000000000000000000"),
        },
        {
          address: "0x2345678901234567890123456789012345678901" as Address,
          amount: BigInt("500000000000000000000"),
        },
        // Add more mock recipients as needed for testing
      ];

      // Check if address is eligible
      const recipient = findEligibleRecipient(mockRecipients, address);

      if (!recipient) {
        return {
          amount: 0n,
          hasClaimed: false,
          proof: null,
          reason: "Address is not eligible for this airdrop",
          status: "not-eligible",
        };
      }

      // Generate Merkle proof
      const proof = generateProofForAddress(mockRecipients, address);

      if (!proof) {
        return {
          amount: recipient.amount,
          hasClaimed: false,
          proof: null,
          reason: "Unable to generate proof for eligible address",
          status: "not-eligible",
        };
      }

      // Validate the proof
      const proofErrors = validateMerkleProof(proof);
      if (proofErrors.length > 0) {
        return {
          amount: recipient.amount,
          hasClaimed: false,
          proof: null,
          reason: `Invalid proof: ${proofErrors.join(", ")}`,
          status: "not-eligible",
        };
      }

      return {
        amount: recipient.amount,
        hasClaimed: false,
        proof,
        reason: "Address is eligible and ready to claim",
        status: "eligible",
      };
    },
    queryKey: ["eligibility", chainId, distributorAddress, address],
    staleTime: 30_000, // 30 seconds
  });

  // Determine loading state
  const isLoading =
    hasClaimedQuery.isLoading || isPausedQuery.isLoading || eligibilityQuery.isLoading;

  // Collect any errors
  const error =
    hasClaimedQuery.error ||
    isPausedQuery.error ||
    eligibilityQuery.error ||
    (!address ? new Error("Address is required") : null) ||
    (!distributorAddress ? new Error(`Chain ${chainId} not supported`) : null);

  // Refetch function
  const refetch = () => {
    hasClaimedQuery.refetch();
    isPausedQuery.refetch();
    eligibilityQuery.refetch();
  };

  return {
    eligibility: eligibilityQuery.data,
    error,
    isLoading,
    isSuccess: eligibilityQuery.isSuccess && !!eligibilityQuery.data,
    refetch,
  };
}

// Note: Batch eligibility checking should be implemented at the component level
// to avoid violating React hooks rules. Each address should use a separate hook call.

// Note: Statistics across multiple addresses should be calculated at the component level
// using multiple individual hook calls rather than violating React hooks rules.
