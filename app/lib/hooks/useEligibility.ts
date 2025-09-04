import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import { getAirdropConfig } from "@/app/lib/config/airdrop";
import { sablierMerkleAbi } from "@/app/lib/contracts/abi";
import type { MerkleProof } from "@/app/lib/contracts/merkle";
import { validateMerkleProof } from "@/app/lib/contracts/merkle";
import { generateMerkleProof, getRecipient } from "@/app/lib/services/merkle";

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

  // Get configuration data
  const configQuery = useQuery({
    queryFn: async () => {
      const config = await getAirdropConfig();
      return {
        claimEndDate: config.distribution.claimEndDate,
        claimStartDate: config.distribution.claimStartDate,
        distributorAddress: config.contracts.airdropAddress,
        totalRecipients: config.distribution.totalRecipients,
      };
    },
    queryKey: ["airdrop", "config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const distributorAddress = configQuery.data?.distributorAddress;

  // Get recipient data first to determine the index
  const recipientQuery = useQuery({
    enabled: Boolean(address),
    // biome-ignore lint/style/noNonNullAssertion: address is checked above
    queryFn: () => getRecipient(address!),
    queryKey: ["recipient", address],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Check if user has already claimed using the correct index from IPFS data
  const hasClaimedQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    args: recipientQuery.data ? [BigInt(recipientQuery.data.index)] : undefined,
    functionName: "hasClaimed",
    query: {
      enabled: !!distributorAddress && !!recipientQuery.data && !recipientQuery.isLoading,
      staleTime: 10_000, // 10 seconds
    },
  });

  // Note: The new contract does not have a paused() function
  // Campaign status is now determined by expiration date only

  // Generate eligibility data using React Query
  const eligibilityQuery = useQuery({
    enabled: !!address && !!configQuery.data && !!distributorAddress && !recipientQuery.isLoading,
    queryFn: async (): Promise<EligibilityInfo> => {
      if (!address) throw new Error("Address is required");
      if (!distributorAddress) throw new Error("No distributor contract for current chain");
      if (!configQuery.data) throw new Error("Configuration not loaded");

      const recipient = recipientQuery.data;
      const hasClaimed = hasClaimedQuery.data ?? false;

      // Check if campaign is active based on timeline
      const now = new Date();
      const { claimStartDate, claimEndDate } = configQuery.data;
      const isActive = now >= claimStartDate && now <= claimEndDate;

      // Check if campaign is expired/inactive
      if (!isActive) {
        return {
          amount: recipient ? BigInt(recipient.amount) : 0n,
          hasClaimed: false,
          proof: null,
          reason: "Airdrop campaign has ended",
          status: "expired",
        };
      }

      // Check if address is not eligible (not in IPFS recipient list)
      if (!recipient) {
        return {
          amount: 0n,
          hasClaimed: false,
          proof: null,
          reason: "Address is not eligible for this airdrop",
          status: "not-eligible",
        };
      }

      // Check if already claimed
      if (hasClaimed) {
        return {
          amount: BigInt(recipient.amount),
          hasClaimed: true,
          proof: null,
          reason: "Tokens have already been claimed for this address",
          status: "already-claimed",
        };
      }

      // Generate Merkle proof using the IPFS service
      const proof = await generateMerkleProof(address);

      if (!proof) {
        return {
          amount: BigInt(recipient.amount),
          hasClaimed: false,
          proof: null,
          reason: "Unable to generate proof for eligible address",
          status: "not-eligible",
        };
      }

      // Validate the proof structure (basic validation)
      const proofErrors = validateMerkleProof(proof);
      if (proofErrors.length > 0) {
        return {
          amount: BigInt(recipient.amount),
          hasClaimed: false,
          proof: null,
          reason: `Invalid proof: ${proofErrors.join(", ")}`,
          status: "not-eligible",
        };
      }

      return {
        amount: BigInt(recipient.amount),
        hasClaimed: false,
        proof,
        reason: "Address is eligible and ready to claim",
        status: "eligible",
      };
    },
    queryKey: [
      "eligibility",
      chainId,
      distributorAddress,
      address,
      recipientQuery.data?.index,
      hasClaimedQuery.data,
    ],
    staleTime: 30_000, // 30 seconds
  });

  // Determine loading state
  const isLoading = configQuery.isLoading || recipientQuery.isLoading || eligibilityQuery.isLoading;

  // Collect any errors
  const error =
    configQuery.error ||
    recipientQuery.error ||
    hasClaimedQuery.error ||
    eligibilityQuery.error ||
    (!address ? new Error("Address is required") : null) ||
    (!distributorAddress ? new Error(`Chain ${chainId} not supported`) : null);

  // Refetch function
  const refetch = () => {
    configQuery.refetch();
    recipientQuery.refetch();
    hasClaimedQuery.refetch();
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
