"use client";

import { AlertTriangle, CheckCircle, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import type { MerkleProof } from "@/app/lib/contracts/merkle";
import { useEligibility } from "@/app/lib/hooks/useEligibility";
import { useMerkleRoot } from "@/app/lib/hooks/useMerkleRoot";
import { useTokenInfo } from "@/app/lib/hooks/useTokenInfo";
import { formatAddressDisplay, isValidAddressOrEns, useEnsResolution } from "@/app/lib/utils/ens";
import Button from "../ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Input from "../ui/Input";
import { LoadingState } from "../ui/LoadingState";

export type EligibilityStatus = "idle" | "checking" | "eligible" | "not-eligible" | "error";

export interface EligibilityResult {
  status: EligibilityStatus;
  address?: string;
  ensName?: string;
  amount?: string;
  tokenSymbol?: string;
  error?: string;
}

export interface EligibilityCheckerProps {
  /** Optional callback for external eligibility checking (legacy support) */
  onCheckEligibility?: (address: string) => Promise<EligibilityResult>;
  /** Pre-computed result (legacy support) */
  result?: EligibilityResult;
  /** Whether the checker should be disabled */
  disabled?: boolean;
  /** Callback when eligibility is determined */
  onEligibilityChecked?: (result: EligibilityResult, proof: MerkleProof | null) => void;
}

export default function EligibilityChecker({
  onCheckEligibility,
  result: externalResult,
  disabled = false,
  onEligibilityChecked,
}: EligibilityCheckerProps) {
  const [inputValue, setInputValue] = useState("");
  const [checkedAddress, setCheckedAddress] = useState<Address | undefined>();

  const { address: connectedAddress } = useAccount();

  // Resolve ENS for the input
  const ensResolution = useEnsResolution(inputValue);

  // Get Merkle root from contract
  const { isLoading: isMerkleRootLoading, error: merkleRootError } = useMerkleRoot();

  // Get token info
  const { tokenInfo, isLoading: isTokenInfoLoading } = useTokenInfo();

  // Check eligibility using the resolved address
  const {
    eligibility,
    isLoading: isEligibilityLoading,
    error: eligibilityError,
  } = useEligibility(checkedAddress);

  const isLoading =
    isMerkleRootLoading || isTokenInfoLoading || isEligibilityLoading || ensResolution.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled || isLoading) return;

    // Use legacy callback if provided
    if (onCheckEligibility) {
      try {
        const result = await onCheckEligibility(inputValue.trim());
        if (onEligibilityChecked) {
          onEligibilityChecked(result, null);
        }
      } catch (error) {
        console.error("Failed to check eligibility:", error);
      }
      return;
    }

    // Use new hook-based approach
    if (ensResolution.address && ensResolution.address !== "0x") {
      setCheckedAddress(ensResolution.address);
    }
  };

  // Auto-check when connected wallet address is available
  useEffect(() => {
    if (connectedAddress && !inputValue && !checkedAddress) {
      setInputValue(connectedAddress);
      setCheckedAddress(connectedAddress);
    }
  }, [connectedAddress, inputValue, checkedAddress]);

  // Notify parent when eligibility is determined
  useEffect(() => {
    if (eligibility && onEligibilityChecked) {
      const result: EligibilityResult = {
        address: checkedAddress,
        amount:
          eligibility.amount > 0n
            ? formatUnits(eligibility.amount, tokenInfo?.decimals || 18)
            : undefined,
        ensName: ensResolution.ensName,
        error: eligibility.reason,
        status:
          eligibility.status === "eligible"
            ? "eligible"
            : eligibility.status === "not-eligible"
              ? "not-eligible"
              : "error",
        tokenSymbol: tokenInfo?.symbol || "TOKEN",
      };
      onEligibilityChecked(result, eligibility.proof);
    }
  }, [eligibility, checkedAddress, ensResolution.ensName, tokenInfo, onEligibilityChecked]);

  const isValidInput = isValidAddressOrEns(inputValue.trim());

  const getInputState = () => {
    if (!inputValue) return "default";
    if (ensResolution.isLoading) return "default";
    return isValidInput ? "success" : "error";
  };

  // Use external result if provided, otherwise use hook result
  const result =
    externalResult ||
    (eligibility
      ? {
          address: checkedAddress,
          amount:
            eligibility.amount > 0n
              ? formatUnits(eligibility.amount, tokenInfo?.decimals || 18)
              : undefined,
          ensName: ensResolution.ensName,
          error: eligibility.reason,
          status:
            eligibility.status === "eligible"
              ? ("eligible" as const)
              : eligibility.status === "not-eligible"
                ? ("not-eligible" as const)
                : ("error" as const),
          tokenSymbol: tokenInfo?.symbol || "TOKEN",
        }
      : undefined);

  const getResultIcon = () => {
    switch (result?.status) {
      case "eligible":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "not-eligible":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getResultMessage = () => {
    switch (result?.status) {
      case "eligible":
        return (
          <div className="space-y-2">
            <p className="text-green-400 font-medium">✅ Eligible for airdrop!</p>
            {result.amount && (
              <p className="text-sm text-muted-foreground">
                Claimable amount:{" "}
                <span className="font-medium text-foreground">
                  {result.amount} {result.tokenSymbol}
                </span>
              </p>
            )}
            {result.ensName && (
              <p className="text-xs text-muted-foreground">ENS: {result.ensName}</p>
            )}
          </div>
        );
      case "not-eligible":
        return (
          <div className="space-y-2">
            <p className="text-red-400 font-medium">❌ Not eligible for this airdrop</p>
            <p className="text-sm text-muted-foreground">
              This address is not included in the recipient list.
            </p>
          </div>
        );
      case "error":
        return (
          <div className="space-y-2">
            <p className="text-yellow-400 font-medium">⚠️ Check failed</p>
            <p className="text-sm text-muted-foreground">
              {result.error || "An error occurred while checking eligibility."}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Check Eligibility</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Wallet Address or ENS Name"
            placeholder="0x... or vitalik.eth"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            state={getInputState()}
            helperText={
              inputValue && !isValidInput
                ? "Please enter a valid address or ENS name"
                : inputValue && ensResolution.isLoading
                  ? "Resolving ENS name..."
                  : "Enter your wallet address to check eligibility"
            }
            fullWidth
            disabled={disabled || isLoading}
          />

          <Button
            type="submit"
            loading={isLoading}
            disabled={!inputValue.trim() || !isValidInput || disabled || isLoading}
            fullWidth
            variant="primary"
          >
            {isLoading ? "Checking..." : "Check Eligibility"}
          </Button>
        </form>

        {/* Loading States */}
        {isMerkleRootLoading && (
          <LoadingState variant="inline" size="sm" text="Fetching Merkle root from contract..." />
        )}

        {isLoading && <LoadingState variant="inline" size="sm" text="Checking eligibility..." />}

        {merkleRootError && (
          <div className="text-center text-sm text-red-400">
            ⚠️ Failed to fetch Merkle root: {merkleRootError.message}
          </div>
        )}

        {eligibilityError && (
          <div className="text-center text-sm text-red-400">
            ⚠️ Eligibility check failed: {eligibilityError.message}
          </div>
        )}

        {/* Result */}
        {result && result.status !== "idle" && result.status !== "checking" && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-start space-x-3">
              {getResultIcon()}
              <div className="flex-1">
                {getResultMessage()}
                {result.address && (
                  <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                    {formatAddressDisplay(result.address as Address, result.ensName)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
          <p>
            💡 <strong>Tip:</strong> You can use ENS names (e.g., vitalik.eth)
          </p>
          <p>🔒 Eligibility is checked directly against the smart contract</p>
          {connectedAddress && (
            <p>🔗 Connected: {formatAddressDisplay(connectedAddress, ensResolution.ensName)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
