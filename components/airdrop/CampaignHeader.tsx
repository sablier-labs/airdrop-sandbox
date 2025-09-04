"use client";

import { Copy, ExternalLink, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
    } catch (error) {
      console.error("Failed to copy link:", error);
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

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
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
            </div>

            <h1 className="text-3xl md:text-4xl font-bold gradient-text leading-tight">{title}</h1>

            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
            )}

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active Campaign</span>
              </div>
              <div className="hidden md:block h-4 border-l border-border"></div>
              <span className="hidden md:inline">
                Total: {totalAmount} {tokenSymbol}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </Button>

            <Button variant="secondary" onClick={onShare} className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.open(`https://etherscan.io/address/${chain.id}`, "_blank")}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Explorer</span>
            </Button>
          </div>
        </div>

        {/* Mobile total amount */}
        <div className="md:hidden mt-6 p-4 rounded-lg bg-muted/30 border border-border">
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
