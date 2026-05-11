"use client";

import { getChainId, getExplorerTxUrl } from "@/lib/contracts/airdrop";
import type { TransactionState } from "@/lib/types/airdrop.types";
import { transactionStatusVariants } from "./TransactionStatus.variants";

type Status = "error" | "confirmed" | "confirming" | "writing" | "idle";

/**
 * Resolve the current transaction status from the boolean flags.
 * Order matters: error first, then terminal success, then in-flight states.
 */
function resolveStatus({
  error,
  isConfirmed,
  isConfirming,
  isWriting,
}: Pick<TransactionState, "error" | "isConfirmed" | "isConfirming" | "isWriting">): Status {
  if (error) return "error";
  if (isConfirmed) return "confirmed";
  if (isConfirming) return "confirming";
  if (isWriting) return "writing";
  return "idle";
}

/**
 * Shorten transaction hash for display
 */
function shortenHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Transaction status display component
 * Shows visual feedback for transaction states
 *
 * @example
 * ```tsx
 * const { transactionState } = useClaimAirdrop();
 * return <TransactionStatus {...transactionState} />;
 * ```
 */
export function TransactionStatus({
  hash,
  isWriting,
  isConfirming,
  isConfirmed,
  error,
}: TransactionState) {
  const chainId = getChainId();

  // Determine current status
  const status = resolveStatus({ error, isConfirmed, isConfirming, isWriting });

  // Don't render if idle (no transaction started)
  if (status === "idle") {
    return null;
  }

  return (
    <div className={transactionStatusVariants({ status })}>
      {/* Writing - Waiting for wallet approval */}
      {isWriting && (
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">Approve in Wallet</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please confirm the transaction in your wallet
            </p>
          </div>
        </div>
      )}

      {/* Confirming - Transaction submitted */}
      {isConfirming && hash && (
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 dark:text-blue-100">Confirming Transaction</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Hash: {shortenHash(hash)}</p>
            <a
              className="mt-1 inline-block text-sm font-medium text-blue-600 underline cursor-pointer dark:text-blue-400"
              href={getExplorerTxUrl(hash, chainId)}
              rel="noopener noreferrer"
              target="_blank"
            >
              View on block explorer →
            </a>
          </div>
        </div>
      )}

      {/* Confirmed - Success */}
      {isConfirmed && hash && (
        <div>
          <p className="font-semibold text-green-900 dark:text-green-100">
            ✓ Transaction Confirmed
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            Hash: {shortenHash(hash)}
          </p>
          <a
            className="mt-2 inline-block text-sm font-medium text-green-600 underline cursor-pointer dark:text-green-400"
            href={getExplorerTxUrl(hash, chainId)}
            rel="noopener noreferrer"
            target="_blank"
          >
            View on block explorer →
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div>
          <p className="font-semibold text-red-900 dark:text-red-100">Transaction Failed</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {error.message || "An unknown error occurred"}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact transaction status for inline display
 *
 * @example
 * ```tsx
 * <TransactionStatusCompact hash={hash} isConfirming={isConfirming} />
 * ```
 */
export function TransactionStatusCompact({
  hash,
  isWriting,
  isConfirming,
  isConfirmed,
}: Omit<TransactionState, "error">) {
  const chainId = getChainId();

  if (isWriting) {
    return (
      <span className="text-sm text-yellow-600 dark:text-yellow-400">
        ⏳ Waiting for approval...
      </span>
    );
  }

  if (isConfirming && hash) {
    return (
      <span className="text-sm text-blue-600 dark:text-blue-400">
        ⌛ Confirming...{" "}
        <a
          className="underline cursor-pointer"
          href={getExplorerTxUrl(hash, chainId)}
          rel="noopener noreferrer"
          target="_blank"
        >
          View
        </a>
      </span>
    );
  }

  if (isConfirmed && hash) {
    return (
      <span className="text-sm text-green-600 dark:text-green-400">
        ✓ Confirmed{" "}
        <a
          className="underline cursor-pointer"
          href={getExplorerTxUrl(hash, chainId)}
          rel="noopener noreferrer"
          target="_blank"
        >
          View
        </a>
      </span>
    );
  }

  return null;
}
