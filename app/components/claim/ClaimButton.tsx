"use client";

import { tv } from "tailwind-variants";
import type { Address, Hash } from "viem";
import { useChainId } from "wagmi";
import { useClaim } from "../../hooks/useClaim";
import { Button } from "../ui/button";

const claimButtonVariants = tv({
  slots: {
    container: "space-y-4",
    errorMessage:
      "p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400",
    loadingSpinner:
      "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
    successCard:
      "p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800",
    successTitle: "font-semibold text-green-900 dark:text-green-100 mb-2",
    txLink:
      "text-sm text-green-700 dark:text-green-300 hover:underline cursor-pointer inline-flex items-center gap-1",
  },
});

const styles = claimButtonVariants();

/**
 * Block explorer URLs for different chains
 */
const EXPLORER_URLS: Record<number, string> = {
  1: "https://etherscan.io",
  10: "https://optimistic.etherscan.io",
  137: "https://polygonscan.com",
  8453: "https://basescan.org",
  42161: "https://arbiscan.io",
};

/**
 * Get the block explorer URL for a transaction hash
 */
function getTxExplorerUrl(chainId: number, hash: Hash): string {
  const baseUrl = EXPLORER_URLS[chainId] || "https://etherscan.io";
  return `${baseUrl}/tx/${hash}`;
}

export interface ClaimButtonProps {
  /**
   * Index in the Merkle tree
   */
  index: number;

  /**
   * Recipient address (can differ from connected wallet for gifting)
   */
  recipient: Address;

  /**
   * Amount of tokens to claim (in smallest unit)
   */
  amount: bigint;

  /**
   * Merkle proof array
   */
  proof: Hash[];

  /**
   * Optional callback when claim succeeds
   */
  onSuccess?: (hash: Hash) => void;

  /**
   * Optional callback when claim fails
   */
  onError?: (error: Error) => void;

  /**
   * Optional custom button text
   */
  buttonText?: string;

  /**
   * Optional variant override
   */
  variant?: "primary" | "secondary" | "ghost";
}

/**
 * ClaimButton Component
 *
 * Button component for executing claim transactions with comprehensive state management.
 * Features:
 * - Multiple transaction states (preparing, submitting, confirming, success, error)
 * - Transaction hash display with block explorer link
 * - Error handling with user-friendly messages
 * - Disabled states during processing
 * - Responsive design
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ClaimButton
 *   index={0}
 *   recipient={address}
 *   amount={1000000000000000000n}
 *   proof={["0x...", "0x..."]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With callbacks
 * <ClaimButton
 *   index={0}
 *   recipient={address}
 *   amount={1000000000000000000n}
 *   proof={["0x...", "0x..."]}
 *   onSuccess={(hash) => {
 *     console.log("Claim successful:", hash);
 *     refetchClaimStatus();
 *   }}
 *   onError={(error) => {
 *     console.error("Claim failed:", error);
 *   }}
 * />
 * ```
 */
export function ClaimButton({
  index,
  recipient,
  amount,
  proof,
  onSuccess,
  onError,
  buttonText = "Claim Tokens",
  variant = "primary",
}: ClaimButtonProps) {
  const chainId = useChainId();
  const { claim, result, reset } = useClaim();

  const handleClaim = () => {
    try {
      claim({
        amount,
        index,
        proof,
        recipient,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error occurred");
      onError?.(err);
    }
  };

  // Call onSuccess callback when transaction succeeds
  if (result.isSuccess && result.hash && onSuccess) {
    onSuccess(result.hash);
  }

  // Call onError callback when transaction fails
  if (result.isError && result.error && onError) {
    onError(result.error);
  }

  // Determine button state and text
  const getButtonState = () => {
    if (result.isPreparing) {
      return {
        disabled: true,
        showSpinner: true,
        text: "Preparing...",
      };
    }

    if (result.isSubmitting) {
      return {
        disabled: true,
        showSpinner: true,
        text: "Confirm in wallet...",
      };
    }

    if (result.isConfirming) {
      return {
        disabled: true,
        showSpinner: true,
        text: "Waiting for confirmation...",
      };
    }

    if (result.isSuccess) {
      return {
        disabled: false,
        showSpinner: false,
        text: "Claimed!",
      };
    }

    return {
      disabled: false,
      showSpinner: false,
      text: buttonText,
    };
  };

  const buttonState = getButtonState();

  return (
    <div className={styles.container()}>
      {/* Claim Button */}
      <Button
        onClick={handleClaim}
        disabled={buttonState.disabled || result.isSuccess}
        variant={result.isSuccess ? "secondary" : variant}
        size="lg"
        className="w-full"
      >
        {buttonState.showSpinner && <span className={styles.loadingSpinner()} />}
        {buttonState.text}
      </Button>

      {/* Success State */}
      {result.isSuccess && result.hash && (
        <div className={styles.successCard()}>
          <h4 className={styles.successTitle()}>Claim Successful!</h4>
          <p className="text-sm text-green-700 dark:text-green-300 mb-2">
            Your tokens have been successfully claimed.
          </p>
          <a
            href={getTxExplorerUrl(chainId, result.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.txLink()}
          >
            View transaction
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <div className="mt-3">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-green-700 dark:text-green-300 hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {result.isError && result.error && (
        <div className={styles.errorMessage()}>
          <h4 className="font-semibold mb-1">Claim Failed</h4>
          <p className="mb-2">{parseErrorMessage(result.error)}</p>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium hover:underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Parse error messages to be user-friendly
 */
function parseErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // Common error patterns
  if (message.includes("user rejected") || message.includes("user denied")) {
    return "Transaction was rejected in your wallet.";
  }

  if (message.includes("insufficient funds")) {
    return "Insufficient funds to cover the claim fee and gas costs.";
  }

  if (message.includes("already claimed")) {
    return "This allocation has already been claimed.";
  }

  if (message.includes("invalid proof")) {
    return "Invalid claim proof. Please contact support.";
  }

  if (message.includes("expired")) {
    return "The campaign has expired and claims are no longer available.";
  }

  if (message.includes("network")) {
    return "Network error. Please check your connection and try again.";
  }

  // Default to showing the original error message if no pattern matches
  return error.message;
}
