import { ClaimCard } from "@/components/claim-card";
import { ConnectWallet } from "@/components/connect-wallet";

/**
 * Airdrop Claim Page
 *
 * CUSTOMIZATION POINT: Modify campaign details, branding, and messaging
 *
 * This is the main landing page where users claim their airdrop tokens.
 * Replace campaign details below with your specific airdrop information.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            {/* CUSTOMIZATION POINT: Replace with your logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold">Sablier Airdrops</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Token Distribution</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <ConnectWallet variant="primary" size="md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          {/* CUSTOMIZATION POINT: Campaign title and description */}
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Claim Your Airdrop</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Connect your wallet to check eligibility and claim your tokens. This airdrop is
            distributed to early supporters and community members.
          </p>
        </div>

        {/* Claim Card */}
        <div className="mx-auto max-w-lg">
          <ClaimCard
            tokenSymbol="TOKEN"
            tokenDecimals={18}
            title="Community Airdrop"
            description="Thank you for being an early supporter. Connect your wallet to claim your tokens."
          />
        </div>

        {/* Campaign Info */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* CUSTOMIZATION POINT: Campaign statistics and info */}

            {/* Total Recipients */}
            <div className="rounded-xl border bg-white p-6 text-center dark:bg-gray-900">
              <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">---</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Recipients
              </div>
            </div>

            {/* Total Amount */}
            <div className="rounded-xl border bg-white p-6 text-center dark:bg-gray-900">
              <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">---</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Allocated
              </div>
            </div>

            {/* Claims End */}
            <div className="rounded-xl border bg-white p-6 text-center dark:bg-gray-900">
              <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">---</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Claims End</div>
            </div>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-xl border bg-white p-8 dark:bg-gray-900">
            {/* CUSTOMIZATION POINT: FAQ, eligibility criteria, or additional info */}
            <h3 className="mb-4 text-xl font-bold">How It Works</h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div>
                <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  1. Connect Your Wallet
                </p>
                <p className="text-sm">Use MetaMask or Rabby to connect to the application.</p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  2. Check Eligibility
                </p>
                <p className="text-sm">
                  Your address will be checked against the airdrop recipients list.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  3. Claim Tokens
                </p>
                <p className="text-sm">
                  If eligible, click the claim button and approve the transaction.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  4. Receive Tokens
                </p>
                <p className="text-sm">
                  Tokens will be sent to your wallet after the transaction confirms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            {/* CUSTOMIZATION POINT: Add your links */}
            <a
              href="https://docs.sablier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Documentation
            </a>
            <a
              href="https://github.com/sablier-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              GitHub
            </a>
            <a
              href="https://discord.gg/sablier"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Support
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-600">
            Powered by{" "}
            <a
              href="https://sablier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Sablier
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
