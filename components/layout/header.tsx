"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500" />
            <span className="text-xl font-bold">
              Sablier <span className="text-primary">Airdrop</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="https://docs.sablier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="https://app.sablier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sablier App
          </Link>
          <Link
            href="https://github.com/sablier-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
