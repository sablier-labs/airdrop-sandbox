import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

interface UseClaimFeeReturn {
  /** Claim fee in wei (bigint) */
  claimFee: bigint;
  /** Claim fee in wei as string for display */
  claimFeeString: string;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Error object if any */
  error: Error | null;
}

/**
 * Hook to get the claim fee from the airdrop contract
 * Claim transactions must include this fee as msg.value
 *
 * @returns Claim fee in wei
 */
export function useClaimFee(): UseClaimFeeReturn {
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: claimFee,
    isLoading,
    isError,
    error,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress as Address,
    chainId,
    functionName: "CLAIM_FEE",
    query: {
      retry: 3,
      staleTime: 300_000, // 5 minutes - fee rarely changes
    },
  });

  const fee = claimFee ?? 0n;

  return {
    claimFee: fee,
    claimFeeString: fee.toString(),
    error: error as Error | null,
    isError,
    isLoading,
  };
}
