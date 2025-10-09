"use client";

import Link from "next/link";

// CUSTOMIZE: Footer with Sablier branding
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-sablier-bg-light bg-sablier-bg-dark">
      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-sablier-text-primary">Sablier Airdrops</h3>
            <p className="text-sm text-sablier-text-muted">Powered by Sablier Protocol</p>
          </div>

          {/* Documentation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-sablier-text-primary">Documentation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://docs.sablier.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.sablier.com/contracts/v2/reference/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  Contracts
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/sablier-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-sablier-text-primary">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-sablier-text-primary">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://twitter.com/Sablier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://discord.gg/sablier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sablier-text-muted transition-colors hover:text-sablier-orange-start cursor-pointer"
                >
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-sablier-bg-light pt-8">
          <p className="text-center text-sm text-sablier-text-muted">
            © {currentYear} Sablier Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
