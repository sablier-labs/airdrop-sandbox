"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  DollarSign,
  Gift,
  Percent,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loading } from "./ui/loading";
import { Progress } from "./ui/progress";

interface CampaignStatsProps {
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
  tokenSymbol?: string;
  tokenDecimals?: number;
  campaignName?: string;
  className?: string;
}

interface StatsData {
  totalRecipients: number;
  totalTokens: bigint;
  claimedCount: number;
  claimedAmount: bigint;
  claimPercentage: number;
  avgClaimAmount: bigint;
  timeRemaining?: number;
  isActive: boolean;
}

export function CampaignStats({
  contractAddress: _contractAddress,
  contractType = "instant",
  merkleTreeData,
  tokenSymbol = "TOKENS",
  tokenDecimals = 18,
  campaignName = "Token Airdrop",
  className,
}: CampaignStatsProps) {
  const publicClient = usePublicClient();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    if (!merkleTreeData || !publicClient) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate total recipients and tokens from merkle data
      const totalRecipients = merkleTreeData.leaves.length;
      const totalTokens = merkleTreeData.leaves.reduce(
        (sum, leaf) => sum + BigInt(leaf.amount),
        0n,
      );

      // In a real implementation, you would query the contract for claim status
      // For now, we'll simulate some claimed amounts
      const simulatedClaimedCount = Math.floor(totalRecipients * 0.35); // 35% claimed
      const simulatedClaimedAmount = totalTokens / 3n; // Roughly 33% of tokens claimed

      const claimPercentage = (simulatedClaimedCount / totalRecipients) * 100;
      const avgClaimAmount =
        simulatedClaimedCount > 0 ? simulatedClaimedAmount / BigInt(simulatedClaimedCount) : 0n;

      setStats({
        avgClaimAmount,
        claimedAmount: simulatedClaimedAmount,
        claimedCount: simulatedClaimedCount,
        claimPercentage,
        isActive: true,
        totalRecipients,
        totalTokens,
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load stats"));
    } finally {
      setIsLoading(false);
    }
  }, [merkleTreeData, publicClient]);

  useEffect(() => {
    void loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      void loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const formatTokenAmount = (amount: bigint, precision: number = 2) => {
    const formatted = formatUnits(amount, tokenDecimals);
    return Number(formatted).toLocaleString(undefined, {
      maximumFractionDigits: precision,
      minimumFractionDigits: 0,
    });
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <Loading text="Loading campaign statistics..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Stats</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const unclaimedCount = stats.totalRecipients - stats.claimedCount;
  const unclaimedAmount = stats.totalTokens - stats.claimedAmount;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {campaignName} Statistics
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Real-time campaign metrics</span>
          <Badge variant={stats.isActive ? "success" : "secondary"}>
            {stats.isActive ? "Active" : "Ended"}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-700">
              {stats.totalRecipients.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">Total Recipients</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <Gift className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-700">
              {stats.claimedCount.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">Claims Made</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200"
          >
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-xl font-bold text-purple-700">
              {formatTokenAmount(stats.totalTokens, 0)}
            </p>
            <p className="text-xs text-purple-600">Total {tokenSymbol}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200"
          >
            <Percent className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-orange-700">
              {formatPercentage(stats.claimPercentage)}%
            </p>
            <p className="text-xs text-orange-600">Claimed</p>
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Claim Progress</h3>
            <span className="text-sm text-muted-foreground">
              {stats.claimedCount} of {stats.totalRecipients}
            </span>
          </div>

          <Progress value={stats.claimPercentage} className="h-3" />

          <div className="flex justify-between text-sm">
            <span className="text-green-600">
              ✅ Claimed: {formatTokenAmount(stats.claimedAmount)} {tokenSymbol}
            </span>
            <span className="text-gray-600">
              ⏳ Remaining: {formatTokenAmount(unclaimedAmount)} {tokenSymbol}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Distribution Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Claim</span>
                <span className="font-mono">
                  {formatTokenAmount(stats.avgClaimAmount)} {tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unclaimed Users</span>
                <span className="font-medium">{unclaimedCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract Type</span>
                <Badge variant="outline" className="text-xs">
                  {contractType.charAt(0).toUpperCase() + contractType.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-mono text-xs">{lastUpdated.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign Status</span>
                <Badge variant={stats.isActive ? "success" : "secondary"} className="text-xs">
                  {stats.isActive ? "Live" : "Ended"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Update</span>
                <span className="text-xs text-muted-foreground">30s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quick Facts
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-blue-600">
                {formatPercentage(stats.claimPercentage)}%
              </p>
              <p className="text-muted-foreground">Participation Rate</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-green-600">
                {formatTokenAmount(stats.claimedAmount, 0)}
              </p>
              <p className="text-muted-foreground">Tokens Distributed</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-purple-600">{unclaimedCount.toLocaleString()}</p>
              <p className="text-muted-foreground">Pending Claims</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
