"use client";

import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import CampaignDetails from "@/components/airdrop/CampaignDetails";
import CampaignHeader from "@/components/airdrop/CampaignHeader";
import ClaimSidebar from "@/components/airdrop/ClaimSidebar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { formatTokenAmount, sapienAirdropCampaign } from "@/lib/config/airdrop";
import { useClaim, useEligibility } from "@/lib/hooks";

export default function AirdropPage() {
  // Wallet connection hooks
  const { isConnected, address: walletAddress } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Airdrop data hooks
  const { eligibility } = useEligibility(walletAddress);
  const { claim } = useClaim();

  // Use campaign data from config (hook data has different structure)
  const campaignData = sapienAirdropCampaign;
  const currentChainId = chainId || campaignData.defaultChainId;

  // Format amounts for display
  const totalAmount = formatTokenAmount(campaignData.distribution.totalAmount);

  // Connect wallet function
  const connectWallet = async () => {
    const connector = connectors[0]; // Use first available connector
    if (connector) {
      connect({ connector });
    }
  };

  // Check eligibility function
  const checkEligibility = async (_address: string) => {
    // The eligibility check is already handled by the useEligibility hook
    return eligibility
      ? {
          amount: eligibility.amount.toString(),
          status:
            eligibility.status === "eligible" ? ("eligible" as const) : ("not-eligible" as const),
          tokenSymbol: campaignData.token.symbol,
        }
      : { status: "not-eligible" as const };
  };

  // Claim tokens function
  const claimTokens = async () => {
    if (eligibility?.proof) {
      await claim(eligibility.proof);
    }
  };

  // Campaign header props
  const campaignHeaderProps = {
    chain: {
      id: currentChainId,
      name: currentChainId === 1 ? "Ethereum" : currentChainId === 8453 ? "Base" : "Sepolia",
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
      endDate: campaignData.timeline.claimEndDate,
      startDate: campaignData.timeline.claimStartDate,
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
    walletAddress,
  };

  // Header props
  const headerProps = {
    isConnected,
    onConnectWallet: connectWallet,
    onDisconnectWallet: () => disconnect(),
    walletAddress,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950">
      <Header {...headerProps} />

      <main className="container mx-auto px-4 py-8">
        {/* Campaign Header Section */}
        <div className="mb-8">
          <CampaignHeader {...campaignHeaderProps} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2">
            <CampaignDetails {...campaignDetailsProps} />
          </div>

          {/* Right Column - Claim Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ClaimSidebar {...claimSidebarProps} />
            </div>
          </div>
        </div>

        {/* Additional Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
