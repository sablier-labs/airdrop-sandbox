"use client";

import { AlertTriangle, ExternalLink, Gift, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { Address, Hash } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useSablierClaim, useSablierEligibility, useSablierGasEstimation } from "@/hooks";
import type { ClaimResult } from "@/lib/contracts/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loading } from "./ui/loading";

type ClaimPanelProps = {
  contractAddress: Address;
  contractType?: "instant" | "lockup-linear" | "lockup-tranched";
  merkleTreeData?: {
    root: string;
    leaves: Array<{
      index: string;
      recipient: string;
      amount: string;
    }>;
  };
  ipfsHash?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  onClaimSuccess?: (txHash: Hash, streamId?: bigint) => void;
  className?: string;
};

export function ClaimPanel({
  contractAddress,
  contractType,
  merkleTreeData,
  ipfsHash,
  tokenSymbol = "TOKENS",
  tokenDecimals = 18,
  onClaimSuccess,
  className,
}: ClaimPanelProps) {
  const { address } = useAccount();
  const [showGasDetails, setShowGasDetails] = useState(false);

  // Eligibility check
  const {
    amount,
    error: eligibilityError,
    hasClaimed,
    index,
    isEligible,
    isLoading: isCheckingEligibility,
    proof,
  } = useSablierEligibility({
    contractAddress,
    contractType,
    enabled: !!address,
    ipfsHash,
    merkleTreeData,
  });

  // Claim functionality
  const {
    claim,
    state: claimState,
    reset: resetClaim,
  } = useSablierClaim({
    contractAddress,
    contractType,
    onSuccess: (result: ClaimResult) => {
      onClaimSuccess?.(result.hash, result.streamId);
    },
  });

  // Gas estimation
  const {
    estimate,
    gasData,
    isLoading: isEstimatingGas,
  } = useSablierGasEstimation({
    autoUpdate: true,
    contractAddress,
    contractType,
    updateInterval: 30,
  });

  // Auto-estimate gas when eligibility is confirmed
  useEffect(() => {
    if (isEligible && !hasClaimed && amount && index !== null && proof && address) {
      estimate({
        amount,
        index,
        proof: proof as Hash[],
        recipient: address,
      }).catch(() => {
        // Gas estimation failed, but we can still attempt to claim
      });
    }
  }, [isEligible, hasClaimed, amount, index, proof, address, estimate]);

  const handleClaim = async () => {
    if (!isEligible || !amount || index === null || !proof || !address) {
      return;
    }

    try {
      await claim({
        amount,
        index,
        proof: proof as Hash[],
        recipient: address,
      });
    } catch (error) {
      // Error handling is managed by the claim hook
      console.error("Claim failed:", error);
    }
  };

  const formatAmount = (amount: bigint) => {
    return formatUnits(amount, tokenDecimals);
  };

  const getClaimButtonText = () => {
    if (claimState.isLoading) return "Claiming...";
    if (hasClaimed) return "Already Claimed";
    if (!isEligible) return "Not Eligible";
    return `Claim ${amount ? `${formatAmount(amount)} ${tokenSymbol}` : "Tokens"}`;
  };

  const isClaimDisabled =
    !isEligible ||
    hasClaimed ||
    claimState.isLoading ||
    isCheckingEligibility ||
    !amount ||
    index === null ||
    !proof;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Claim Your Airdrop
        </CardTitle>
        <CardDescription>
          {contractType === "instant"
            ? "Claim tokens instantly to your wallet"
            : "Claim and start your token stream"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!address && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Please connect your wallet to claim your airdrop
            </p>
          </div>
        )}

        {address && isCheckingEligibility && (
          <div className="text-center py-6">
            <Loading text="Checking eligibility..." />
          </div>
        )}

        {address && eligibilityError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Error checking eligibility</p>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{eligibilityError.message}</p>
          </div>
        )}

        {address && !isCheckingEligibility && !eligibilityError && (
          <div className="space-y-4">
            {/* Eligibility Status */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {isEligible ? (
                  <Badge variant={hasClaimed ? "secondary" : "success"}>
                    {hasClaimed ? "Claimed" : "Eligible"}
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Eligible</Badge>
                )}
              </div>

              {isEligible && amount && (
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatAmount(amount)} {tokenSymbol}
                  </p>
                  {contractType !== "instant" && (
                    <p className="text-xs text-muted-foreground">Streaming</p>
                  )}
                </div>
              )}
            </div>

            {/* Gas Information */}
            {isEligible && !hasClaimed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transaction Cost</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGasDetails(!showGasDetails)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {isEstimatingGas ? "Estimating..." : "View Details"}
                  </Button>
                </div>

                {gasData && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estimated Cost</span>
                      <span className="font-mono text-sm font-medium">
                        ~{gasData.totalCostFormatted} ETH
                      </span>
                    </div>

                    {showGasDetails && (
                      <div className="mt-2 pt-2 border-t border-blue-200 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Gas Limit</span>
                          <span className="font-mono">{gasData.gasLimit.toString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gas Price</span>
                          <span className="font-mono">{formatUnits(gasData.gasPrice, 9)} gwei</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Contract Fee</span>
                          <span className="font-mono">
                            {formatUnits(gasData.contractFee, 18)} ETH
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Claim Button */}
            <Button onClick={handleClaim} disabled={isClaimDisabled} size="lg" className="w-full">
              {claimState.isLoading && <Loading size="sm" className="mr-2" />}
              {getClaimButtonText()}
            </Button>

            {/* Error Display */}
            {claimState.error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-medium text-destructive">Claim Failed</p>
                </div>
                <p className="text-sm text-destructive/80 mt-1">{claimState.error.message}</p>
                <Button onClick={resetClaim} variant="outline" size="sm" className="mt-2">
                  Try Again
                </Button>
              </div>
            )}

            {/* Success Display */}
            {claimState.txHash && !claimState.error && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Claim Submitted!</p>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your transaction has been submitted successfully.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://etherscan.io/tx/${claimState.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      View on Etherscan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  {claimState.streamId && contractType !== "instant" && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`https://app.sablier.com/stream/${claimState.streamId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        View Stream
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Info Note */}
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
              {contractType === "instant"
                ? "💡 Instant claims send tokens directly to your wallet"
                : "💡 Claimed tokens will be streamed over time according to the vesting schedule"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
