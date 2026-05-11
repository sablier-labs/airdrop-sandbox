import { useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

/** Reads `hasExpired` from the airdrop contract (Airdrops v3.0). */
export function useHasExpired() {
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: hasExpired = false,
    isLoading,
    error,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    chainId,
    functionName: "hasExpired",
  });

  return { error, hasExpired, isLoading };
}
