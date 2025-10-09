import type { Hex } from "viem";
import { useClaimAirdrop } from "./useClaimAirdrop";
import { useClaimFee } from "./useClaimEligibility";

/**
 * Enhanced claim hook that automatically includes the claim fee
 *
 * @example
 * ```tsx
 * function ClaimButton({ index, amount, proof }) {
 *   const { claim, isPending, isConfirmed, errorMessage } = useClaimWithFee();
 *
 *   return (
 *     <>
 *       <button
 *         onClick={() => claim(BigInt(index), amount, proof)}
 *         disabled={isPending}
 *       >
 *         {isPending ? 'Claiming...' : 'Claim Airdrop'}
 *       </button>
 *       {errorMessage && <div className="text-red-500">{errorMessage}</div>}
 *     </>
 *   );
 * }
 * ```
 */
export function useClaimWithFee() {
  const claimHook = useClaimAirdrop();
  const { claimFee, isLoading: isFeeLoading } = useClaimFee();

  /**
   * Execute claim with automatic fee inclusion
   */
  const claimWithFee = (index: bigint, amount: bigint, proof: Hex[]) => {
    claimHook.claim(index, amount, proof, claimFee);
  };

  return {
    ...claimHook,
    /** Execute claim with automatic fee */
    claim: claimWithFee,
    /** Claim fee being used */
    claimFee,
    /** Whether fee is still loading */
    isFeeLoading,
  };
}
