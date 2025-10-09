"use client";

import { useState } from "react";
import { tv } from "tailwind-variants";
import { parseUnits } from "viem";
import { useAirdropProof, useClaimableAmount, useClaimStatus, useClaimWithFee } from "@/hooks";
import { ConnectWallet } from "./connect-wallet";
import { TransactionStatus } from "./transaction-status";

/**
 * Claim card component styles
 *
 * CUSTOMIZATION POINT: Modify card styling to match your brand
 */
const claimCardStyles = tv({
  slots: {
    amount: "mb-6 text-center",
    amountLabel: "mt-2 text-sm text-gray-500",
    amountValue: "text-4xl font-bold text-blue-600 dark:text-blue-400",
    button:
      "w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
    card: "rounded-xl border bg-white p-6 shadow-lg dark:bg-gray-900",
    description: "mb-6 text-gray-600 dark:text-gray-400",
    error:
      "rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    info: "rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
    status: "mb-4 rounded-lg border p-4",
    success:
      "rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
    title: "mb-4 text-2xl font-bold",
  },
});

interface ClaimCardProps {
  /** Token symbol (e.g., "SAPIEN") */
  tokenSymbol?: string;
  /** Token decimals (default: 18) */
  tokenDecimals?: number;
  /** Campaign title */
  title?: string;
  /** Campaign description */
  description?: string;
}

/**
 * Main claim card component
 * Orchestrates wallet connection, proof fetching, and claim transaction
 *
 * CUSTOMIZATION POINT: Modify messaging and behavior
 *
 * @example
 * ```tsx
 * <ClaimCard
 *   tokenSymbol="SAPIEN"
 *   title="Friends of Sapien Airdrop"
 *   description="Claim your SAPIEN tokens"
 * />
 * ```
 */
export function ClaimCard({
  tokenSymbol = "tokens",
  tokenDecimals = 18,
  title = "Claim Your Airdrop",
  description = "Connect your wallet to check eligibility and claim your tokens.",
}: ClaimCardProps) {
  const styles = claimCardStyles();
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch proof for connected wallet
  const {
    proof,
    isEligible,
    isLoading: isLoadingProof,
    isError: isProofError,
    error: proofError,
  } = useAirdropProof();

  // Get formatted amount
  const { formatted: amountFormatted } = useClaimableAmount(tokenDecimals);

  // Check if already claimed
  const { isClaimed, isLoading: isCheckingClaim, isConnected } = useClaimStatus(proof?.index);

  // Claim transaction
  const { claim, isPending, isConfirmed, hash, errorMessage, transactionState } = useClaimWithFee();

  // Handle claim button click
  const handleClaim = () => {
    if (!proof) return;

    const amount = parseUnits(proof.amount, tokenDecimals);
    claim(BigInt(proof.index), amount, proof.proof);
  };

  // Show success message when confirmed
  if (isConfirmed && !showSuccess) {
    setShowSuccess(true);
  }

  // Loading states
  const isLoading = isLoadingProof || isCheckingClaim;

  return (
    <div className={styles.card()}>
      {/* Title */}
      <h2 className={styles.title()}>{title}</h2>

      {/* Description */}
      <p className={styles.description()}>{description}</p>

      {/* Step 1: Connect Wallet */}
      {!isConnected && (
        <div className="space-y-4">
          <div className={styles.info()}>
            <p className="font-semibold">Step 1: Connect Your Wallet</p>
            <p className="mt-1 text-sm">
              Connect with MetaMask or Rabby to check your eligibility.
            </p>
          </div>
          <ConnectWallet variant="primary" size="lg" />
        </div>
      )}

      {/* Step 2: Checking Eligibility */}
      {isConnected && isLoading && (
        <div className={styles.info()}>
          <p className="font-semibold">Checking eligibility...</p>
          <p className="mt-1 text-sm">Please wait while we verify your address.</p>
        </div>
      )}

      {/* Error fetching proof */}
      {isConnected && isProofError && (
        <div className={styles.error()}>
          <p className="font-semibold">Error Checking Eligibility</p>
          <p className="mt-1 text-sm">
            {proofError?.message || "Failed to fetch proof. Please try again."}
          </p>
        </div>
      )}

      {/* Not Eligible */}
      {isConnected && !isLoading && !isEligible && !isProofError && (
        <div className={styles.info()}>
          <p className="font-semibold">Not Eligible</p>
          <p className="mt-1 text-sm">
            {/* CUSTOMIZATION POINT: Custom not-eligible message */}
            Your address is not eligible for this airdrop. Please check the eligibility
            requirements.
          </p>
        </div>
      )}

      {/* Already Claimed */}
      {isConnected && isEligible && isClaimed && (
        <div className={styles.success()}>
          <p className="font-semibold">Already Claimed ✓</p>
          <p className="mt-1 text-sm">You have already claimed your {tokenSymbol} tokens.</p>
        </div>
      )}

      {/* Step 3: Eligible - Show Amount and Claim Button */}
      {isConnected && isEligible && !isClaimed && !isConfirmed && (
        <div className="space-y-6">
          {/* Amount Display */}
          <div className={styles.amount()}>
            <div className={styles.amountValue()}>{amountFormatted}</div>
            <div className={styles.amountLabel()}>{tokenSymbol} available to claim</div>
          </div>

          {/* Transaction Status */}
          <TransactionStatus {...transactionState} />

          {/* Claim Button */}
          {!isPending && !isConfirmed && (
            <button
              type="button"
              onClick={handleClaim}
              disabled={isPending}
              className={styles.button()}
            >
              Claim {tokenSymbol}
            </button>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className={styles.error()}>
              <p className="font-semibold">Transaction Failed</p>
              <p className="mt-1 text-sm">{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {isConfirmed && (
        <div className={styles.success()}>
          <p className="text-xl font-semibold">Claim Successful! 🎉</p>
          <p className="mt-2 text-sm">
            {/* CUSTOMIZATION POINT: Success message and next steps */}
            You have successfully claimed {amountFormatted} {tokenSymbol}.
          </p>
          {hash && (
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block cursor-pointer text-sm font-medium underline"
            >
              View on Etherscan →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
