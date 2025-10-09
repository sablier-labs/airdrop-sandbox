# Customization Guide

Complete guide for customizing the Sablier Airdrops Sandbox for your token distribution campaign.

## Table of Contents

- [Overview](#overview)
- [Quick Start Guide](#quick-start-guide)
- [Campaign Configuration](#campaign-configuration)
- [Recipient Data Setup](#recipient-data-setup)
- [Merkle Tree Generation](#merkle-tree-generation)
- [Styling and Branding](#styling-and-branding)
- [UI Components](#ui-components)
- [Environment Variables](#environment-variables)
- [Deployment Guide](#deployment-guide)
- [Testing Checklist](#testing-checklist)
- [Advanced Customization](#advanced-customization)

## Overview

### What This Sandbox Does

This is a production-ready Next.js application for creating custom airdrop claim interfaces using Sablier v2.0 Airdrops
contracts. It provides:

- Wallet connection with RainbowKit
- Merkle proof-based eligibility verification
- On-chain claim transactions
- Support for instant, linear, and tranched distributions
- Customizable styling and branding

### What You Can Customize

- **Campaign Settings**: Contract addresses, token details, claim periods
- **Recipient List**: Who receives tokens and how much
- **Visual Design**: Colors, logos, component styles
- **User Experience**: Claim flow, messaging, auto-check behavior
- **Advanced Features**: Multi-campaign support, custom eligibility logic, analytics

### Before You Begin

You'll need:

1. A deployed Sablier Merkle distribution contract (MerkleInstant, MerkleLinear, or MerkleTranched)
2. A list of recipient addresses and their token allocations
3. Your token's contract address and details (symbol, decimals)
4. A WalletConnect Project ID (free at [cloud.walletconnect.com](https://cloud.walletconnect.com/))

## Quick Start Guide

### 1. Install Dependencies

```bash
bun install
bun husky
```

### 2. Configure Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Update Campaign Configuration

Edit `app/lib/config/campaign.ts` with your campaign details.

### 4. Add Your Recipients

Update `app/lib/merkle/data.ts` with your recipient list.

### 5. Generate Merkle Tree

Run the tree generation script to get your merkle root.

### 6. Deploy Contract

Deploy your Merkle contract with the generated root.

### 7. Update Contract Address

Add your deployed contract address to the campaign config.

### 8. Test Locally

```bash
just dev
```

### 9. Deploy to Production

Deploy to Vercel or your preferred hosting platform.

## Campaign Configuration

All campaign settings are in **`app/lib/config/campaign.ts`**.

### Essential Settings

```typescript
export const defaultCampaignConfig: CampaignConfig = {
  // Campaign name (displayed in UI)
  campaignName: "Example Airdrop Campaign",

  // Network (use chain.id from viem/chains)
  chainId: base.id, // 8453 for Base mainnet

  // Your deployed Merkle contract address
  contractAddress: getAddress("0xYOUR_CONTRACT_ADDRESS"),

  // Distribution type
  distributionType: "instant", // "instant" | "linear" | "tranched"

  // Expiration timestamp (Unix seconds)
  expiresAt: 1739577600, // Calculate: Math.floor(Date.now() / 1000) + days * 24 * 60 * 60

  // Claim fee (in wei, 0n for free)
  claimFee: 0n,

  // Token being distributed
  tokenAddress: getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"), // USDC on Base
  tokenSymbol: "USDC",
  tokenDecimals: 6,

  // Total allocation (in smallest unit)
  totalAmount: 10_000_000_000n, // 10,000 USDC (10000 * 10^6)

  // Merkle root (generated from recipient list)
  merkleRoot: "0xYOUR_MERKLE_ROOT",
};
```

### Distribution Types

**Instant Distribution** (`"instant"`):

- Tokens are immediately claimable and fully available
- Use Sablier's `MerkleInstant` contract
- No unlock schedule needed

**Linear Distribution** (`"linear"`):

- Tokens unlock linearly over time
- Use Sablier's `MerkleLinear` contract
- Requires `unlockSchedule` configuration:

```typescript
unlockSchedule: {
  startTime: 1704067200, // Unix timestamp when vesting starts
  duration: 31536000,    // Duration in seconds (e.g., 365 days)
}
```

**Tranched Distribution** (`"tranched"`):

- Tokens unlock in discrete chunks at specific times
- Use Sablier's `MerkleTranched` contract
- Requires tranche configuration:

```typescript
unlockSchedule: {
  tranches: [
    { timestamp: 1704067200, percentage: 25 }, // 25% at timestamp
    { timestamp: 1711929600, percentage: 25 }, // Another 25% later
    { timestamp: 1719792000, percentage: 50 }, // Remaining 50%
  ];
}
```

### Calculating Timestamps

```bash
# Get current timestamp
node -e "console.log(Math.floor(Date.now() / 1000))"

# Calculate future timestamp (30 days from now)
node -e "console.log(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60)"
```

### Supported Networks

The sandbox includes configurations for all Sablier-supported chains in `app/lib/config/chains.ts`:

- Ethereum Mainnet (1)
- Sepolia (11155111)
- Optimism (10)
- Base (8453)
- Arbitrum (42161)
- Polygon (137)
- Avalanche (43114)
- BNB Chain (56)
- Gnosis (100)
- Scroll (534352)

To add a new chain, update `supportedChains` array and add chain-specific configuration.

## Recipient Data Setup

### Data Format

Recipients are defined as:

```typescript
interface MerkleRecipient {
  address: Address; // Ethereum address (will be checksummed)
  amount: bigint; // Token amount in smallest unit (wei/atoms)
}
```

### Example Recipients

```typescript
const recipients: MerkleRecipient[] = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 1000000000000000000n, // 1.0 tokens (18 decimals)
  },
  {
    address: "0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    amount: 2500000000000000000n, // 2.5 tokens
  },
];
```

### Loading from JSON File

Create `app/lib/merkle/recipients.json`:

```json
[
  {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "1000000000000000000"
  },
  {
    "address": "0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "amount": "2500000000000000000"
  }
]
```

Update `app/lib/merkle/data.ts`:

```typescript
import recipients from "./recipients.json";
import { getAddress } from "viem";

export const RECIPIENTS: MerkleRecipient[] = recipients.map((r) => ({
  address: getAddress(r.address),
  amount: BigInt(r.amount),
}));
```

### Loading from CSV

Install CSV parser:

```bash
bun add csv-parse
```

Create a script `scripts/load-recipients.ts`:

```typescript
import { parse } from "csv-parse/sync";
import fs from "fs";
import { getAddress } from "viem";

const csvContent = fs.readFileSync("recipients.csv", "utf-8");
const records = parse(csvContent, { columns: true });

export const RECIPIENTS = records.map((r: any) => ({
  address: getAddress(r.address),
  amount: BigInt(r.amount),
}));
```

CSV format:

```csv
address,amount
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb,1000000000000000000
0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045,2500000000000000000
```

### Loading from API

Create an API endpoint at `app/api/recipients/route.ts`:

```typescript
export async function GET() {
  // Fetch from your backend/database
  const recipients = await fetchRecipientsFromDatabase();

  return Response.json(recipients);
}
```

Update `app/lib/merkle/data.ts`:

```typescript
export async function loadRecipients(): Promise<MerkleRecipient[]> {
  const response = await fetch("/api/recipients");
  const data = await response.json();

  return data.map((r: any) => ({
    address: getAddress(r.address),
    amount: BigInt(r.amount),
  }));
}
```

### Amount Calculations

For tokens with decimals:

```typescript
// 18 decimals (ETH, DAI, USDT)
const amount = 1.5; // 1.5 tokens
const amountBigInt = BigInt(amount * 10 ** 18);

// 6 decimals (USDC, USDT)
const amount = 100; // 100 USDC
const amountBigInt = BigInt(amount * 10 ** 6);

// Helper function
function toTokenAmount(humanAmount: number, decimals: number): bigint {
  return BigInt(Math.floor(humanAmount * 10 ** decimals));
}
```

### Validation

Always validate your recipient data:

```typescript
function validateRecipients(recipients: MerkleRecipient[]): void {
  // Check for duplicates
  const addresses = new Set();
  for (const r of recipients) {
    if (addresses.has(r.address.toLowerCase())) {
      throw new Error(`Duplicate address: ${r.address}`);
    }
    addresses.add(r.address.toLowerCase());
  }

  // Check for invalid amounts
  for (const r of recipients) {
    if (r.amount <= 0n) {
      throw new Error(`Invalid amount for ${r.address}: ${r.amount}`);
    }
  }

  // Verify total doesn't exceed allocation
  const total = recipients.reduce((sum, r) => sum + r.amount, 0n);
  console.log(`Total allocation: ${total}`);
}
```

## Merkle Tree Generation

### Basic Usage

```typescript
import { generateMerkleTree } from "@/lib/merkle";

const recipients: MerkleRecipient[] = [
  // your recipients
];

const tree = generateMerkleTree(recipients);
const root = tree.root; // Use this in your contract deployment

console.log("Merkle Root:", root);
```

### Save Tree to File

```typescript
import { generateMerkleTree, exportTreeData } from "@/lib/merkle";
import fs from "fs";

const tree = generateMerkleTree(recipients);
const treeData = exportTreeData(tree);

// Save for later use
fs.writeFileSync("merkle-tree.json", JSON.stringify(treeData, null, 2));
```

### Load Tree from File

```typescript
import { loadTreeData } from "@/lib/merkle";
import fs from "fs";

const treeData = JSON.parse(fs.readFileSync("merkle-tree.json", "utf-8"));

const tree = loadTreeData(treeData);
console.log("Loaded root:", tree.root);
```

### Verification

Always verify the tree before deploying:

```typescript
import { verifyProof, getEligibilityForAddress } from "@/lib/merkle";

const tree = generateMerkleTree(recipients);
const root = tree.root;

// Test a random recipient
const testAddress = recipients[0].address;
const eligibility = getEligibilityForAddress(testAddress, tree);

if (eligibility) {
  const isValid = verifyProof(root, eligibility.proof, eligibility.index, eligibility.address, eligibility.amount);

  console.log("Proof valid:", isValid); // Should be true
}
```

### Script for Generation

Create `scripts/generate-merkle.ts`:

```typescript
#!/usr/bin/env bun
import { generateMerkleTree, exportTreeData, getRecipientStats } from "@/lib/merkle";
import { RECIPIENTS } from "@/lib/merkle/data";
import fs from "fs";

console.log("Generating Merkle tree...");

const tree = generateMerkleTree(RECIPIENTS);
const root = tree.root;
const stats = getRecipientStats(tree);

console.log("\n=== Merkle Tree Generated ===");
console.log("Root:", root);
console.log("Recipients:", stats.count);
console.log("Total allocation:", stats.total.toString());
console.log("Average allocation:", stats.average.toString());
console.log("Min allocation:", stats.min.toString());
console.log("Max allocation:", stats.max.toString());

// Save tree
const treeData = exportTreeData(tree);
fs.writeFileSync("merkle-tree.json", JSON.stringify(treeData, null, 2));
console.log("\nTree saved to merkle-tree.json");

// Save root for contract deployment
fs.writeFileSync("merkle-root.txt", root);
console.log("Root saved to merkle-root.txt");
```

Run it:

```bash
bun run scripts/generate-merkle.ts
```

## Styling and Branding

### Color Customization

All brand colors are in **`app/globals.css`**.

#### Default Sablier Theme

```css
:root {
  /* Orange gradient: primary brand color */
  --sablier-orange-start: #ff7300;
  --sablier-orange-end: #ffb800;

  /* Blue gradient: accent color */
  --sablier-blue-start: #003dff;
  --sablier-blue-end: #00b7ff;

  /* Dark theme backgrounds */
  --sablier-bg-darkest: #14161f;
  --sablier-bg-dark: #1a1d2e;
  --sablier-bg-medium: #2d3142;

  /* Text colors */
  --sablier-text-primary: #e1e4ea;
  --sablier-text-secondary: #9ca3af;
}
```

#### Your Custom Brand

Replace with your colors:

```css
:root {
  /* Your primary color */
  --brand-primary: #6366f1;
  --brand-primary-dark: #4f46e5;

  /* Your backgrounds */
  --background: #ffffff;
  --foreground: #171717;

  /* Optional: gradients */
  --brand-gradient-start: #6366f1;
  --brand-gradient-end: #8b5cf6;
}
```

#### Gradient Utilities

Use predefined gradient classes:

```tsx
<div className="sablier-gradient-orange">
  {/* Orange gradient background */}
</div>

<div className="sablier-gradient-blue">
  {/* Blue gradient background */}
</div>

<h1 className="sablier-text-gradient-orange">
  {/* Gradient text */}
</h1>
```

Or create your own:

```css
.brand-gradient {
  background: linear-gradient(135deg, var(--brand-gradient-start) 0%, var(--brand-gradient-end) 100%);
}
```

### Logo and Images

Replace logo in **`app/components/layout/Header.tsx`**:

```tsx
<div className="flex items-center gap-3">
  <Image src="/your-logo.svg" alt="Your Project" width={40} height={40} />
  <span className="text-xl font-bold">Your Project</span>
</div>
```

Add your logo to **`public/your-logo.svg`**.

### Typography

Update fonts in **`app/layout.tsx`**:

```typescript
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
```

### Dark/Light Theme Toggle

The sandbox defaults to dark theme. To support light theme:

```css
/* globals.css */
@media (prefers-color-scheme: light) {
  :root {
    --background: #ffffff;
    --foreground: #14161f;
  }
}
```

To force dark theme always, remove the media query.

## UI Components

### Hero Section

Edit **`app/page.tsx`** (lines 55-65):

```tsx
<h1 className="text-4xl sm:text-5xl font-bold">
  {/* CUSTOMIZE: Campaign title */}
  Claim Your Tokens
</h1>
<p className="text-lg text-gray-600 dark:text-gray-400">
  {/* CUSTOMIZE: Campaign description */}
  Connect your wallet to check eligibility and claim your allocation
  from the {defaultCampaignConfig.campaignName}.
</p>
```

### Campaign Info Display

Edit **`app/components/campaign/CampaignInfo.tsx`** to customize what information is shown:

```tsx
// Add/remove fields as needed
<InfoRow label="Network" value={networkName} />
<InfoRow label="Token" value={campaign.tokenSymbol} />
<InfoRow label="Total Allocation" value={formattedTotal} />
<InfoRow label="Expires" value={<Timestamp timestamp={campaign.expiresAt} />} />
```

### Auto-Check Eligibility

Toggle automatic eligibility checking in **`app/page.tsx`** (line 37):

```tsx
// CUSTOMIZE: Set to true to auto-check eligibility when wallet connects
// Set to false to require manual eligibility check
const autoCheckEligibility = true;
```

### Button Styles

Button component uses `tailwind-variants` in **`app/components/ui/button.tsx`**:

```typescript
const button = tv({
  base: "font-medium rounded-lg transition-colors cursor-pointer",
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      gradient: "sablier-gradient-orange sablier-gradient-orange-hover text-white",
    },
    size: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    },
  },
});
```

### Success/Error Messages

Customize callbacks in **`app/page.tsx`** (lines 194-202):

```tsx
<ClaimButton
  onSuccess={() => {
    setShowSuccess(true);
    // CUSTOMIZE: Add analytics tracking, notifications, etc.
    console.log("Claim successful!");

    // Example: Track with analytics
    // analytics.track("airdrop_claimed", { address, amount });

    // Example: Show toast notification
    // toast.success("Tokens claimed successfully!");
  }}
  onError={(error) => {
    // CUSTOMIZE: Add error tracking, notifications, etc.
    console.error("Claim failed:", error);

    // Example: Track errors
    // analytics.track("airdrop_claim_failed", { error: error.message });

    // Example: Show error toast
    // toast.error(`Claim failed: ${error.message}`);
  }}
/>
```

## Environment Variables

### Required Variables

Create **`.env.local`** with:

```bash
# Required for RainbowKit wallet connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Getting a WalletConnect Project ID

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com/)
2. Sign up for a free account
3. Create a new project
4. Copy the Project ID
5. Add to `.env.local`

### Optional Variables

```bash
# Optional: Custom RPC endpoints
NEXT_PUBLIC_RPC_URL_MAINNET=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_RPC_URL_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXXXXXXXXX

# Optional: Backend API
NEXT_PUBLIC_API_URL=https://api.yourproject.com

# Server-only (no NEXT_PUBLIC prefix)
DATABASE_URL=postgresql://user:pass@host:5432/db
API_SECRET_KEY=your_secret_key
```

### Security Notes

- Never commit `.env.local` to git (already in `.gitignore`)
- Variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- Server-only variables (without prefix) are safe for secrets
- Use Vercel Environment Variables for production secrets

## Deployment Guide

### Vercel Deployment (Recommended)

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-airdrop.git
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `bun run build`
   - Install Command: `bun install`

#### 3. Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = your_project_id_here
```

#### 4. Deploy

Click "Deploy" and wait for build to complete.

#### 5. Custom Domain (Optional)

1. Settings → Domains
2. Add your domain (e.g., `claim.yourproject.com`)
3. Configure DNS as instructed

### Self-Hosting

#### Build for Production

```bash
just build
```

#### Run Production Server

```bash
just start
```

#### Using Docker

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "run", "start"]
```

Build and run:

```bash
docker build -t airdrop-claim .
docker run -p 3000:3000 -e NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id airdrop-claim
```

### CI/CD with GitHub Actions

The repository includes GitHub Actions workflow for Vercel deployment.

Required secrets in GitHub repository settings:

```
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VERCEL_TOKEN=your_vercel_token
```

Get these from:

1. Vercel CLI: `bunx vercel link`
2. Or Vercel dashboard → Settings → General

Using `gh` CLI:

```bash
# Create .env with secrets
echo "VERCEL_ORG_ID=..." > .env
echo "VERCEL_PROJECT_ID=..." >> .env
echo "VERCEL_TOKEN=..." >> .env

# Upload to GitHub
gh secret set -f .env
```

## Testing Checklist

### Local Testing

- [ ] Install dependencies (`bun install`)
- [ ] Create `.env.local` with WalletConnect ID
- [ ] Start dev server (`just dev`)
- [ ] Connect wallet successfully
- [ ] Verify eligibility check works
- [ ] Test claim flow (use testnet)
- [ ] Check success/error states
- [ ] Test with different wallet addresses
- [ ] Verify responsive design on mobile

### Pre-Deployment Checklist

- [ ] Update campaign configuration
- [ ] Replace mock recipients with real data
- [ ] Generate and verify merkle tree
- [ ] Deploy Merkle contract with correct root
- [ ] Update contract address in config
- [ ] Fund contract with tokens
- [ ] Test claim on testnet first
- [ ] Update hero text and branding
- [ ] Replace logo and images
- [ ] Customize color scheme
- [ ] Run `just full-check` (no errors)
- [ ] Test production build locally (`just build && just start`)

### Testnet Deployment Checklist

- [ ] Deploy contract to testnet (Sepolia, Base Sepolia, etc.)
- [ ] Get test tokens from faucet
- [ ] Fund contract with test tokens
- [ ] Update config with testnet contract
- [ ] Deploy frontend to staging environment
- [ ] Test complete flow with testnet wallet
- [ ] Verify transaction in block explorer
- [ ] Test error scenarios (insufficient gas, etc.)
- [ ] Check mobile experience

### Mainnet Deployment Checklist

- [ ] Deploy contract to mainnet
- [ ] Verify contract on block explorer
- [ ] Fund contract with tokens
- [ ] Double-check merkle root matches
- [ ] Update config with mainnet contract
- [ ] Test with small amount first
- [ ] Deploy frontend to production
- [ ] Test claim with real wallet
- [ ] Monitor error logs
- [ ] Announce to recipients
- [ ] Set up claim monitoring/dashboard

### Common Issues and Solutions

**Issue: Wallet won't connect**

- Solution: Check WalletConnect Project ID is set
- Solution: Try different browser
- Solution: Clear browser cache/cookies

**Issue: "Not eligible" for known recipient**

- Solution: Verify address checksums match
- Solution: Regenerate merkle tree
- Solution: Check correct network

**Issue: Transaction fails with "Invalid proof"**

- Solution: Verify merkle root in contract matches generated root
- Solution: Regenerate tree and redeploy contract

**Issue: Claim button disabled**

- Solution: Check wallet is connected
- Solution: Verify correct network
- Solution: Check contract has sufficient tokens

**Issue: Build fails**

- Solution: Run `just full-write` to format
- Solution: Check TypeScript errors with `just tsc-check`
- Solution: Delete `.next` folder and rebuild

## Advanced Customization

### Supporting Multiple Campaigns

Create campaign switcher:

```typescript
// app/lib/config/campaigns.ts
export const campaigns = {
  early: {
    campaignName: "Early Supporters",
    contractAddress: "0x...",
    // ...
  },
  community: {
    campaignName: "Community Members",
    contractAddress: "0x...",
    // ...
  },
};

// app/page.tsx
const [selectedCampaign, setSelectedCampaign] = useState("early");
const campaign = campaigns[selectedCampaign];
```

### Custom Eligibility Logic

Add additional checks beyond merkle proof:

```typescript
// app/hooks/useEligibility.ts
function useEligibility(address?: Address) {
  // ... existing code

  // CUSTOMIZE: Add additional checks
  const hasNFT = useHasNFT(address);
  const hasMinBalance = useMinBalance(address);

  return {
    ...eligibility,
    eligible: eligibility.eligible && hasNFT && hasMinBalance,
  };
}
```

### API Integration for Proofs

Instead of client-side merkle tree:

```typescript
// app/api/proof/route.ts
export async function POST(request: Request) {
  const { address } = await request.json();

  // Load tree from database/file
  const tree = await loadTreeFromDatabase();

  // Get eligibility
  const eligibility = getEligibilityForAddress(address, tree);

  return Response.json(eligibility);
}

// app/hooks/useEligibility.ts
async function checkEligibility(address: Address) {
  const response = await fetch("/api/proof", {
    method: "POST",
    body: JSON.stringify({ address }),
  });

  return response.json();
}
```

### Analytics Integration

Add Google Analytics:

```typescript
// app/lib/analytics.ts
export const analytics = {
  track(event: string, properties?: any) {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, properties);
    }
  },
};

// app/page.tsx
import { analytics } from "@/lib/analytics";

// Track events
analytics.track("page_view", { page: "claim" });
analytics.track("wallet_connected", { address });
analytics.track("eligibility_checked", { address, eligible: isEligible });
analytics.track("claim_initiated", { address, amount });
analytics.track("claim_success", { address, amount, txHash });
```

### Adding New Chains

Update `app/lib/config/chains.ts`:

```typescript
import { yourChain } from "viem/chains";

export const supportedChains = [
  // ... existing chains
  yourChain,
];

export function getChainConfig(chainId: number) {
  // Add case for new chain
  switch (chainId) {
    // ... existing cases
    case yourChain.id:
      return {
        name: "Your Chain",
        nativeCurrency: "YC",
        blockExplorer: "https://explorer.yourchain.com",
      };
  }
}
```

### Rate Limiting

Add rate limiting for API routes:

```typescript
// app/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// app/api/proof/route.ts
const ip = request.headers.get("x-forwarded-for") ?? "unknown";
const { success } = await ratelimit.limit(ip);

if (!success) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}
```

### Database Integration

Store claims in database:

```typescript
// app/lib/db.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// app/api/claim/route.ts
export async function POST(request: Request) {
  const { address, amount, txHash } = await request.json();

  await supabase.from("claims").insert({
    address,
    amount: amount.toString(),
    tx_hash: txHash,
    claimed_at: new Date(),
  });

  return Response.json({ success: true });
}
```

### Monitoring and Alerts

Set up monitoring:

```typescript
// app/lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

export function trackError(error: Error, context?: any) {
  console.error(error);
  Sentry.captureException(error, { extra: context });
}

// Usage in components
try {
  await claimTokens();
} catch (error) {
  trackError(error as Error, { address, amount });
}
```

### Admin Dashboard

Create admin panel:

```typescript
// app/admin/page.tsx
import { getRecipientStats, getAllEligible } from "@/lib/merkle";

export default async function AdminPage() {
  const tree = generateMerkleTree(RECIPIENTS);
  const stats = getRecipientStats(tree);
  const claimed = await getClaimedCount();

  return (
    <div>
      <h1>Campaign Dashboard</h1>
      <Stats
        total={stats.count}
        claimed={claimed}
        unclaimed={stats.count - claimed}
        totalAmount={stats.total}
      />
    </div>
  );
}
```

## Support and Resources

### Documentation

- [Sablier Airdrops Docs](https://docs.sablier.com/contracts/v2/reference/airdrops/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [viem Documentation](https://viem.sh)
- [RainbowKit Documentation](https://rainbowkit.com)

### Community

- [Sablier Discord](https://discord.gg/sablier)
- [GitHub Issues](https://github.com/sablier-labs)

### Need Help?

If you encounter issues or need assistance:

1. Check this guide's [Common Issues](#common-issues-and-solutions)
2. Search existing GitHub issues
3. Ask in Sablier Discord
4. Create a GitHub issue with details

---

**Ready to launch?** Start with the [Quick Start Guide](#quick-start-guide) and work through each section
systematically. Good luck with your airdrop!
