# Customization Guide

This guide explains how to customize the Sablier Airdrops Sandbox for your specific airdrop campaign.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Branding](#branding)
- [Campaign Details](#campaign-details)
- [Design System](#design-system)
- [Contract Configuration](#contract-configuration)
- [Deployment](#deployment)

## Quick Start

All customization points are marked with comments in the code:

```typescript
/* CUSTOMIZATION POINT: Modify this to match your brand */
```

Search for these comments to find all areas that need customization.

## Environment Configuration

### 1. Copy Environment File

```bash
cp .env.example .env.local
```

### 2. Configure Variables

Edit `.env.local`:

```env
# WalletConnect Project ID
# Get from: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Airdrop Configuration
NEXT_PUBLIC_MERKLE_ROOT=0x...        # From merkle tree generator
NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=0x...  # Your deployed contract
NEXT_PUBLIC_CHAIN_ID=1               # 1=mainnet, 11155111=sepolia

# Merkle Tree IPFS URL
# Host your Merkle tree on IPFS and provide the URL here
# The IPFS file should contain the tree in Sablier's standard format
NEXT_PUBLIC_MERKLE_TREE_IPFS_URL=https://ipfs.io/ipfs/YOUR_CID_HERE
```

### 3. Generate Merkle Tree

See [Merkle Tree Generation](#merkle-tree-generation) below.

## Branding

### Logo

1. **Download Sablier assets** from https://github.com/sablier-labs/branding
   - Or use your own logo

2. **Replace logo file**: `public/sablier-logo.svg`

3. **Update in page** (`app/page.tsx:20-23`):
   ```typescript
   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
     S  {/* Replace with <img src="/your-logo.svg" /> */}
   </div>
   ```

### Colors

Edit `app/globals.css` to update brand colors:

```css
:root {
  /* Your brand color */
  --sablier-orange: #f77423; /* Change this */
  --sablier-orange-dark: #e65a00;
  --sablier-orange-light: #ff9654;
}
```

See [DESIGN.md](./DESIGN.md) for the complete color system.

### Fonts

The project uses Geist Sans and Geist Mono. To change:

1. Update `app/layout.tsx` (import different font)
2. Update `app/globals.css` (font-family variables)

## Campaign Details

### Page Title and Description

**File**: `app/page.tsx`

```typescript
// Line 39-44: Hero section
<h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
  Claim Your Airdrop  {/* Change this */}
</h2>
<p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
  Your campaign description here  {/* Change this */}
</p>
```

### ClaimCard Configuration

**File**: `app/page.tsx` (Line 49-54)

```typescript
<ClaimCard
  tokenSymbol="TOKEN"      // Your token symbol
  tokenDecimals={18}       // Your token decimals
  title="Community Airdrop"  // Campaign title
  description="Thank you for being an early supporter."  // Message
/>
```

### Campaign Statistics

**File**: `app/page.tsx` (Line 60-87)

Replace `"---"` with actual data:

```typescript
<div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
  415  {/* Total recipients from your Merkle tree */}
</div>

<div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
  10,000 TOKEN  {/* Total allocation */}
</div>

<div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
  Dec 31, 2025  {/* Claim deadline */}
</div>
```

### "How It Works" Section

**File**: `app/page.tsx` (Line 89-124)

Customize the steps based on your specific requirements:

```typescript
<div>
  <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
    1. Connect Your Wallet
  </p>
  <p className="text-sm">
    Custom instruction here
  </p>
</div>
```

### Footer Links

**File**: `app/page.tsx` (Line 129-154)

Update links to your organization:

```typescript
<a href="https://your-docs.com" ...>
  Documentation
</a>
```

## Design System

### Component Styling

All components use `tailwind-variants` for styling. To customize:

**Example**: Button colors (`app/components/ui/button.tsx`)

```typescript
const button = tv({
  variants: {
    variant: {
      primary: "bg-blue-600 text-white hover:bg-blue-700", // Change colors here
    },
  },
});
```

### Status Colors

**File**: `app/components/transaction-status.tsx`

Change colors for transaction states:

```typescript
const statusStyles = tv({
  variants: {
    status: {
      writing: "border-yellow-300 bg-yellow-50 ...", // Customize
      confirming: "border-blue-300 bg-blue-50 ...",
      confirmed: "border-green-300 bg-green-50 ...",
      error: "border-red-300 bg-red-50 ...",
    },
  },
});
```

## Contract Configuration

### Supported Networks

**File**: `app/lib/wagmi.ts`

Add or remove networks:

```typescript
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum], // Add chains here
  // ...
});
```

### Block Explorers

**File**: `app/components/transaction-status.tsx`

Add custom block explorers:

```typescript
const explorers: Record<number, string> = {
  1: "https://etherscan.io/tx",
  42161: "https://arbiscan.io/tx",
  // Add your chain here
};
```

### Custom Claim Logic

To add additional eligibility requirements:

1. **Modify proof API** (`app/api/airdrop/proof/route.ts`)
   - Add validation logic before returning proof

2. **Add custom hooks** (`app/hooks/`)
   - Create new hooks for checking additional requirements

3. **Update ClaimCard** (`app/components/claim-card.tsx`)
   - Integrate new hooks into claim flow

## Merkle Tree Generation

### 1. Prepare Recipients Data

Create `data/recipients.json`:

```json
[
  {
    "address": "0x1111111111111111111111111111111111111111",
    "amount": "1000000000000000000000"
  },
  {
    "address": "0x2222222222222222222222222222222222222222",
    "amount": "2000000000000000000000"
  }
]
```

**Important**: Amounts must be in the smallest token unit (wei for 18 decimals).

### 2. Generate Tree

```bash
bun run scripts/generate-merkle-tree.ts data/recipients.json data/merkle-tree.json
```

### 3. Upload to IPFS

After generating the tree, upload it to IPFS:

```bash
# Using IPFS CLI
ipfs add data/merkle-tree.json

# Or use a service like:
# - Pinata (https://pinata.cloud)
# - NFT.Storage (https://nft.storage)
# - Web3.Storage (https://web3.storage)
```

Copy the CID and construct the IPFS URL:

```
https://ipfs.io/ipfs/YOUR_CID_HERE
```

### 4. Deploy Contract

Use the Merkle root from `data/merkle-tree.json` when deploying your Sablier airdrop contract.

### 5. Update Environment

Add the IPFS URL to `.env.local`:

```env
NEXT_PUBLIC_MERKLE_ROOT=0x...
NEXT_PUBLIC_MERKLE_TREE_IPFS_URL=https://ipfs.io/ipfs/YOUR_CID_HERE
```

## Success Messages

### Claim Confirmation

**File**: `app/components/claim-card.tsx` (Line 168-173)

```typescript
<p className="mt-2 text-sm">
  You have successfully claimed {amountFormatted} {tokenSymbol}.
  {/* Add custom success message or next steps */}
</p>
```

### Not Eligible Message

**File**: `app/components/claim-card.tsx` (Line 135-139)

```typescript
<p className="mt-1 text-sm">
  Your address is not eligible for this airdrop.
  {/* Customize message and link to eligibility criteria */}
</p>
```

## Deployment

See the main [README.md](./README.md) for deployment instructions.

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Merkle tree generated
- [ ] Contract deployed with correct root
- [ ] Logo and branding updated
- [ ] Campaign details customized
- [ ] Footer links updated
- [ ] Tested on testnet
- [ ] All customization points reviewed

## Testing

### Local Development

```bash
just dev
```

Visit http://localhost:3000 and test:

1. Connect wallet (MetaMask or Rabby)
2. Check eligibility (use an address from your Merkle tree)
3. Claim tokens (on testnet first!)
4. Verify transaction on block explorer

### Testnet Testing

Always test on Sepolia (or other testnet) before mainnet:

1. Set `NEXT_PUBLIC_CHAIN_ID=11155111` (Sepolia)
2. Deploy contract to Sepolia
3. Test complete flow
4. Verify block explorer links work

## Troubleshooting

### "Address not eligible"

- Verify address is in `data/recipients.json`
- Check Merkle tree was generated correctly
- Ensure IPFS URL is accessible and points to the correct tree

### "Wrong Network"

- Check `NEXT_PUBLIC_CHAIN_ID` matches your contract's network
- Ensure RainbowKit has the correct chain configured

### Block explorer links not working

- Verify chain ID in `transaction-status.tsx` explorers mapping
- Add custom block explorer for your network

## Support

For questions or issues:

- Sablier Docs: https://docs.sablier.com
- GitHub: https://github.com/sablier-labs
- Discord: https://discord.gg/sablier
