"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import CampaignDetails from "@/app/components/airdrop/CampaignDetails";
import CampaignHeader from "@/app/components/airdrop/CampaignHeader";
import ClaimSidebar from "@/app/components/airdrop/ClaimSidebar";
import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import { DemoBanner } from "@/app/components/ui/DemoBanner";
import { formatTokenAmount, getAirdropConfig } from "@/app/lib/config/airdrop";
import { useClaim, useEligibility } from "@/app/lib/hooks";
import {
  checkDemoEligibility,
  getDemoBannerProps,
  isDemoMode,
  mockClaim,
} from "@/app/lib/utils/demo-mode";

export default function AirdropPage() {
  // Wallet connection hooks
  const { isConnected, address: walletAddress } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Airdrop data hooks
  const { eligibility } = useEligibility(walletAddress);
  const { claim } = useClaim();

  // State for async configuration loading
  const [demoMode, setDemoMode] = useState(false);
  const [demoBannerProps, setDemoBannerProps] = useState<null | {
    message: string;
    details: string;
    type: "info";
  }>(null);
  const [campaignData, setCampaignData] = useState<{
    name: string;
    description: string;
    token: { symbol: string; decimals: number };
    distribution: {
      totalAmount: string;
      totalRecipients: number;
      claimStartDate: Date;
      claimEndDate: Date;
    };
  } | null>(null);

  const currentChainId = chainId || 1; // Default to mainnet

  // Load configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Load airdrop configuration
        const config = await getAirdropConfig();
        setCampaignData({
          description: config.campaign.description,
          distribution: config.distribution,
          name: config.campaign.name,
          token: config.token,
        });

        // Load demo mode configuration
        const isDemoModeEnabled = await isDemoMode();
        setDemoMode(isDemoModeEnabled);

        if (isDemoModeEnabled) {
          const bannerProps = await getDemoBannerProps();
          setDemoBannerProps(bannerProps);
        }
      } catch (error) {
        console.error("Failed to load configuration:", error);
        setDemoMode(false);
        setDemoBannerProps(null);
      }
    };

    void loadConfig();
  }, []);

  // Format amounts for display - only if data is loaded
  const totalAmount = campaignData
    ? formatTokenAmount(BigInt(campaignData.distribution.totalAmount))
    : "0";

  // Connect wallet function
  const connectWallet = async () => {
    const connector = connectors[0]; // Use first available connector
    if (connector) {
      connect({ connector });
    }
  };

  // Check eligibility function
  const checkEligibility = async (address: string) => {
    // Use demo mode eligibility check if demo is enabled
    if (demoMode) {
      return await checkDemoEligibility(address as `0x${string}`);
    }

    // The eligibility check is already handled by the useEligibility hook
    return eligibility
      ? {
          amount: eligibility.amount.toString(),
          status:
            eligibility.status === "eligible" ? ("eligible" as const) : ("not-eligible" as const),
          tokenSymbol: campaignData?.token.symbol || "TOKEN",
        }
      : { status: "not-eligible" as const };
  };

  // Claim tokens function
  const claimTokens = async (): Promise<void> => {
    // Use demo mode claim if demo is enabled
    if (demoMode && eligibility?.proof) {
      const result = await mockClaim(eligibility.proof);
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      return;
    }

    if (eligibility?.proof) {
      await claim(eligibility.proof);
    }
  };

  // Show loading state if campaign data is not loaded yet
  if (!campaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading campaign data...</div>
      </div>
    );
  }

  // Campaign header props
  const campaignHeaderProps = {
    chain: {
      id: currentChainId,
      name: "Base",
    },
    description: campaignData.description,
    title: campaignData.name,
    tokenSymbol: campaignData.token.symbol,
    totalAmount,
  };

  // Campaign details props
  const campaignDetailsProps = {
    stats: {
      claimedAmount: "485,234", // This would come from contract data
      claimedRecipients: 2156, // This would come from contract data
      distributionType: "merkle" as const,
      endDate: campaignData.distribution.claimEndDate,
      startDate: campaignData.distribution.claimStartDate,
      tokenSymbol: campaignData.token.symbol,
      totalAmount,
      totalRecipients: campaignData.distribution.totalRecipients,
    },
  };

  // Claim sidebar props
  const claimSidebarProps = {
    isConnected,
    onCheckEligibility: checkEligibility,
    onClaim: claimTokens,
    onConnectWallet: connectWallet,
    tokenSymbol: campaignData.token.symbol,
    walletAddress: walletAddress || undefined,
  };

  // Header props
  const headerProps = {
    isConnected,
    onConnectWallet: connectWallet,
    onDisconnectWallet: () => disconnect(),
    walletAddress,
  };

  // Demo banner props are loaded in useEffect

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950">
      <Header {...headerProps} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Demo Mode Banner */}
        {demoBannerProps && (
          <DemoBanner
            message={demoBannerProps.message}
            details={demoBannerProps.details}
            type={demoBannerProps.type}
          />
        )}

        {/* Campaign Header Section */}
        <div className="mb-6 sm:mb-8">
          <CampaignHeader {...campaignHeaderProps} />
        </div>

        {/* Main Content Grid - Mobile first, responsive layout */}
        <div className="grid gap-6 sm:gap-8 xl:grid-cols-3 xl:gap-12">
          {/* Left Column - Campaign Details */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <CampaignDetails {...campaignDetailsProps} />
          </div>

          {/* Right Column - Claim Sidebar - Priority on mobile */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="xl:sticky xl:top-8">
              <ClaimSidebar {...claimSidebarProps} />
            </div>
          </div>
        </div>

        {/* Additional Background Decorations - Responsive sizes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-2xl sm:blur-3xl" />
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl sm:blur-3xl" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
