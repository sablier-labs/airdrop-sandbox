"use client";

import { parseUnits } from "viem";
import {
  useAirdropProof,
  useClaimableAmount,
  useClaimStatus,
  useClaimWithFee,
  useHasExpired,
  useIpfsCID,
  useMinFeeUSD,
} from "@/hooks";
import { getChainId, getExplorerTxUrl } from "@/lib/contracts/airdrop";
import { claimCardVariants } from "./ClaimCard.variants";
import { ConnectWallet } from "./ConnectWallet";
import { TransactionStatus } from "./TransactionStatus";

type ClaimCardProps = {
  /** Token symbol (e.g., "SAPIEN") */
  tokenSymbol?: string;
  /** Token decimals (default: 18) */
  tokenDecimals?: number;
  /** Campaign title */
  title?: string;
  /** Campaign description */
  description?: string;
};

/**
 * Main claim card component
 * Orchestrates wallet connection, proof fetching, expiration check, and claim transaction.
 *
 * CUSTOMIZATION POINT: Modify messaging and behavior
 */
export function ClaimCard({
  tokenSymbol = "tokens",
  tokenDecimals = 18,
  title = "Claim Your Airdrop",
  description = "Connect your wallet to check eligibility and claim your tokens.",
}: ClaimCardProps) {
  const styles = claimCardVariants();

  const chainId = getChainId();

  const {
    proof,
    isEligible,
    isLoading: isLoadingProof,
    isError: isProofError,
    error: proofError,
  } = useAirdropProof();
  const { formatted: amountFormatted } = useClaimableAmount(tokenDecimals);
  const { isClaimed, isLoading: isCheckingClaim, isConnected } = useClaimStatus(proof?.index);
  const { claim, isPending, isConfirmed, hash, errorMessage, transactionState } = useClaimWithFee();

  const { hasExpired } = useHasExpired();
  const { formatted: minFeeFormatted, minFeeUSD } = useMinFeeUSD();
  const { ipfsCID } = useIpfsCID();

  const handleClaim = () => {
    if (!proof) return;
    const amount = parseUnits(proof.amount, tokenDecimals);
    claim(BigInt(proof.index), amount, proof.proof);
  };

  const isLoading = isLoadingProof || isCheckingClaim;

  return (
    <div className={styles.card()}>
      <h2 className={styles.title()}>{title}</h2>
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
          <ConnectWallet size="lg" variant="primary" />
        </div>
      )}

      {/* Step 2: Checking Eligibility */}
      {isConnected && isLoading && (
        <div className={styles.info()}>
          <p className="font-semibold">Checking eligibility...</p>
          <p className="mt-1 text-sm">Please wait while we verify your address.</p>
        </div>
      )}

      {/* Campaign Expired */}
      {isConnected && !isLoading && hasExpired && (
        <div className={styles.warning()}>
          <p className="font-semibold">Airdrop Expired</p>
          <p className="mt-1 text-sm">
            The claim window for this airdrop has closed. Unclaimed tokens can no longer be
            distributed.
          </p>
        </div>
      )}

      {/* Error fetching proof */}
      {isConnected && !hasExpired && isProofError && (
        <div className={styles.error()}>
          <p className="font-semibold">Error Checking Eligibility</p>
          <p className="mt-1 text-sm">
            {proofError?.message || "Failed to fetch proof. Please try again."}
          </p>
        </div>
      )}

      {/* Not Eligible */}
      {isConnected && !isLoading && !hasExpired && !isEligible && !isProofError && (
        <div className={styles.info()}>
          <p className="font-semibold">Not Eligible</p>
          <p className="mt-1 text-sm">
            Your address is not eligible for this airdrop. Please check the eligibility
            requirements.
          </p>
        </div>
      )}

      {/* Already Claimed */}
      {isConnected && !hasExpired && isEligible && isClaimed && (
        <div className={styles.success()}>
          <p className="font-semibold">Already Claimed ✓</p>
          <p className="mt-1 text-sm">You have already claimed your {tokenSymbol} tokens.</p>
        </div>
      )}

      {/* Step 3: Eligible — Show Amount and Claim Button */}
      {isConnected && !hasExpired && isEligible && !isClaimed && !isConfirmed && (
        <div className="space-y-6">
          <div className={styles.amount()}>
            <div className={styles.amountValue()}>{amountFormatted}</div>
            <div className={styles.amountLabel()}>{tokenSymbol} available to claim</div>
          </div>

          <TransactionStatus {...transactionState} />

          {!isPending && !isConfirmed && (
            <button
              className={styles.button()}
              disabled={isPending}
              onClick={handleClaim}
              type="button"
            >
              Claim {tokenSymbol}
            </button>
          )}

          {minFeeUSD > 0n && <p className={styles.fee()}>Minimum claim fee: {minFeeFormatted}</p>}

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
            You have successfully claimed {amountFormatted} {tokenSymbol}.
          </p>
          {hash && (
            <a
              className="mt-3 inline-block cursor-pointer text-sm font-medium underline"
              href={getExplorerTxUrl(hash, chainId)}
              rel="noopener noreferrer"
              target="_blank"
            >
              View transaction →
            </a>
          )}
        </div>
      )}

      {ipfsCID && (
        <p className={styles.footer()}>
          Merkle tree:{" "}
          <a
            className="cursor-pointer font-mono underline"
            href={`https://ipfs.io/ipfs/${ipfsCID}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ipfsCID.slice(0, 12)}…{ipfsCID.slice(-6)}
          </a>
        </p>
      )}
    </div>
  );
}
