"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { MerkleProof } from "@/lib/contracts/merkle";
import { useClaim } from "@/lib/hooks/useClaim";
import { useTokenInfo } from "@/lib/hooks/useTokenInfo";
import { formatAddressDisplay } from "@/lib/utils/ens";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import type { ClaimState } from "./ClaimButton";
import ClaimButton from "./ClaimButton";
import type { EligibilityResult } from "./EligibilityChecker";
import EligibilityChecker from "./EligibilityChecker";

export interface ClaimSidebarProps {
  /** Legacy props for backward compatibility */
  walletAddress?: string;
  isConnected?: boolean;
  onConnectWallet?: () => void;
  onCheckEligibility?: (address: string) => Promise<EligibilityResult>;
  onClaim?: () => Promise<void>;
  tokenSymbol?: string;
  /** Callback when claim is successful */
  onClaimSuccess?: (txHash: string, streamId?: bigint) => void;
  /** Whether to show reCAPTCHA (mock for now) */
  enableRecaptcha?: boolean;
}

export default function ClaimSidebar({
  // Legacy props
  walletAddress: legacyWalletAddress,
  isConnected: legacyIsConnected,
  onConnectWallet: legacyOnConnectWallet,
  onCheckEligibility,
  onClaim: legacyOnClaim,
  tokenSymbol: legacyTokenSymbol,
  // New props
  onClaimSuccess,
  enableRecaptcha = false,
}: ClaimSidebarProps) {
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult>({ status: "idle" });
  const [eligibilityProof, setEligibilityProof] = useState<MerkleProof | null>(null);
  const [claimError, setClaimError] = useState<string>();
  const [recaptchaVerified, setRecaptchaVerified] = useState(!enableRecaptcha);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Claim hook
  const { claim, transaction, canClaim, reset: resetClaim, estimatedGas } = useClaim();

  // Token info
  const { tokenInfo } = useTokenInfo();

  // Use legacy props if provided, otherwise use wagmi
  const walletAddress = legacyWalletAddress || address;
  const isWalletConnected = legacyIsConnected ?? isConnected;
  const tokenSymbol = legacyTokenSymbol || tokenInfo?.symbol || "SABLIER";

  // Handle successful claims
  useEffect(() => {
    if (transaction.state === "success" && transaction.hash && onClaimSuccess) {
      onClaimSuccess(transaction.hash, transaction.streamId);
    }
  }, [transaction.state, transaction.hash, transaction.streamId, onClaimSuccess]);

  // Determine claim state based on various conditions
  const claimState: ClaimState = (() => {
    if (!isWalletConnected) return "connect-wallet";
    if (transaction.state === "pending") return "claiming";
    if (transaction.state === "success") return "claimed";
    if (transaction.state === "error") return "error";
    if (eligibilityResult.status === "idle") return "check-eligibility";
    if (eligibilityResult.status === "eligible" && recaptchaVerified) return "ready-to-claim";
    if (eligibilityResult.status === "not-eligible") return "not-eligible";
    if (eligibilityResult.status === "error") return "error";
    return "check-eligibility";
  })();

  const handleEligibilityChecked = useCallback(
    (result: EligibilityResult, proof: MerkleProof | null) => {
      setEligibilityResult(result);
      setEligibilityProof(proof);

      // Reset any previous errors
      if (result.status === "eligible") {
        setClaimError(undefined);
        resetClaim();
      }
    },
    [resetClaim],
  );

  const handleClaim = async () => {
    // Use legacy callback if provided
    if (legacyOnClaim) {
      try {
        await legacyOnClaim();
      } catch (error) {
        setClaimError(error instanceof Error ? error.message : "Failed to claim tokens");
      }
      return;
    }

    // Use new hook-based claim
    if (!eligibilityProof) {
      setClaimError("No proof available for claim");
      return;
    }

    if (!eligibilityProof || !canClaim(eligibilityProof)) {
      setClaimError("Cannot claim at this time");
      return;
    }

    setClaimError(undefined);

    try {
      await claim(eligibilityProof);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to claim tokens";
      setClaimError(errorMessage);
    }
  };

  const handleConnectWallet = async () => {
    // Use legacy callback if provided
    if (legacyOnConnectWallet) {
      try {
        await legacyOnConnectWallet();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
      return;
    }

    // Use wagmi connect with first available connector
    try {
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleCheckEligibilityClick = async () => {
    // This is now handled by the EligibilityChecker component
    // through the onEligibilityChecked callback
  };

  return (
    <div className="space-y-6">
      {/* Eligibility Checker */}
      {isWalletConnected && claimState === "check-eligibility" && (
        <EligibilityChecker
          onCheckEligibility={onCheckEligibility}
          result={eligibilityResult}
          onEligibilityChecked={handleEligibilityChecked}
        />
      )}

      {/* Claim Actions */}
      <Card glow className="sticky top-24">
        <CardHeader>
          <CardTitle className="text-lg">Claim Your Airdrop</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Status */}
          {isWalletConnected && walletAddress && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Connected Wallet</p>
                {!legacyOnConnectWallet && (
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              <p className="text-sm font-mono">
                {formatAddressDisplay(walletAddress as `0x${string}`, eligibilityResult.ensName)}
              </p>
            </div>
          )}

          {/* Eligibility Status */}
          {eligibilityResult.status === "eligible" && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-green-400">Eligible for Claim</p>
              </div>
              {eligibilityResult.amount && (
                <p className="text-lg font-semibold text-foreground">
                  {eligibilityResult.amount} {eligibilityResult.tokenSymbol || tokenSymbol}
                </p>
              )}
            </div>
          )}

          {/* reCAPTCHA Mock */}
          {enableRecaptcha && eligibilityResult.status === "eligible" && !recaptchaVerified && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-medium mb-2">Security Verification</p>
              <div className="bg-gray-100 border border-gray-300 rounded p-3 text-center">
                <p className="text-sm text-gray-600 mb-2">reCAPTCHA Mock</p>
                <button
                  type="button"
                  onClick={() => setRecaptchaVerified(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  ✓ I'm not a robot
                </button>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          {transaction.state !== "idle" && (
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Transaction Status</p>
                {transaction.state === "success" && (
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Success</span>
                  </div>
                )}
              </div>

              {transaction.hash && (
                <p className="text-xs font-mono text-muted-foreground break-all">
                  Tx: {transaction.hash}
                </p>
              )}

              {transaction.streamId && (
                <p className="text-xs text-muted-foreground">
                  Stream ID: {transaction.streamId.toString()}
                </p>
              )}

              {estimatedGas && claimState === "ready-to-claim" && (
                <p className="text-xs text-muted-foreground">
                  Est. Gas: ~{estimatedGas.toString()} wei
                </p>
              )}
            </div>
          )}

          {/* Claim Button */}
          <ClaimButton
            state={claimState}
            amount={eligibilityResult.amount}
            tokenSymbol={eligibilityResult.tokenSymbol || tokenSymbol}
            onConnectWallet={handleConnectWallet}
            onCheckEligibility={handleCheckEligibilityClick}
            onClaim={handleClaim}
            error={claimError || transaction.error}
            txHash={transaction.hash}
            streamId={transaction.streamId}
            estimatedGas={estimatedGas}
          />

          {/* Help */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Need Help?</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Make sure you're using the correct wallet</p>
              <p>• Check that you meet the eligibility criteria</p>
              <p>• Ensure you have enough ETH for gas fees</p>
              <p>• Only approve transactions from this official interface</p>
              {enableRecaptcha && <p>• Complete the security verification</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
