"use client";

import { ExternalLink, Menu, Wallet, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Button from "../ui/Button";
import Modal, { ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from "../ui/Modal";

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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 md:h-10 md:w-10 shrink-0">
              <Image
                src="/logos/sablier-logo.svg"
                alt="Sablier"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
            <span className="font-bold text-lg md:text-xl gradient-text">Sablier</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="/airdrops"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Airdrops
            </a>
            <a
              href="https://docs.sablier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://app.sablier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
            >
              <span>App</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <Button
              variant={isConnected ? "secondary" : "primary"}
              onClick={handleWalletClick}
              className="hidden md:flex"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnected ? formatAddress(walletAddress || "") : "Connect Wallet"}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
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
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
              <p className="font-mono text-sm">{walletAddress}</p>
            </div>
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                onDisconnectWallet?.();
                setIsWalletModalOpen(false);
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
