"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, Wallet } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface WalletConnectProps {
  title?: string;
  description?: string;
  showAccountInfo?: boolean;
  variant?: "card" | "button" | "inline";
  className?: string;
}

export function WalletConnect({
  title = "Connect Your Wallet",
  description = "Connect your wallet to check eligibility and claim tokens",
  showAccountInfo = true,
  variant = "card",
  className,
}: WalletConnectProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (variant === "inline") {
    return (
      <div className={className}>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className={className}>
        <ConnectButton.Custom>
          {({ account, chain, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button onClick={openConnectModal} size="lg">
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button onClick={openChainModal} variant="destructive" size="lg">
                        Wrong network
                      </Button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={openChainModal}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {chain.hasIcon && (
                          <div
                            className="h-4 w-4"
                            style={{
                              background: chain.iconUrl ? `url(${chain.iconUrl})` : undefined,
                              backgroundSize: "cover",
                            }}
                          />
                        )}
                        {chain.name}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            {account.displayName}
                            <ChevronDown className="ml-2 h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Account Details</DialogTitle>
                            <DialogDescription>Your connected wallet information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium">Wallet</p>
                              <p className="text-sm text-muted-foreground">{account.displayName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Address</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {account.address}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Network</p>
                              <p className="text-sm text-muted-foreground">{chain.name}</p>
                            </div>
                            <Button
                              onClick={() => disconnect()}
                              variant="outline"
                              className="w-full"
                            >
                              Disconnect
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  // Card variant
  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  if (showAccountInfo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Wallet Connected
            </span>
            <ConnectButton chainStatus="icon" showBalance={false} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{address}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
