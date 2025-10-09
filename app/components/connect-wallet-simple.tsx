"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Simple wallet connection using default RainbowKit button
 * Use this if you prefer RainbowKit's default styling
 *
 * CUSTOMIZATION POINT: Or use ConnectWallet for custom styling
 */
export function ConnectWalletSimple() {
  return <ConnectButton />;
}
