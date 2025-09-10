# Sablier Airdrop Sandbox

A modern, customizable airdrop interface built for the Sablier Protocol. This Next.js application provides a complete
solution for token distribution campaigns with support for instant transfers, linear lockups, and tranched vesting
schedules.

## Features

- 🔗 **Wallet Integration** - Seamless connection via RainbowKit
- ✅ **Eligibility Checking** - Merkle tree-based verification
- 🎁 **Token Claiming** - Support for multiple distribution types
- 📊 **Campaign Analytics** - Real-time stats and progress tracking
- 🎨 **Customizable UI** - Fully configurable branding and theming
- 📱 **Mobile Responsive** - Optimized for all devices
- ⚡ **Type Safe** - Built with TypeScript and strict type checking

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Web3**: Wagmi, Viem, RainbowKit
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Development**: Biome (linting & formatting)

## Prerequisites

- Node.js 20 or higher
- Bun package manager

## Quick Start

1. **Clone the repository**

   ```bash
   git clone &lt;repository-url&gt;
   cd airdrop-sandbox
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Update the environment variables:

   ```env
   NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS=0x...
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

4. **Start development server**

   ```bash
   just dev
   ```

5. **Open in browser** Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

Customize your airdrop campaign by editing `config/airdrop.config.ts`:

```typescript
export const airdropConfig: AirdropConfig = {
  campaign: {
    name: "Your Airdrop Campaign",
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
  },
  contract: {
    address: "0x...", // Your airdrop contract
    chainId: 8453, // Base mainnet
    type: "instant", // instant | lockup-linear | lockup-tranched
  },
  merkle: {
    root: "0x...", // Merkle tree root
    totalRecipients: 10000, // Number of eligible addresses
    totalTokens: "1000000", // Total token allocation
  },
  // ... additional configuration options
};
```

## Available Commands

The project uses [Just](https://github.com/casey/just) for task running:

```bash
# Development
just dev          # Start development server with Turbopack
just build        # Build for production
just start        # Start production server

# Code Quality
just full-check   # Run all checks (lint, type, format)
just full-write   # Fix all auto-fixable issues
just tsc-check    # TypeScript type checking only

# Utilities
just clean        # Clean build artifacts
just --list       # Show all available commands
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main airdrop interface
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI primitives
│   ├── layout/           # Layout components
│   ├── claim-panel.tsx   # Token claiming interface
│   ├── eligibility-checker.tsx  # Eligibility verification
│   └── campaign-stats.tsx       # Campaign analytics
├── config/               # Configuration files
│   ├── airdrop.config.ts # Main airdrop configuration
│   └── types.ts          # TypeScript type definitions
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Key Components

- **ClaimPanel** - Main interface for token claiming with transaction handling
- **EligibilityChecker** - Merkle proof verification and eligibility status
- **CampaignStats** - Real-time campaign metrics and progress indicators
- **TransactionStatus** - Transaction monitoring and status updates
- **NetworkGuard** - Chain validation and network switching

## Customization

### Branding

Update logos, colors, and typography in the configuration file:

```typescript
branding: {
  logo: {
    light: "/your-logo-light.svg",
    dark: "/your-logo-dark.svg",
  },
  // ... additional branding options
}
```

### Distribution Types

Support for three distribution mechanisms:

- **Instant** - Immediate token transfer
- **Lockup Linear** - Linear vesting over time
- **Lockup Tranched** - Multiple unlock periods

### UI Themes

Built-in support for light, dark, and system themes with extensive customization options.

## Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Configure environment variables**
3. **Deploy**

The project includes optimized build settings for Vercel deployment.

### Manual Deployment

```bash
just build
# Deploy the .next directory to your hosting provider
```

## Development Guidelines

- **Code Quality**: All code must pass `just full-check`
- **Type Safety**: Strict TypeScript configuration enforced
- **Formatting**: Biome handles code formatting automatically
- **Testing**: Run validation before committing changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `just full-check` to ensure code quality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.MD](LICENSE.MD) file for details.

## Support

- **Documentation**: [Sablier Protocol Docs](https://docs.sablier.com)
- **Discord**: [Join Community](https://discord.gg/sablier)
- **Twitter**: [@sablier](https://twitter.com/sablier)
- **Email**: support@sablier.com

---

Built with ❤️ by the Sablier team
