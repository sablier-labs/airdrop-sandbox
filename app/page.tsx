"use client";

import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Address, Hash } from "viem";
import { useAccount } from "wagmi";

import {
  Badge,
  CampaignStats,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ClaimPanel,
  EligibilityChecker,
  MainLayout,
  TransactionStatus,
  WalletConnect,
} from "@/components";

// Example configuration - in a real app, this would come from environment variables or API
const CAMPAIGN_CONFIG = {
  campaignName: "Sablier Community Airdrop",
  contractAddress: "0x1234567890123456789012345678901234567890" as Address,
  contractType: "lockup-linear" as "instant" | "lockup-linear" | "lockup-tranched",
  // Example merkle tree data - in production this would be loaded from IPFS or API
  merkleTreeData: {
    leaves: [
      // This would contain the actual merkle tree data
      {
        amount: "1000000000000000000000", // 1000 tokens
        index: "0",
        recipient: "0x1234567890123456789012345678901234567890",
      },
      // ... more leaves
    ],
    root: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  tokenDecimals: 18,
  tokenSymbol: "SABR",
};

export default function Home() {
  const { isConnected } = useAccount();
  const [claimedTxHash, setClaimedTxHash] = useState<Hash | null>(null);
  const [claimedStreamId, setClaimedStreamId] = useState<bigint | null>(null);

  const handleClaimSuccess = (txHash: Hash, streamId?: bigint) => {
    setClaimedTxHash(txHash);
    if (streamId) {
      setClaimedStreamId(streamId);
    }
    toast.success("Claim submitted successfully!");
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full border border-orange-200">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              {CAMPAIGN_CONFIG.campaignName}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Claim Your{" "}
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Sablier Tokens
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participate in the future of token streaming. Check your eligibility and claim your
            {CAMPAIGN_CONFIG.tokenSymbol} tokens with real-time vesting.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Connection */}
            {!isConnected ? (
              <WalletConnect
                variant="card"
                title="Connect to Get Started"
                description="Connect your wallet to check eligibility and claim your airdrop tokens"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Eligibility Checker */}
                <EligibilityChecker
                  contractAddress={CAMPAIGN_CONFIG.contractAddress}
                  contractType={CAMPAIGN_CONFIG.contractType}
                  merkleTreeData={CAMPAIGN_CONFIG.merkleTreeData}
                  tokenSymbol={CAMPAIGN_CONFIG.tokenSymbol}
                  tokenDecimals={CAMPAIGN_CONFIG.tokenDecimals}
                />

                {/* Claim Panel */}
                <ClaimPanel
                  contractAddress={CAMPAIGN_CONFIG.contractAddress}
                  contractType={CAMPAIGN_CONFIG.contractType}
                  merkleTreeData={CAMPAIGN_CONFIG.merkleTreeData}
                  tokenSymbol={CAMPAIGN_CONFIG.tokenSymbol}
                  tokenDecimals={CAMPAIGN_CONFIG.tokenDecimals}
                  onClaimSuccess={handleClaimSuccess}
                />
              </div>
            )}

            {/* Transaction Status */}
            {claimedTxHash && (
              <TransactionStatus
                txHash={claimedTxHash}
                streamId={claimedStreamId || undefined}
                showStreamLink={(CAMPAIGN_CONFIG.contractType as string) !== "instant"}
                title="Claim Transaction Status"
              />
            )}
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-6">
            {/* Campaign Statistics */}
            <CampaignStats
              contractAddress={CAMPAIGN_CONFIG.contractAddress}
              contractType={CAMPAIGN_CONFIG.contractType}
              merkleTreeData={CAMPAIGN_CONFIG.merkleTreeData}
              tokenSymbol={CAMPAIGN_CONFIG.tokenSymbol}
              tokenDecimals={CAMPAIGN_CONFIG.tokenDecimals}
              campaignName={CAMPAIGN_CONFIG.campaignName}
            />

            {/* Info Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  About This Airdrop
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Token</span>
                    <Badge variant="outline">{CAMPAIGN_CONFIG.tokenSymbol}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="outline">
                      {(CAMPAIGN_CONFIG.contractType as string) === "instant"
                        ? "Instant"
                        : "Streaming"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <Badge variant="outline">Ethereum</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {(CAMPAIGN_CONFIG.contractType as string) === "instant"
                      ? "Tokens will be sent directly to your wallet upon claiming."
                      : "Tokens will be streamed to you over time according to the vesting schedule."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Simple steps to claim your tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Connect Wallet</p>
                      <p className="text-xs text-muted-foreground">Connect your Ethereum wallet</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Check Eligibility</p>
                      <p className="text-xs text-muted-foreground">
                        Verify your address is eligible
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Claim Tokens</p>
                      <p className="text-xs text-muted-foreground">Submit transaction to claim</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Enjoy Streaming</p>
                      <p className="text-xs text-muted-foreground">
                        Watch your tokens stream in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8 border-t">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Ready to explore Sablier?</h2>
            <p className="text-muted-foreground">
              Discover the full potential of token streaming on the Sablier platform
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://app.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Launch App
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://docs.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
