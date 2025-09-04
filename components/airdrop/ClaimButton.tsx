"use client";

import { AlertTriangle, CheckCircle, Clock, ExternalLink, Wallet } from "lucide-react";
import { useState } from "react";
import { useChainId } from "wagmi";
import { getChainExplorer } from "@/lib/config/chains";
import Button from "../ui/Button";

export type ClaimState =
  | "connect-wallet"
  | "check-eligibility"
  | "ready-to-claim"
  | "claiming"
  | "claimed"
  | "not-eligible"
  | "error";

export interface ClaimButtonProps {
  state: ClaimState;
  amount?: string;
  tokenSymbol?: string;
  onConnectWallet?: () => void;
  onCheckEligibility?: () => void;
  onClaim?: () => void;
  disabled?: boolean;
  error?: string;
  /** Transaction hash for successful claims */
  txHash?: `0x${string}`;
  /** Stream ID from successful claim */
  streamId?: bigint;
  /** Whether to show gas estimation */
  estimatedGas?: bigint;
}

export default function ClaimButton({
  state,
  amount,
  tokenSymbol,
  onConnectWallet,
  onCheckEligibility,
  onClaim,
  disabled = false,
  error,
  txHash,
  streamId,
  estimatedGas,
}: ClaimButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const chainId = useChainId();
  const chainExplorer = getChainExplorer(chainId);

  const handleClick = async () => {
    if (disabled) return;

    setIsProcessing(true);
    try {
      switch (state) {
        case "connect-wallet":
          await onConnectWallet?.();
          break;
        case "check-eligibility":
          await onCheckEligibility?.();
          break;
        case "ready-to-claim":
          await onClaim?.();
          break;
      }
    } catch (error) {
      console.error("Claim button action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonConfig = () => {
    switch (state) {
      case "connect-wallet":
        return {
          disabled: disabled,
          icon: <Wallet className="h-4 w-4" />,
          loading: isProcessing,
          text: "Connect Wallet",
          variant: "primary" as const,
        };

      case "check-eligibility":
        return {
          disabled: disabled,
          icon: <CheckCircle className="h-4 w-4" />,
          loading: isProcessing,
          text: "Check Eligibility",
          variant: "secondary" as const,
        };

      case "ready-to-claim":
        return {
          disabled: disabled,
          glow: true,
          icon: <CheckCircle className="h-4 w-4" />,
          loading: false,
          text: amount ? `Claim ${amount} ${tokenSymbol}` : "Claim Tokens",
          variant: "primary" as const,
        };

      case "claiming":
        return {
          disabled: true,
          icon: <Clock className="h-4 w-4" />,
          loading: true,
          text: "Claiming...",
          variant: "primary" as const,
        };

      case "claimed":
        return {
          disabled: true,
          icon: <CheckCircle className="h-4 w-4" />,
          loading: false,
          text: streamId
            ? `Claimed! Stream #${streamId.toString().slice(-4)}`
            : "Successfully Claimed!",
          variant: "secondary" as const,
        };

      case "not-eligible":
        return {
          disabled: true,
          icon: <AlertTriangle className="h-4 w-4" />,
          loading: false,
          text: "Not Eligible",
          variant: "ghost" as const,
        };

      case "error":
        return {
          disabled: disabled,
          icon: <AlertTriangle className="h-4 w-4" />,
          loading: false,
          text: "Try Again",
          variant: "destructive" as const,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="space-y-4">
      <Button
        onClick={handleClick}
        variant={config.variant}
        loading={config.loading}
        disabled={config.disabled}
        fullWidth
        size="lg"
        className={`
          ${config.glow ? "glow-purple-strong" : ""}
          ${state === "ready-to-claim" ? "animate-pulse hover:animate-none" : ""}
        `}
      >
        {!config.loading && config.icon}
        <span>{config.text}</span>
      </Button>

      {/* Status messages */}
      {state === "claiming" && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Please confirm the transaction in your wallet
          </p>
          {txHash && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-mono break-all">Tx: {txHash}</p>
              {chainExplorer && (
                <a
                  href={`${chainExplorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <span>Track Transaction</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {state === "claimed" && (
        <div className="text-center space-y-3">
          <p className="text-sm text-green-400">🎉 Tokens have been successfully claimed!</p>
          <div className="space-y-2">
            {streamId && (
              <p className="text-xs text-muted-foreground">Stream ID: #{streamId.toString()}</p>
            )}
            {txHash && chainExplorer && (
              <a
                href={`${chainExplorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <span>View Transaction</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Check your wallet to see your new tokens</p>
        </div>
      )}

      {state === "error" && error && (
        <div className="text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {state === "not-eligible" && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            This address is not eligible for this airdrop
          </p>
          <p className="text-xs text-muted-foreground">
            Double-check your address or try a different one
          </p>
        </div>
      )}

      {/* Gas estimation and security note */}
      {(state === "ready-to-claim" || state === "claiming") && (
        <div className="space-y-2">
          {estimatedGas && (
            <div className="text-xs text-center text-muted-foreground">
              <p>⛽ Estimated gas: ~{(Number(estimatedGas) / 1e9).toFixed(2)} Gwei</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-muted/30 border border-border">
            <p>
              🔒 <strong>Security:</strong> Only approve transactions from this official Sablier
              interface
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
