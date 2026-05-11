import type { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

type UseClaimStatusReturn = {
  address: Address | undefined;
  isConnected: boolean;
  isClaimed: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  canClaim: boolean;
};

/**
 * Checks if the connected wallet can claim for a given Merkle tree index.
 * Automatically disables the query when no wallet is connected.
 */
export function useClaimStatus(index: number | undefined): UseClaimStatusReturn {
  const { address, isConnected } = useAccount();
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: isClaimed = false,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    args: index !== undefined ? [BigInt(index)] : undefined,
    chainId,
    functionName: "hasClaimed",
    query: {
      enabled: isConnected && index !== undefined,
      retry: 3,
      staleTime: 30_000,
    },
  });

  return {
    address,
    canClaim: isConnected && !isClaimed && index !== undefined,
    error: error as Error | null,
    isClaimed,
    isConnected,
    isError,
    isLoading,
    refetch,
  };
}
