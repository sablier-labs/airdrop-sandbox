import { useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

/** Reads `calculateMinFeeWei` from the airdrop contract */
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
    functionName: "calculateMinFeeWei",
  });

  return { claimFee, error, isLoading };
}
