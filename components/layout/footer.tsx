import { ExternalLink, Github, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500" />
              <span className="font-semibold">Sablier Protocol</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The leading protocol for real-time finance and token streaming on Ethereum.
            </p>
          </div>

          {/* Protocol Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Protocol</h3>
            <div className="space-y-2">
              <Link
                href="https://app.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sablier App
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://docs.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://github.com/sablier-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
                <Github className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <div className="space-y-2">
              <Link
                href="https://docs.sablier.com/concepts/what-is-sablier"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                What is Sablier?
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://docs.sablier.com/api/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                API Reference
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://github.com/sablier-labs/examples"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Examples
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold">Community</h3>
            <div className="space-y-2">
              <Link
                href="https://discord.gg/sablier"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Discord
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://twitter.com/sablier"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
                <Twitter className="h-3 w-3" />
              </Link>
              <Link
                href="https://mirror.xyz/sablier.eth"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Mirror
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Sablier Protocol. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://docs.sablier.com/concepts/governance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Governance
            </Link>
            <Link
              href="https://github.com/sablier-labs/audits"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
