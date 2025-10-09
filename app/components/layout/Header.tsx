"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

// CUSTOMIZE: Header with Sablier branding
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-sablier-bg-light bg-sablier-bg-darkest/95 backdrop-blur supports-[backdrop-filter]:bg-sablier-bg-darkest/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <SablierLogo />
            <span className="hidden font-semibold text-sablier-text-primary sm:inline-block group-hover:sablier-text-gradient-orange transition-all">
              Sablier Airdrops
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}

// CUSTOMIZE: Sablier hourglass logo with brand gradient
function SablierLogo() {
  const gradientId = `logo-orange-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform group-hover:scale-110"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ff7300", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#ffb800", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Hourglass top */}
      <path
        d="M28 8C28 5.79086 26.2091 4 24 4H16C13.7909 4 12 5.79086 12 8V12C12 14.2091 13.7909 16 16 16H20C22.2091 16 24 14.2091 24 12V8Z"
        fill={`url(#${gradientId})`}
      />
      {/* Hourglass bottom */}
      <path
        d="M28 32C28 34.2091 26.2091 36 24 36H16C13.7909 36 12 34.2091 12 32V28C12 25.7909 13.7909 24 16 24H20C22.2091 24 24 25.7909 24 28V32Z"
        fill={`url(#${gradientId})`}
      />
      {/* Connecting lines */}
      <path
        d="M16 16L24 24M24 16L16 24"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx="20" cy="20" r="3" fill={`url(#${gradientId})`} />
    </svg>
  );
}
