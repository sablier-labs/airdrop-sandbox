import type { BaseError, Hex } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AIRDROP_ABI, getAirdropContractAddress, getChainId } from "@/lib/contracts/airdrop";
import { handleContractError } from "@/lib/utils/errors";
import type { TransactionState } from "@/types/airdrop.types";

/**
 * Hook to claim tokens from the airdrop contract
 *
 * Handles the full transaction lifecycle:
 * 1. Writing transaction to wallet
 * 2. Waiting for user approval
 * 3. Waiting for transaction confirmation
 * 4. Error handling
 *
 * @example
 * ```tsx
 * function ClaimButton({ index, amount, proof }) {
 *   const { claim, isWriting, isConfirming, isConfirmed, error } = useClaimAirdrop();
 *
 *   const handleClaim = () => {
 *     claim(BigInt(index), parseUnits(amount, 18), proof);
 *   };
 *
 *   if (isConfirmed) return <div>Claimed!</div>;
 *
 *   return (
 *     <button onClick={handleClaim} disabled={isWriting || isConfirming}>
 *       {isWriting && 'Approve in wallet...'}
 *       {isConfirming && 'Confirming...'}
 *       {!isWriting && !isConfirming && 'Claim Airdrop'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useClaimAirdrop() {
  const { address } = useAccount();
  const contractAddress = getAirdropContractAddress();
  const chainId = getChainId();

  // Write transaction
  const {
    data: hash,
    error: writeError,
    isPending: isWriting,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    chainId,
    hash,
  });

  /**
   * Execute claim transaction
   *
   * @param index - Merkle tree index
   * @param amount - Amount to claim (in smallest token unit)
   * @param proof - Merkle proof array
   * @param claimFee - Optional claim fee (defaults to 0)
   */
  const claim = async (index: bigint, amount: bigint, proof: Hex[], claimFee = 0n) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    writeContract({
      abi: AIRDROP_ABI,
      address: contractAddress,
      args: [index, address, amount, proof],
      chainId,
      functionName: "claim",
      value: claimFee, // Include claim fee as msg.value
    });
  };

  /**
   * Reset the transaction state
   * Useful for allowing users to retry after an error
   */
  const reset = () => {
    resetWrite();
  };

  // Combine errors
  const error = (writeError || confirmError) as BaseError | null;

  // Transaction state
  const transactionState: TransactionState = {
    error,
    hash,
    isConfirmed,
    isConfirming,
    isWriting,
  };

  return {
    /** Execute claim transaction */
    claim,
    /** Error if any */
    error,
    /** User-friendly error message */
    errorMessage: error ? handleContractError(error) : null,
    /** Transaction hash (available after write) */
    hash,
    /** Transaction confirmed successfully */
    isConfirmed,
    /** Transaction submitted, waiting for confirmation */
    isConfirming,
    /** Transaction in progress (writing or confirming) */
    isPending: isWriting || isConfirming,
    /** Waiting for wallet approval */
    isWriting,
    /** Reset transaction state */
    reset,
    /** Complete transaction state object */
    transactionState,
  };
}
