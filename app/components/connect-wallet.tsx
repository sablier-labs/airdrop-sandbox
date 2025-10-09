"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { tv } from "tailwind-variants";
import type { Address } from "viem";
import { shortenAddress } from "@/lib/utils/address";

/**
 * Custom styled wrapper for RainbowKit's ConnectButton
 * Provides a consistent design following the app's button variants
 *
 * CUSTOMIZATION POINT: Modify styles to match your brand
 */

const connectButtonStyles = tv({
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
  slots: {
    address: "font-mono text-sm",
    balance: "text-sm opacity-80",
    button:
      "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    chainButton:
      "cursor-pointer flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
    chainIcon: "h-4 w-4",
    chainName: "text-sm",
    connected: "flex items-center gap-2",
  },
  variants: {
    size: {
      lg: "h-12 px-6 text-base",
      md: "h-10 px-4 text-sm sm:text-base sm:h-12 sm:px-5",
      sm: "h-9 px-3 text-sm",
    },
    variant: {
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      primary: "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]",
      secondary:
        "border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent",
    },
  },
});

interface ConnectWalletProps {
  /** Visual style variant */
  variant?: "primary" | "secondary" | "ghost";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show account info when connected (default: true) */
  showBalance?: boolean;
  /** Show chain switcher when connected (default: true) */
  showChain?: boolean;
}

/**
 * Wallet connection button with custom styling
 *
 * @example
 * ```tsx
 * <ConnectWallet variant="primary" size="lg" />
 * ```
 */
export function ConnectWallet({
  variant = "primary",
  size = "md",
  showBalance = true,
  showChain = true,
}: ConnectWalletProps) {
  const styles = connectButtonStyles({ size, variant });

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Prevent hydration mismatch
        const ready = mounted && authenticationStatus !== "loading";

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
              // Not connected
              if (!account) {
                return (
                  <button onClick={openConnectModal} type="button" className={styles.button()}>
                    Connect Wallet
                  </button>
                );
              }

              // Wrong network
              if (chain?.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={styles.button({ variant: "secondary" })}
                  >
                    Wrong Network
                  </button>
                );
              }

              // Connected - show account info
              return (
                <div className={styles.connected()}>
                  {/* Chain switcher (optional) */}
                  {showChain && chain && (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className={styles.chainButton()}
                      title="Switch network"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        // biome-ignore lint/performance/noImgElement: chain icons from RainbowKit are dynamic
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          className={styles.chainIcon()}
                        />
                      )}
                      <span className={styles.chainName()}>{chain.name}</span>
                    </button>
                  )}

                  {/* Account button */}
                  <button onClick={openAccountModal} type="button" className={styles.button()}>
                    <div className="flex items-center gap-2">
                      {showBalance && account.displayBalance && (
                        <span className={styles.balance()}>{account.displayBalance}</span>
                      )}
                      <span className={styles.address()}>
                        {shortenAddress(account.address as Address)}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
