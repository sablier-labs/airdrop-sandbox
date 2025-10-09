"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { tv } from "tailwind-variants";

/**
 * Button variant styles for wallet connection
 */
const connectButtonVariants = tv({
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
  slots: {
    button:
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    container: "flex items-center gap-3",
  },
  variants: {
    size: {
      lg: {
        button: "h-12 px-6 text-base",
      },
      md: {
        button: "h-10 px-4 text-sm sm:text-base sm:h-12 sm:px-5",
      },
      sm: {
        button: "h-9 px-3 text-sm",
      },
    },
    variant: {
      primary: {
        button: "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]",
      },
      secondary: {
        button:
          "border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent",
      },
    },
  },
});

interface ConnectButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  label?: string;
}

/**
 * Custom styled RainbowKit connect button
 *
 * Features:
 * - Sablier-branded styling
 * - Responsive design
 * - Accessibility support
 * - Customizable size and variant
 *
 * Uses RainbowKit's ConnectButton.Custom for full style control
 */
export function ConnectButton({
  size = "md",
  variant = "primary",
  label = "Connect Wallet",
}: ConnectButtonProps) {
  const styles = connectButtonVariants({ size, variant });

  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
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
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={styles.button()}
                    aria-label={label}
                  >
                    {label}
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={styles.button()}
                    aria-label="Wrong network - click to switch"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className={styles.container()}>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={styles.button()}
                    aria-label={`Connected to ${chain.name}`}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <Image
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={styles.button()}
                    aria-label={`Account: ${account.displayName}`}
                  >
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
