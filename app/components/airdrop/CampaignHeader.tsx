"use client";

import { Copy, ExternalLink, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { claimToasts } from "@/app/lib/utils/toast";
import Button from "../ui/Button";

export interface Chain {
  id: number;
  name: string;
  icon?: string;
}

export interface CampaignHeaderProps {
  title: string;
  description?: string;
  chain: Chain;
  totalAmount: string;
  tokenSymbol: string;
  onShare?: () => void;
}

export default function CampaignHeader({
  title,
  description,
  chain,
  totalAmount,
  tokenSymbol,
  onShare,
}: CampaignHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      claimToasts.copiedLink();
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        claimToasts.copiedLink();
      } catch (fallbackError) {
        console.error("Fallback copy also failed:", fallbackError);
      }
    }
  };

  const getChainIcon = (chainId: number): string => {
    // Map chain IDs to their respective logo paths
    const chainLogos: Record<number, string> = {
      1: "/logos/chains/ethereum.svg", // Ethereum
      10: "/logos/chains/base.svg", // Optimism - using base as placeholder
      56: "/logos/chains/ethereum.svg", // BSC - using ethereum as placeholder
      137: "/logos/chains/polygon.svg", // Polygon
      8453: "/logos/chains/base.svg", // Base
      42161: "/logos/chains/arbitrum.svg", // Arbitrum
    };
    return chainLogos[chainId] || "/logos/chains/ethereum.svg"; // Default to Ethereum
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent"></div>

      <div className="relative p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center gap-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border w-fit">
                <div className="h-4 w-4 shrink-0">
                  <Image
                    src={getChainIcon(chain.id)}
                    alt={chain.name}
                    width={16}
                    height={16}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-sm font-medium text-foreground">{chain.name}</span>
              </div>

              {/* Status indicator moved to mobile-friendly position */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active Campaign</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text leading-tight">
              {title}
            </h1>

            {description && (
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">{description}</p>
            )}

            {/* Desktop total amount inline */}
            <div className="hidden lg:block">
              <span className="text-sm text-muted-foreground">
                Total: {totalAmount} {tokenSymbol}
              </span>
            </div>
          </div>

          {/* Action buttons - responsive stack */}
          <div className="flex flex-col xs:flex-row sm:flex-row gap-3 shrink-0 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center justify-center space-x-2 min-w-0"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden xs:inline">{copied ? "Copied!" : "Copy Link"}</span>
              <span className="xs:hidden">{copied ? "✓" : "Copy"}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onShare}
              className="flex items-center justify-center space-x-2 min-w-0"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden xs:inline">Share</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://etherscan.io/address/${chain.id}`, "_blank")}
              className="flex items-center justify-center space-x-2 min-w-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden xs:inline">Explorer</span>
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet total amount card */}
        <div className="lg:hidden mt-6 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Campaign Amount</p>
            <p className="text-xl font-semibold text-foreground mt-1">
              {totalAmount} {tokenSymbol}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
