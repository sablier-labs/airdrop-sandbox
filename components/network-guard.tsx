"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { base } from "viem/chains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

type NetworkGuardProps = {
  children: React.ReactNode;
};

export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [_isDialogOpen, setIsDialogOpen] = useState(false);

  // If not connected, show children normally
  if (!isConnected) {
    return <>{children}</>;
  }

  // If on wrong chain, show error modal
  const isWrongNetwork = chainId !== base.id;

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: base.id });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <>
      {children}

      <Dialog open={isWrongNetwork} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Wrong Network</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              This application only works on the Base network. Please switch your wallet to Base to
              continue.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <div className="bg-muted rounded-lg p-3 text-sm">
              <div className="font-medium">Current Network:</div>
              <div className="text-muted-foreground">
                {chainId ? `Chain ID: ${chainId}` : "Unknown"}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-sm">
              <div className="font-medium text-blue-900 dark:text-blue-100">Required Network:</div>
              <div className="text-blue-700 dark:text-blue-300">Base (Chain ID: {base.id})</div>
            </div>

            <Button onClick={handleSwitchNetwork} disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Switch to Base Network
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
