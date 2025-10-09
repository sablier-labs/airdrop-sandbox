"use client";

import { useAccount, useBalance, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "../ui/button";

/**
 * Truncate Ethereum address for display
 * @param address - Full Ethereum address
 * @returns Truncated address (0x1234...5678)
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Wallet information display component
 *
 * Shows:
 * - Connected wallet address (truncated)
 * - Current network
 * - Network switcher
 * - Wallet balance (optional)
 * - Disconnect button
 *
 * Only renders when wallet is connected
 */
export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  // Don't render if wallet not connected
  if (!isConnected || !address) {
    return null;
  }

  const currentChain = chains.find((chain) => chain.id === chainId);

  return (
    <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] p-4 space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Wallet</div>
        <div className="font-mono text-sm">{truncateAddress(address)}</div>
      </div>

      {balance && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</div>
          <div className="font-mono text-sm">
            {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Network</div>
        <div className="text-sm">{currentChain?.name ?? "Unknown Network"}</div>
      </div>

      {chains.length > 1 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Switch Network</div>
          <div className="flex flex-wrap gap-2">
            {chains.map((chain) => (
              <Button
                key={chain.id}
                onClick={() => switchChain({ chainId: chain.id })}
                variant={chain.id === chainId ? "primary" : "secondary"}
                size="sm"
                disabled={chain.id === chainId}
                aria-label={`Switch to ${chain.name}`}
                aria-pressed={chain.id === chainId}
              >
                {chain.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-black/[.08] dark:border-white/[.145]">
        <Button
          onClick={() => disconnect()}
          variant="secondary"
          size="sm"
          className="w-full"
          aria-label="Disconnect wallet"
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
