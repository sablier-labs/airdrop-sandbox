import type { Hex } from "viem";
import { useAccount, useSimulateContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";

/**
 * Simulates a claim transaction to check if it will succeed
 * Useful for pre-flight validation and gas estimation
 *
 * @param index - Merkle tree index
 * @param amount - Amount to claim
 * @param proof - Merkle proof
 * @param claimFee - Claim fee value
 * @param enabled - Whether to run simulation (default: true)
 *
 * @example
 * ```tsx
 * function ClaimButton({ index, amount, proof }) {
 *   const { claimFee } = useClaimFee();
 *   const { willSucceed, isLoading, error } = useSimulateClaim(
 *     BigInt(index),
 *     amount,
 *     proof,
 *     claimFee
 *   );
 *
 *   if (isLoading) return <div>Validating...</div>;
 *   if (!willSucceed) return <div>Cannot claim: {error?.message}</div>;
 *
 *   return <button>Claim Airdrop</button>;
 * }
 * ```
 */
export function useSimulateClaim(
  index: bigint | undefined,
  amount: bigint | undefined,
  proof: Hex[] | undefined,
  claimFee = 0n,
  enabled = true,
) {
  const { address } = useAccount();
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  const {
    data: simulationResult,
    isLoading,
    isError,
    error,
  } = useSimulateContract({
    abi: AIRDROP_ABI,
    address: contractAddress,
    args:
      address && index !== undefined && amount !== undefined && proof
        ? [index, address, amount, proof]
        : undefined,
    chainId,
    functionName: "claim",
    query: {
      enabled: enabled && !!address && index !== undefined && amount !== undefined && !!proof,
    },
    value: claimFee,
  });

  return {
    /** Error object */
    error,
    /** Error state */
    isError,
    /** Loading state */
    isLoading,
    /** Simulation result with gas estimate */
    simulationResult,
    /** Whether the transaction will succeed */
    willSucceed: !isError && !!simulationResult,
  };
}
