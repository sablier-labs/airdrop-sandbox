import { useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

/** Reads `ipfsCID` from the airdrop contract (Airdrops v3.0). */
export function useIpfsCID() {
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: ipfsCID = "",
    isLoading,
    error,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    chainId,
    functionName: "ipfsCID",
  });

  return { error, ipfsCID, isLoading };
}
