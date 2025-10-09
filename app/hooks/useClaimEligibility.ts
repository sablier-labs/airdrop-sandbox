import { useAccount, useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

/**
 * Hook to fetch the claim fee from the airdrop contract
 *
 * @example
 * ```tsx
 * function ClaimInfo() {
 *   const { claimFee, isLoading } = useClaimFee();
 *
 *   if (isLoading) return <div>Loading fee...</div>;
 *
 *   return <div>Claim fee: {formatEther(claimFee)} ETH</div>;
 * }
 * ```
 */
export function useClaimFee() {
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: claimFee = 0n,
    isLoading,
    error,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    chainId,
    functionName: "CLAIM_FEE",
  });

  return {
    /** Claim fee in wei */
    claimFee: claimFee as bigint,
    /** Error if any */
    error,
    /** Loading state */
    isLoading,
  };
}

/**
 * Hook to check if an index has already been claimed
 *
 * @param index - Merkle tree index to check
 * @param enabled - Whether to run the query (default: true)
 *
 * @example
 * ```tsx
 * function ClaimStatus({ index }) {
 *   const { isClaimed, isLoading } = useIsClaimed(index);
 *
 *   if (isLoading) return <div>Checking status...</div>;
 *   if (isClaimed) return <div>Already claimed</div>;
 *
 *   return <ClaimButton index={index} />;
 * }
 * ```
 */
export function useIsClaimed(index: bigint | undefined, enabled = true) {
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: isClaimed = false,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    args: index !== undefined ? [index] : undefined,
    chainId,
    functionName: "isClaimed",
    query: {
      enabled: enabled && index !== undefined,
    },
  });

  return {
    /** Error if any */
    error,
    /** Whether the index has been claimed */
    isClaimed: isClaimed as boolean,
    /** Loading state */
    isLoading,
    /** Refetch claim status */
    refetch,
  };
}

/**
 * Combined hook for all eligibility checks
 *
 * @param index - Merkle tree index to check
 *
 * @example
 * ```tsx
 * function ClaimCard({ index, amount, proof }) {
 *   const { address } = useAccount();
 *   const { isClaimed, claimFee, isLoading } = useClaimEligibility(BigInt(index));
 *
 *   if (!address) return <div>Connect wallet</div>;
 *   if (isLoading) return <div>Loading...</div>;
 *   if (isClaimed) return <div>Already claimed</div>;
 *
 *   return <ClaimButton index={index} amount={amount} proof={proof} fee={claimFee} />;
 * }
 * ```
 */
export function useClaimEligibility(index: bigint | undefined) {
  const { address } = useAccount();
  const { claimFee, isLoading: isFeeLoading, error: feeError } = useClaimFee();
  const {
    isClaimed,
    isLoading: isClaimedLoading,
    error: claimedError,
    refetch,
  } = useIsClaimed(index);

  return {
    /** Claim fee in wei */
    claimFee,
    /** Error if any */
    error: feeError || claimedError,
    /** Whether the index has been claimed */
    isClaimed,
    /** Whether wallet is connected */
    isConnected: !!address,
    /** Loading state */
    isLoading: isFeeLoading || isClaimedLoading,
    /** Refetch claim status */
    refetch,
  };
}
