import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

const USD_DECIMALS = 8;

/**
 * Reads `minFeeUSD` from the airdrop contract (Airdrops v3.0).
 * The raw value is an 8-decimal Chainlink-style USD figure; `formatted` is a $X.XX string.
 */
export function useMinFeeUSD() {
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: minFeeUSD = 0n,
    isLoading,
    error,
  } = useReadContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    chainId,
    functionName: "minFeeUSD",
  });

  const formatted = `$${Number(formatUnits(minFeeUSD, USD_DECIMALS)).toFixed(2)}`;

  return { error, formatted, isLoading, minFeeUSD };
}
