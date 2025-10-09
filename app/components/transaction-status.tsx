"use client";

import { tv } from "tailwind-variants";
import { getChainId } from "@/lib/contracts/airdrop";
import type { TransactionState } from "@/types/airdrop.types";

/**
 * Transaction status component styles
 *
 * CUSTOMIZATION POINT: Modify status colors and icons
 */
const statusStyles = tv({
  base: "rounded-lg border p-4",
  defaultVariants: {
    status: "idle",
  },
  variants: {
    status: {
      confirmed: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
      confirming: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
      error: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
      idle: "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
      writing: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
    },
  },
});

/**
 * Get block explorer URL for a transaction
 *
 * CUSTOMIZATION POINT: Add support for other networks
 */
function getBlockExplorerUrl(hash: `0x${string}`, chainId: number): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io/tx",
    137: "https://polygonscan.com/tx",
    8453: "https://basescan.org/tx",
    42161: "https://arbiscan.io/tx",
    11155111: "https://sepolia.etherscan.io/tx", // Sepolia
  };

  const baseUrl = explorers[chainId] || "https://etherscan.io/tx";
  return `${baseUrl}/${hash}`;
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
  const status = error
    ? "error"
    : isConfirmed
      ? "confirmed"
      : isConfirming
        ? "confirming"
        : isWriting
          ? "writing"
          : "idle";

  // Don't render if idle (no transaction started)
  if (status === "idle") {
    return null;
  }

  return (
    <div className={statusStyles({ status })}>
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
              href={getBlockExplorerUrl(hash, chainId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-blue-600 underline cursor-pointer dark:text-blue-400"
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
            href={getBlockExplorerUrl(hash, chainId)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-green-600 underline cursor-pointer dark:text-green-400"
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
          href={getBlockExplorerUrl(hash, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline cursor-pointer"
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
          href={getBlockExplorerUrl(hash, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline cursor-pointer"
        >
          View
        </a>
      </span>
    );
  }

  return null;
}
