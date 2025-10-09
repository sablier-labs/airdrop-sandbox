"use client";

import { useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { CampaignInfo } from "./components/campaign/CampaignInfo";
import { ClaimButton } from "./components/claim/ClaimButton";
import { ClaimStatus } from "./components/claim/ClaimStatus";
import { EligibilityChecker } from "./components/claim/EligibilityChecker";
import { Container } from "./components/layout/Container";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Card } from "./components/ui/Card";
import { ConnectButton } from "./components/wallet/ConnectButton";
import { useEligibility } from "./hooks/useEligibility";
import { defaultCampaignConfig } from "./lib/config/campaign";

/**
 * Main Airdrop Claim Page
 *
 * This page implements the complete claim flow:
 * 1. User connects wallet
 * 2. Check eligibility (automatically or manually)
 * 3. Display allocation if eligible
 * 4. Allow user to claim tokens
 * 5. Show claim status and success message
 *
 * CUSTOMIZE: Update the hero section content and campaign description
 */

// Disable static generation for this page as it uses client-side Web3 functionality
export const dynamic = "force-dynamic";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [showSuccess, setShowSuccess] = useState(false);

  // CUSTOMIZE: Set to true to auto-check eligibility when wallet connects
  // Set to false to require manual eligibility check
  const autoCheckEligibility = true;

  // Check eligibility for connected wallet (if enabled)
  const eligibility = useEligibility(autoCheckEligibility && address ? address : undefined);

  // Eligibility data
  const isEligible = eligibility.data?.eligible ?? false;
  const allocation = eligibility.data?.amount;
  const proof = eligibility.data?.proof;
  const index = eligibility.data?.index;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <Container size="lg">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
              {/* CUSTOMIZE: Campaign title */}
              Claim Your Airdrop
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {/* CUSTOMIZE: Campaign description */}
              Connect your wallet to check your eligibility and claim your tokens from the{" "}
              {defaultCampaignConfig.campaignName}.
            </p>
          </div>

          {/* Campaign Info Card */}
          <div className="mb-8">
            <CampaignInfo />
          </div>

          {/* Main Content - Conditional Rendering Based on Connection State */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Step 1: Connect Wallet */}
            {!isConnected && (
              <Card title="Get Started">
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      Connect your wallet to check if you&apos;re eligible for this airdrop.
                    </p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        Make sure you&apos;re connected to the correct network and using the wallet
                        that participated in the campaign.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ConnectButton />
                  </div>
                </div>
              </Card>
            )}

            {/* Step 2: Check Eligibility */}
            {isConnected && !autoCheckEligibility && (
              <Card title="Check Eligibility">
                <EligibilityChecker />
              </Card>
            )}

            {/* Step 3a: Loading Eligibility (Auto-check mode) */}
            {isConnected && autoCheckEligibility && eligibility.isLoading && (
              <Card>
                <div className="flex items-center justify-center gap-3 py-8">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Checking eligibility for {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
              </Card>
            )}

            {/* Step 3b: Not Eligible */}
            {isConnected &&
              autoCheckEligibility &&
              !eligibility.isLoading &&
              !isEligible &&
              !eligibility.error && (
                <Card title="Not Eligible">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-900 dark:text-red-100">
                        Your wallet address ({address?.slice(0, 6)}...{address?.slice(-4)}) is not
                        eligible for this airdrop.
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If you believe this is an error, please check:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>You&apos;re connected with the correct wallet</li>
                      <li>You participated in the campaign during the eligibility period</li>
                      <li>You&apos;re on the correct network</li>
                    </ul>
                    <div className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Want to check a different address?
                      </p>
                      <div className="mt-3">
                        <EligibilityChecker />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

            {/* Step 3c: Eligible - Show Claim Interface */}
            {isConnected &&
              isEligible &&
              allocation &&
              proof &&
              index !== null &&
              index !== undefined &&
              !showSuccess && (
                <>
                  {/* Claim Status Card */}
                  <ClaimStatus index={index} detailed />

                  {/* Allocation Details */}
                  <Card title="Your Allocation">
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-center space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            You are eligible to claim
                          </p>
                          <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            {Number(
                              formatUnits(allocation, defaultCampaignConfig.tokenDecimals),
                            ).toLocaleString()}{" "}
                            {defaultCampaignConfig.tokenSymbol}
                          </p>
                        </div>
                      </div>

                      {/* Claim Fee Notice */}
                      {defaultCampaignConfig.claimFee > 0n && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-sm text-orange-900 dark:text-orange-100">
                            A claim fee of {formatUnits(defaultCampaignConfig.claimFee, 18)} ETH is
                            required to process your claim.
                          </p>
                        </div>
                      )}

                      {/* Claim Button */}
                      <ClaimButton
                        index={index}
                        recipient={address as Address}
                        amount={allocation}
                        proof={proof}
                        onSuccess={() => {
                          setShowSuccess(true);
                          // CUSTOMIZE: Add analytics tracking, notifications, etc.
                          console.log("Claim successful!");
                        }}
                        onError={(error) => {
                          // CUSTOMIZE: Add error tracking, notifications, etc.
                          console.error("Claim failed:", error);
                        }}
                      />
                    </div>
                  </Card>
                </>
              )}

            {/* Step 4: Success State */}
            {showSuccess && (
              <Card>
                <div className="text-center space-y-6 py-8">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                      <svg
                        className="h-16 w-16 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Tokens Claimed Successfully!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your {defaultCampaignConfig.tokenSymbol} tokens have been claimed and are now
                      in your wallet.
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      {defaultCampaignConfig.distributionType === "instant"
                        ? "Your tokens are immediately available in your wallet."
                        : "Your tokens will unlock according to the vesting schedule. Check your wallet for the stream NFT."}
                    </p>
                  </div>

                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={() => setShowSuccess(false)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Check another address
                  </button>
                </div>
              </Card>
            )}

            {/* Error State (Eligibility Check Failed) */}
            {isConnected && autoCheckEligibility && eligibility.error && (
              <Card title="Error">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-900 dark:text-red-100">{eligibility.error}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please refresh the page or try connecting a different wallet.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Additional Information Section */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card title="How It Works">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                      <svg
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Connect Wallet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your Web3 wallet to verify your eligibility
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                      <svg
                        className="h-6 w-6 text-purple-600 dark:text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Verify Eligibility
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We&apos;ll check if your address is eligible for the airdrop
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                      <svg
                        className="h-6 w-6 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Claim Tokens</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Claim your allocated tokens with a single transaction
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
