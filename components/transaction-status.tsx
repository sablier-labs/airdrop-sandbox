"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Hash, TransactionReceipt } from "viem";
import { base } from "viem/chains";
import { useChainId, useWaitForTransactionReceipt } from "wagmi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

type TransactionStatus = "pending" | "confirmed" | "failed" | "replaced";

type TransactionStatusProps = {
  txHash?: Hash;
  streamId?: bigint;
  onStatusChange?: (status: TransactionStatus, receipt?: TransactionReceipt) => void;
  showStreamLink?: boolean;
  title?: string;
  className?: string;
};

export function TransactionStatus({
  txHash,
  streamId,
  onStatusChange,
  showStreamLink = true,
  title = "Transaction Status",
  className,
}: TransactionStatusProps) {
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const chainId = useChainId();

  const {
    data: receipt,
    error,
    isLoading,
    status,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    pollingInterval: 1000,
  });

  // Progress animation and timer
  useEffect(() => {
    if (!txHash || status === "success" || status === "error") {
      return;
    }

    if (!startTime) {
      setStartTime(new Date());
    }

    const interval = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setTimeElapsed(elapsed);

        // Simulate progress based on time (caps at 90% until confirmed)
        const simulatedProgress = Math.min(90, (elapsed / 60) * 100);
        setProgress(simulatedProgress);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [txHash, status, startTime]);

  // Complete progress when transaction is confirmed
  useEffect(() => {
    if (status === "success") {
      setProgress(100);
      onStatusChange?.("confirmed", receipt);
    } else if (status === "error") {
      onStatusChange?.("failed");
    }
  }, [status, receipt, onStatusChange]);

  const getStatusInfo = () => {
    if (!txHash) {
      return {
        color: "gray",
        icon: Activity,
        message: "No transaction to track",
        status: "idle" as const,
      };
    }

    if (isLoading) {
      return {
        color: "blue",
        icon: Loader2,
        message: "Waiting for confirmation...",
        status: "pending" as const,
      };
    }

    if (status === "success") {
      return {
        color: "green",
        icon: CheckCircle,
        message: "Transaction confirmed!",
        status: "confirmed" as const,
      };
    }

    if (status === "error") {
      return {
        color: "red",
        icon: XCircle,
        message: "Transaction failed",
        status: "failed" as const,
      };
    }

    return {
      color: "gray",
      icon: Clock,
      message: "Ready to track",
      status: "idle" as const,
    };
  };

  const statusInfo = getStatusInfo();

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getExplorerUrl = (hash: Hash, chainId?: number) => {
    // Use viem chain data for Base chain, fallback to Etherscan for others
    if (chainId === base.id) {
      return `${base.blockExplorers.default.url}/tx/${hash}`;
    }

    // Default fallback to Ethereum mainnet
    return `https://etherscan.io/tx/${hash}`;
  };

  if (!txHash) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: isLoading ? Infinity : 0,
            }}
          >
            <statusInfo.icon
              className={`h-5 w-5 ${
                statusInfo.color === "green"
                  ? "text-green-600"
                  : statusInfo.color === "red"
                    ? "text-red-600"
                    : statusInfo.color === "blue"
                      ? "text-blue-600"
                      : "text-gray-500"
              }`}
            />
          </motion.div>
          {title}
        </CardTitle>
        <CardDescription>Real-time transaction monitoring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge and Message */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Badge
              variant={
                statusInfo.status === "confirmed"
                  ? "success"
                  : statusInfo.status === "failed"
                    ? "destructive"
                    : statusInfo.status === "pending"
                      ? "default"
                      : "outline"
              }
            >
              {statusInfo.status === "pending" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
            </Badge>
            <p className="text-sm text-muted-foreground">{statusInfo.message}</p>
          </div>

          {timeElapsed > 0 && isLoading && (
            <div className="text-right">
              <p className="text-sm font-medium">{formatTime(timeElapsed)}</p>
              <p className="text-xs text-muted-foreground">elapsed</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Transaction Hash */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Transaction Hash</p>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="flex-1 text-xs font-mono truncate">{txHash}</code>
            <Button asChild variant="ghost" size="sm">
              <a
                href={getExplorerUrl(txHash, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Block Information */}
        {receipt && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Block Details</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Block Number</p>
                <p className="font-mono">{receipt.blockNumber.toString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gas Used</p>
                <p className="font-mono">{receipt.gasUsed.toString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stream Link */}
        {showStreamLink && streamId && status === "success" && (
          <div className="pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <a
                href={`https://app.sablier.com/stream/${streamId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                View Stream on Sablier
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}

        {/* Error Details */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Transaction Error</p>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
          </div>
        )}

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-2"
            >
              <p className="text-sm text-muted-foreground">
                {timeElapsed < 30
                  ? "⏳ Processing transaction..."
                  : timeElapsed < 60
                    ? "🔄 Waiting for network confirmation..."
                    : "⏰ Transaction taking longer than usual..."}
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-2"
            >
              <p className="text-sm text-green-600">
                🎉 Your airdrop claim has been successfully processed!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
