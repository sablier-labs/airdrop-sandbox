"use client";

import { Copy, ExternalLink, Menu, Wallet, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Button from "@/app/components/ui/Button";
import Modal, {
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/app/components/ui/Modal";
import { claimToasts, walletToasts } from "@/app/lib/utils/toast";

export interface HeaderProps {
  walletAddress?: string;
  isConnected?: boolean;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
}

export default function Header({
  walletAddress,
  isConnected = false,
  onConnectWallet,
  onDisconnectWallet,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletClick = () => {
    if (isConnected) {
      setIsWalletModalOpen(true);
    } else {
      onConnectWallet?.();
    }
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        claimToasts.copiedAddress();
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0">
              <Image
                src="/logos/sablier-logo.svg"
                alt="Sablier"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
            <span className="font-bold text-base sm:text-lg md:text-xl gradient-text truncate">
              Sablier
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="/airdrops"
              className="text-sm font-medium text-muted-foreground link-hover micro-interaction"
            >
              Airdrops
            </a>
            <a
              href="https://docs.sablier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground link-hover micro-interaction"
            >
              Documentation
            </a>
            <a
              href="https://app.sablier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground link-hover micro-interaction flex items-center space-x-1 group"
            >
              <span>App</span>
              <ExternalLink className="h-3 w-3 transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-0.5" />
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Button
              variant={isConnected ? "secondary" : "primary"}
              size="sm"
              onClick={handleWalletClick}
              className="hidden md:flex shrink-0"
            >
              <Wallet className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">
                {isConnected ? formatAddress(walletAddress || "") : "Connect Wallet"}
              </span>
              <span className="lg:hidden">
                {isConnected ? formatAddress(walletAddress || "") : "Connect"}
              </span>
            </Button>

            {/* Quick connect button for mobile */}
            {!isConnected && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleWalletClick}
                className="md:hidden shrink-0"
              >
                <Wallet className="h-4 w-4" />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden shrink-0"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
            <nav className="container px-4 py-4 space-y-4">
              <a
                href="/airdrops"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Airdrops
              </a>
              <a
                href="https://docs.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </a>
              <a
                href="https://app.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                App ↗
              </a>
              <Button
                variant={isConnected ? "secondary" : "primary"}
                onClick={handleWalletClick}
                fullWidth
                className="mt-4"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnected ? formatAddress(walletAddress || "") : "Connect Wallet"}
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Wallet Modal */}
      <Modal open={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} size="sm">
        <ModalCloseButton onClose={() => setIsWalletModalOpen(false)} />
        <ModalHeader>
          <ModalTitle>Wallet Connected</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <button
              type="button"
              className="p-3 rounded-lg bg-muted/50 border border-border group hover:bg-muted/70 transition-colors cursor-pointer w-full text-left"
              onClick={handleCopyAddress}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
                  <p className="font-mono text-sm group-hover:text-primary transition-colors">
                    {walletAddress}
                  </p>
                </div>
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to copy
              </p>
            </button>
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                onDisconnectWallet?.();
                setIsWalletModalOpen(false);
                walletToasts.disconnected();
              }}
            >
              Disconnect Wallet
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
