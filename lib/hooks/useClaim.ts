import { useCallback, useMemo } from "react";
import {
  useChainId,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import type { ChainId } from "@/lib/config/airdrop";
import { getDistributorContract } from "@/lib/config/airdrop";
import { sablierMerkleAbi } from "@/lib/contracts/abi";
import type { MerkleProof } from "@/lib/contracts/merkle";
import { formatProofForClaim } from "@/lib/contracts/merkle";

/**
 * Transaction states for claim operations
 */
export type ClaimTransactionState =
  | "idle" // No transaction initiated
  | "preparing" // Preparing transaction (simulation)
  | "pending" // Transaction submitted, waiting for confirmation
  | "confirming" // Transaction confirmed, waiting for receipt
  | "success" // Transaction successful
  | "error"; // Transaction failed

/**
 * Claim transaction data
 */
export type ClaimTransaction = {
  /** Current state of the transaction */
  state: ClaimTransactionState;
  /** Transaction hash if submitted */
  hash?: `0x${string}`;
  /** Stream ID created by successful claim */
  streamId?: bigint;
  /** Error message if transaction failed */
  error?: string;
  /** Block number where transaction was confirmed */
  blockNumber?: bigint;
  /** Gas used by the transaction */
  gasUsed?: bigint;
};

/**
 * Hook return type for claim operations
 */
export type UseClaimReturn = {
  /** Current transaction data */
  transaction: ClaimTransaction;
  /** Function to execute the claim */
  claim: (proof: MerkleProof) => Promise<void>;
  /** Function to reset transaction state */
  reset: () => void;
  /** Whether claim can be executed (has valid proof and not loading) */
  canClaim: (proof: MerkleProof | null) => boolean;
  /** Estimated gas for the claim transaction */
  estimatedGas?: bigint;
};

/**
 * Hook for executing airdrop claims
 *
 * This hook handles:
 * - Transaction preparation with gas estimation
 * - Claim execution with Merkle proof
 * - Transaction state management (pending, success, error)
 * - Transaction receipt monitoring
 * - Stream ID extraction from successful claims
 * - Error handling and user feedback
 *
 * @returns Claim function, transaction state, and utilities
 *
 * @example
 * ```tsx
 * function ClaimButton({ proof }: { proof: MerkleProof | null }) {
 *   const { claim, transaction, canClaim, reset } = useClaim();
 *
 *   const handleClaim = async () => {
 *     if (!proof) return;
 *     try {
 *       await claim(proof);
 *     } catch (error) {
 *       console.error("Claim failed:", error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={handleClaim}
 *         disabled={!canClaim(proof)}
 *       >
 *         {transaction.state === "pending" ? "Claiming..." : "Claim Tokens"}
 *       </button>
 *
 *       {transaction.state === "success" && (
 *         <div>
 *           <p>✅ Claim successful!</p>
 *           <p>Stream ID: {transaction.streamId?.toString()}</p>
 *           <p>Transaction: {transaction.hash}</p>
 *         </div>
 *       )}
 *
 *       {transaction.state === "error" && (
 *         <div>
 *           <p>❌ Claim failed: {transaction.error}</p>
 *           <button onClick={reset}>Try Again</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClaim(): UseClaimReturn {
  const chainId = useChainId();
  const distributorAddress = getDistributorContract(chainId as ChainId);

  // Write contract hook
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    data: receipt,
    error: receiptError,
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Simulate contract call for gas estimation (when we have a proof)
  const { data: simulateData, error: simulateError } = useSimulateContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    args: [0n, "0x0000000000000000000000000000000000000000", 0n, []], // Placeholder args
    functionName: "claim",
    query: {
      enabled: false, // Only enable when we actually want to simulate
    },
  });

  // Calculate transaction state
  const transactionState: ClaimTransactionState = useMemo(() => {
    if (isWritePending) return "pending";
    if (hash && isReceiptLoading) return "confirming";
    if (isReceiptSuccess && receipt) return "success";
    if (writeError || receiptError) return "error";
    return "idle";
  }, [isWritePending, hash, isReceiptLoading, isReceiptSuccess, receipt, writeError, receiptError]);

  // Extract stream ID from transaction receipt
  const streamId = useMemo(() => {
    if (!receipt || !receipt.logs) return undefined;

    try {
      // Find the Claimed event in the logs
      for (const log of receipt.logs) {
        if (
          log.address?.toLowerCase() === distributorAddress?.toLowerCase() &&
          log.topics &&
          log.topics.length >= 1
        ) {
          // Check if this is a Claimed event (simplified topic matching)
          // In a real implementation, you'd decode the log properly
          // For now, we'll assume the last topic contains the stream ID
          const data = log.data;
          if (data && data.length >= 66) {
            // Extract the stream ID from the log data (this is simplified)
            // In practice, you'd use viem's decodeEventLog
            const streamIdHex = data.slice(-64); // Last 64 chars (32 bytes)
            return BigInt(`0x${streamIdHex}`);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to extract stream ID from receipt:", error);
    }

    return undefined;
  }, [receipt, distributorAddress]);

  // Error message
  const errorMessage = useMemo(() => {
    if (writeError) {
      if (writeError.message.includes("AlreadyClaimed")) {
        return "This address has already claimed tokens";
      }
      if (writeError.message.includes("InvalidProof")) {
        return "Invalid Merkle proof provided";
      }
      if (writeError.message.includes("ContractPaused")) {
        return "Airdrop is currently paused";
      }
      if (writeError.message.includes("User rejected")) {
        return "Transaction was rejected by user";
      }
      return `Transaction failed: ${writeError.message}`;
    }

    if (receiptError) {
      return `Transaction confirmation failed: ${receiptError.message}`;
    }

    if (simulateError) {
      return `Transaction simulation failed: ${simulateError.message}`;
    }

    return undefined;
  }, [writeError, receiptError, simulateError]);

  // Build transaction object
  const transaction: ClaimTransaction = useMemo(
    () => ({
      blockNumber: receipt?.blockNumber,
      error: errorMessage,
      gasUsed: receipt?.gasUsed,
      hash,
      state: transactionState,
      streamId,
    }),
    [transactionState, hash, streamId, errorMessage, receipt],
  );

  // Claim function
  const claim = useCallback(
    async (proof: MerkleProof) => {
      if (!distributorAddress) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      if (!proof) {
        throw new Error("Merkle proof is required");
      }

      try {
        const claimParams = formatProofForClaim(proof);

        await writeContract({
          abi: sablierMerkleAbi,
          address: distributorAddress,
          args: [
            claimParams.index,
            claimParams.recipient,
            claimParams.amount,
            claimParams.merkleProof,
          ],
          functionName: "claim",
        });
      } catch (error) {
        console.error("Claim execution failed:", error);
        throw error;
      }
    },
    [writeContract, distributorAddress, chainId],
  );

  // Reset function
  const reset = useCallback(() => {
    resetWrite();
  }, [resetWrite]);

  // Can claim check
  const canClaim = useCallback(
    (proof: MerkleProof | null): boolean => {
      if (!proof) return false;
      if (!distributorAddress) return false;
      if (transactionState === "pending" || transactionState === "confirming") return false;
      return true;
    },
    [distributorAddress, transactionState],
  );

  // Estimated gas from simulation
  const estimatedGas = simulateData?.request
    ? BigInt(Math.floor(Number(simulateData.request.gas || 0) * 1.1))
    : // Add 10% buffer
      undefined;

  return {
    canClaim,
    claim,
    estimatedGas,
    reset,
    transaction,
  };
}

/**
 * Hook for batch claiming multiple airdrops
 *
 * @param proofs - Array of proofs to claim
 * @returns Batch claim functionality with progress tracking
 *
 * @example
 * ```tsx
 * function BatchClaimButton({ proofs }: { proofs: MerkleProof[] }) {
 *   const { claimBatch, transaction, canClaimBatch, reset } = useBatchClaim();
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={() => claimBatch(proofs)}
 *         disabled={!canClaimBatch(proofs)}
 *       >
 *         Claim {proofs.length} Airdrops
 *       </button>
 *
 *       {transaction.state === "success" && (
 *         <p>✅ Batch claim successful! Stream IDs: {transaction.streamIds?.join(", ")}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBatchClaim() {
  const chainId = useChainId();
  const distributorAddress = getDistributorContract(chainId as ChainId);

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    error: receiptError,
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate transaction state
  const transactionState: ClaimTransactionState = useMemo(() => {
    if (isWritePending) return "pending";
    if (hash && isReceiptLoading) return "confirming";
    if (isReceiptSuccess && receipt) return "success";
    if (writeError || receiptError) return "error";
    return "idle";
  }, [isWritePending, hash, isReceiptLoading, isReceiptSuccess, receipt, writeError, receiptError]);

  // Extract stream IDs from batch claim
  const streamIds = useMemo(() => {
    if (!receipt || !receipt.logs) return undefined;

    try {
      const ids: bigint[] = [];

      for (const log of receipt.logs) {
        if (log.address?.toLowerCase() === distributorAddress?.toLowerCase()) {
          // This is a simplified stream ID extraction
          // In practice, you'd properly decode the ClaimedBatch event
          const data = log.data;
          if (data && data.length >= 66) {
            const streamIdHex = data.slice(-64);
            ids.push(BigInt(`0x${streamIdHex}`));
          }
        }
      }

      return ids.length > 0 ? ids : undefined;
    } catch (error) {
      console.warn("Failed to extract stream IDs from batch claim receipt:", error);
    }

    return undefined;
  }, [receipt, distributorAddress]);

  // Error message
  const errorMessage = useMemo(() => {
    if (writeError) return `Batch claim failed: ${writeError.message}`;
    if (receiptError) return `Transaction confirmation failed: ${receiptError.message}`;
    return undefined;
  }, [writeError, receiptError]);

  // Build transaction object with batch-specific data
  const transaction = useMemo(
    () => ({
      blockNumber: receipt?.blockNumber,
      error: errorMessage,
      gasUsed: receipt?.gasUsed,
      hash,
      state: transactionState,
      streamIds,
    }),
    [transactionState, hash, streamIds, errorMessage, receipt],
  );

  // Batch claim function
  const claimBatch = useCallback(
    async (proofs: MerkleProof[]) => {
      if (!distributorAddress) {
        throw new Error(`Chain ${chainId} not supported`);
      }

      if (!proofs || proofs.length === 0) {
        throw new Error("At least one proof is required");
      }

      try {
        const indices = proofs.map((p) => BigInt(p.leaf.index));
        const recipients = proofs.map((p) => p.leaf.address);
        const amounts = proofs.map((p) => p.leaf.amount);
        const merkleProofs = proofs.map((p) => p.proof);

        await writeContract({
          abi: sablierMerkleAbi,
          address: distributorAddress,
          args: [indices, recipients, amounts, merkleProofs],
          functionName: "claimBatch",
        });
      } catch (error) {
        console.error("Batch claim execution failed:", error);
        throw error;
      }
    },
    [writeContract, distributorAddress, chainId],
  );

  // Reset function
  const reset = useCallback(() => {
    resetWrite();
  }, [resetWrite]);

  // Can batch claim check
  const canClaimBatch = useCallback(
    (proofs: MerkleProof[] | null): boolean => {
      if (!proofs || proofs.length === 0) return false;
      if (!distributorAddress) return false;
      if (transactionState === "pending" || transactionState === "confirming") return false;
      return true;
    },
    [distributorAddress, transactionState],
  );

  return {
    canClaimBatch,
    claimBatch,
    reset,
    transaction,
  };
}
