"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 glass-heavy shadow-soft">
      <div className="container flex h-18 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full gradient-accent shadow-medium animate-glow" />
            <span className="text-xl font-bold tracking-tight">
              Sablier{" "}
              <span className="gradient-primary bg-clip-text text-transparent">Airdrop</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="https://docs.sablier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth hover:scale-105"
          >
            Documentation
          </Link>
          <Link
            href="https://app.sablier.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth hover:scale-105"
          >
            Sablier App
          </Link>
          <Link
            href="https://github.com/sablier-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth hover:scale-105"
          >
            GitHub
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
