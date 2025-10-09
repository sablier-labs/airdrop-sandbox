import { formatUnits } from "viem";
import { useAirdropProof } from "./useAirdropProof";

/**
 * Hook to get formatted claimable amount
 *
 * @param decimals - Token decimals (default: 18)
 * @returns Formatted amount and raw value
 *
 * @example
 * ```tsx
 * function ClaimableAmount() {
 *   const { formatted, symbol, isLoading } = useClaimableAmount();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   return <div>{formatted} {symbol}</div>;
 * }
 * ```
 */
export function useClaimableAmount(decimals = 18) {
  const { proof, isEligible, isLoading } = useAirdropProof();

  const rawAmount = proof?.amount;
  const formatted = rawAmount ? formatUnits(BigInt(rawAmount), decimals) : "0";

  return {
    /** Formatted amount with decimals */
    formatted,
    /** Proof index */
    index: proof?.index,
    /** Whether eligible to claim */
    isEligible,
    /** Loading state */
    isLoading,
    /** Proof array */
    proof: proof?.proof,
    /** Raw amount string from API */
    raw: rawAmount,
    /** Raw amount as BigInt */
    rawBigInt: rawAmount ? BigInt(rawAmount) : 0n,
  };
}
