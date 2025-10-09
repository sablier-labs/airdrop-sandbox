/**
 * @example With wallet connection
 * ```tsx
 * function ClaimCard({ index }: { index: number }) {
 *   const { canClaim, isConnected, isClaimed } = useClaimStatus(index);
 *
 *   if (!isConnected) return <ConnectWallet />;
 *   if (isClaimed) return <div>Claimed!</div>;
 *   if (canClaim) return <ClaimButton />;
 *   return null;
 * }
 * ```
 */

import type { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

interface UseClaimStatusReturn {
  /** Connected wallet address */
  address: Address | undefined;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether the claim has been made */
  isClaimed: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object if any */
  error: Error | null;
  /** Manually refetch claim status */
  refetch: () => void;
  /** Can claim: connected, not claimed, and has index */
  canClaim: boolean;
}

/**
 * Hook to check if connected wallet can claim
 * Automatically disables if no wallet is connected
 *
 * @param index - The index in the Merkle tree (from proof API)
 * @returns Claim eligibility status with wallet connection info
 */
export function useClaimStatus(index: number | undefined): UseClaimStatusReturn {
  const { address, isConnected } = useAccount();
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: isClaimed,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress as Address,
    args: index !== undefined ? [BigInt(index)] : undefined,
    chainId,
    functionName: "isClaimed",
    query: {
      // Only query if wallet is connected and index is available
      enabled: isConnected && index !== undefined,
      retry: 3,
      staleTime: 30_000,
    },
  });

  const isClaimedValue = isClaimed ?? false;

  return {
    address,
    canClaim: isConnected && !isClaimedValue && index !== undefined,
    error: error as Error | null,
    isClaimed: isClaimedValue,
    isConnected,
    isError,
    isLoading,
    refetch,
  };
}
