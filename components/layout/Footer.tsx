import { ExternalLink, Github, MessageCircle, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-bold gradient-text">Sablier</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The protocol for real-time finance on Ethereum
            </p>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Products</h3>
            <nav className="space-y-2">
              <a
                href="https://app.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <span>Sablier App</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="/airdrops"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Airdrops
              </a>
              <a
                href="https://docs.sablier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <span>Documentation</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </nav>
          </div>

          {/* Developers */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Developers</h3>
            <nav className="space-y-2">
              <a
                href="https://github.com/sablier-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://docs.sablier.com/contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <span>Smart Contracts</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://docs.sablier.com/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
              >
                <span>API</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </nav>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Community</h3>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/sablier"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/sablier-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/sablier"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-muted-foreground">© 2024 Sablier Labs. All rights reserved.</p>
          <div className="flex space-x-6 text-xs">
            <a
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
