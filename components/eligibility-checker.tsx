"use client";

import { AlertCircle, CheckCircle, Search, XCircle } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { useSablierEligibility } from "@/hooks";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Loading } from "./ui/loading";

type EligibilityCheckerProps = {
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
  className?: string;
};

export function EligibilityChecker({
  contractAddress,
  contractType,
  merkleTreeData,
  ipfsHash,
  tokenSymbol = "TOKENS",
  tokenDecimals = 18,
  className,
}: EligibilityCheckerProps) {
  const { address: connectedAddress } = useAccount();
  const [addressInput, setAddressInput] = useState("");
  const [addressToCheck, setAddressToCheck] = useState<Address | null>(null);

  // Use current connected address or manually entered address
  const targetAddress = addressToCheck || connectedAddress;

  const { amount, error, hasClaimed, index, isEligible, isLoading, refetch } =
    useSablierEligibility({
      contractAddress,
      contractType,
      enabled: !!targetAddress,
      ipfsHash,
      merkleTreeData,
    });

  const handleAddressCheck = () => {
    if (addressInput.trim()) {
      try {
        setAddressToCheck(addressInput.trim() as Address);
      } catch {
        // Invalid address format
        setAddressToCheck(null);
      }
    }
  };

  const handleReset = () => {
    setAddressInput("");
    setAddressToCheck(null);
  };

  const formatAmount = (amount: bigint) => {
    return formatUnits(amount, tokenDecimals);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Check Eligibility
        </CardTitle>
        <CardDescription>Check if an address is eligible for the airdrop claim</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Input Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Ethereum address (optional)"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="flex-1 font-mono"
            />
            <Button onClick={handleAddressCheck} disabled={!addressInput.trim()} variant="outline">
              Check
            </Button>
          </div>

          {connectedAddress && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Connected: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </span>
              {addressToCheck && (
                <Button onClick={handleReset} variant="ghost" size="sm">
                  Use connected address
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        {targetAddress && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Checking Address:</span>
              <span className="text-sm font-mono text-muted-foreground">
                {targetAddress.slice(0, 6)}...{targetAddress.slice(-4)}
              </span>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loading text="Checking eligibility..." />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <XCircle className="h-4 w-4 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80">{error.message}</p>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !error && (
              <div className="space-y-3">
                {/* Eligibility Status */}
                <div className="flex items-center gap-3">
                  {isEligible ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-700">Eligible</p>
                        <p className="text-sm text-muted-foreground">
                          This address is eligible for the airdrop
                        </p>
                      </div>
                      <Badge variant="success">Eligible</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">Not Eligible</p>
                        <p className="text-sm text-muted-foreground">
                          This address is not eligible for the airdrop
                        </p>
                      </div>
                      <Badge variant="outline">Not Eligible</Badge>
                    </>
                  )}
                </div>

                {/* Claim Status and Amount */}
                {isEligible && amount && (
                  <div className="space-y-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Claimable Amount</span>
                      <span className="font-mono font-medium">
                        {formatAmount(amount)} {tokenSymbol}
                      </span>
                    </div>

                    {hasClaimed !== null && (
                      <div className="flex items-center gap-2">
                        {hasClaimed ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Already claimed</span>
                            <Badge variant="success">Claimed</Badge>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-orange-700">Ready to claim</span>
                            <Badge variant="warning">Unclaimed</Badge>
                          </>
                        )}
                      </div>
                    )}

                    {index !== null && (
                      <div className="text-xs text-muted-foreground">
                        Merkle Index: {index.toString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!targetAddress && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Connect your wallet or enter an address to check eligibility</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
