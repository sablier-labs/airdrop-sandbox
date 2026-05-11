"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Address } from "viem";
import { shortenAddress } from "@/lib/utils/address";
import { connectWalletVariants } from "./ConnectWallet.variants";

type ConnectWalletProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  showBalance?: boolean;
  showChain?: boolean;
};

export function ConnectWallet({
  variant = "primary",
  size = "md",
  showBalance = true,
  showChain = true,
}: ConnectWalletProps) {
  const styles = connectWalletVariants({ size, variant });

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
        const ready = mounted && authenticationStatus !== "loading";
        const hiddenProps = !ready
          ? ({
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            } as const)
          : {};

        if (!account) {
          return (
            <div {...hiddenProps}>
              <button className={styles.button()} onClick={openConnectModal} type="button">
                Connect Wallet
              </button>
            </div>
          );
        }

        if (chain?.unsupported) {
          return (
            <div {...hiddenProps}>
              <button
                className={styles.button({ variant: "secondary" })}
                onClick={openChainModal}
                type="button"
              >
                Wrong Network
              </button>
            </div>
          );
        }

        return (
          <div {...hiddenProps}>
            <div className={styles.connected()}>
              {showChain && chain && (
                <button
                  className={styles.chainButton()}
                  onClick={openChainModal}
                  title="Switch network"
                  type="button"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    // biome-ignore lint/performance/noImgElement: chain icons from RainbowKit are dynamic
                    <img
                      alt={chain.name ?? "Chain icon"}
                      className={styles.chainIcon()}
                      src={chain.iconUrl}
                    />
                  )}
                  <span className={styles.chainName()}>{chain.name}</span>
                </button>
              )}

              <button className={styles.button()} onClick={openAccountModal} type="button">
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
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
