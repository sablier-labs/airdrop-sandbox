# Sablier Airdrops Sandbox [![NextJS][next-badge]][next] [![Node.js Version][node-badge]][node-url] [![TypeScript Version][typescript-badge]][typescript-url] [![License: MIT][license-badge]][license-url]

[next]: https://nextjs.org/
[next-badge]: https://img.shields.io/badge/Next-black?style=flat&logo=next.js&logoColor=white
[node-badge]: https://img.shields.io/badge/node-%3E%3D20-green
[node-url]: https://nodejs.org
[typescript-badge]: https://img.shields.io/badge/typescript-5.9-blue
[typescript-url]: https://www.typescriptlang.org/
[license-badge]: https://img.shields.io/badge/License-MIT-orange.svg
[license-url]: https://opensource.org/licenses/MIT

A production-ready Next.js sandbox for building custom Sablier airdrop claim frontends.

![Artwork](./artwork.jpg)

## What's Inside

This sandbox provides:

- **[Sablier v2.0 Airdrops](https://docs.sablier.com/contracts/v2/reference/airdrops/overview)** — Sablier Airdrops
  contracts integration
- **[wagmi](https://wagmi.sh)** — React hooks for Ethereum interactions
- **[viem](https://viem.sh)** — TypeScript interface for Ethereum
- **[RainbowKit](https://rainbowkit.com)** — wallet connection UI components
- **[Merkle Tree](https://github.com/OpenZeppelin/merkle-tree)** — OpenZeppelin Merkle tree utilities for proof
  generation
- **[Next.js v15](https://nextjs.org)** — with App Router and React v19
- **[TypeScript v5](https://typescriptlang.org)** — type safety and enhanced developer experience
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first CSS framework for rapid styling
- **[Bun](https://bun.sh)** — fast package manager and JavaScript runtime
- **[BiomeJS](https://biomejs.dev)** — lightning-fast linting and formatting for TypeScript and JSON
- **[Just](https://just.systems)** — command runner for streamlined task automation

Optimized for building custom airdrop claim frontends with Sablier v2.0.

## Customization

This sandbox is designed to be customized for your specific airdrop campaign. See
**[CUSTOMIZATION.md](./CUSTOMIZATION.md)** for the complete guide.

### Key Customization Areas

- **Campaign Configuration** — airdrop contract address, token details, claim periods
- **Recipient Data** — Merkle tree generation from your recipient list
- **Styling & Branding** — customize colors, logos, and UI components
- **Claim Flow** — modify the claim process and user experience
- **Eligibility Checks** — add custom eligibility logic before claiming

Look for `// CUSTOMIZE:` comments throughout the codebase for specific customization points.

> [!TIP]
>
> Start with the [Quick Start Guide](./CUSTOMIZATION.md#quick-start-guide) in the customization docs.

> [!NOTE]
>
> Some of the configuration files depend upon the [Sablier DevKit](https://github.com/sablier-labs/devkit)

## Getting Started

### Prerequisites

Before starting, you'll need:

- A [WalletConnect Project ID](https://cloud.walletconnect.com/) (required for RainbowKit)
- Your airdrop campaign details (contract address, Merkle root, recipient list)

### Installation

Install dependencies:

```bash
bun install
bun husky
```

### Configuration

1. Copy the example environment file and add your WalletConnect Project ID:

```bash
cp .env.local.example .env.local
# Edit .env.local and add your WalletConnect Project ID
```

Get a free WalletConnect Project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com/)

2. Update the campaign configuration in `app/lib/config/campaign.ts` with your airdrop details

3. Generate your Merkle tree from recipient data (see [Merkle Tree Guide](./CUSTOMIZATION.md#merkle-tree-generation))

### Development

Start the development server:

```bash
just dev
```

Open [http://localhost:3000](http://localhost:3000) to view your airdrop claim interface.

### Resources

- **[Customization Guide](./CUSTOMIZATION.md)** — Complete guide for customizing this sandbox
- [Sablier Airdrops Documentation](https://docs.sablier.com/contracts/v2/reference/airdrops/overview)
- [wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://rainbowkit.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Development Tools

Required tools:

- [Bun](https://bun.sh)
- [Ni](https://github.com/antfu-collective/ni)
- [Just](https://just.systems)

### Vercel Deployment

To make the CI deployment workflow work, you have to configure these environment variables in your GitHub Actions
secrets:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

> [!TIP]
>
> If you use the [`gh`](https://cli.github.com) CLI, you can put your environment variables in a `.env` file and then
> run this command: `gh secret set -f .env`.

## Commands

This template uses [Just](https://just.systems/) for task automation.

### Development

Make sure to run `bun install` first!

| Command      | Description              |
| ------------ | ------------------------ |
| `just dev`   | Start development server |
| `just build` | Build for production     |
| `just start` | Start production server  |
| `just clean` | Clean build artifacts    |

### Code Linting

| Command             | Description            |
| ------------------- | ---------------------- |
| `just biome-check`  | Check code with Biome  |
| `just biome-format` | Format code with Biome |
| `just full-check`   | Run all quality checks |
| `just full-write`   | Fix all quality issues |

### Other Commands

Run `just` to see all available commands.

## Project Structure

```tree
├── app/                   # Next.js App Router directory
│   ├── favicon.ico        # Favicon
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/                # Static files
├── biome.jsonc            # Biome configuration
├── justfile               # Just command definitions
├── knip.jsonc             # Knip configuration
├── next.config.js         # Next.js configuration
├── package.json           # Package configuration
├── postcss.config.js      # PostCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Detailed Customization

For comprehensive customization instructions, see **[CUSTOMIZATION.md](./CUSTOMIZATION.md)**. The guide covers:

- [Campaign Configuration](./CUSTOMIZATION.md#campaign-configuration) — contract setup, token details, distribution
  types
- [Recipient Data Setup](./CUSTOMIZATION.md#recipient-data-setup) — loading from JSON, CSV, API, or blockchain events
- [Merkle Tree Generation](./CUSTOMIZATION.md#merkle-tree-generation) — creating and verifying merkle trees
- [Styling and Branding](./CUSTOMIZATION.md#styling-and-branding) — colors, logos, typography
- [UI Components](./CUSTOMIZATION.md#ui-components) — customizing the claim flow and messaging
- [Environment Variables](./CUSTOMIZATION.md#environment-variables) — configuration and security
- [Deployment Guide](./CUSTOMIZATION.md#deployment-guide) — Vercel, self-hosting, CI/CD
- [Testing Checklist](./CUSTOMIZATION.md#testing-checklist) — pre-deployment validation
- [Advanced Customization](./CUSTOMIZATION.md#advanced-customization) — multi-campaign support, analytics, rate limiting

### Quick Customization

For basic styling changes:

- `app/globals.css` — global styles, colors, and Tailwind directives
- `app/lib/config/campaign.ts` — campaign configuration
- `app/page.tsx` — hero section and UI text

### Code Quality

- **Linting and Formatting**: Enforced with Biome (see `biome.jsonc`)
- **Dead Code Detection**: Knip detects unused dependencies and exports (see `knip.jsonc`)
- **Type Safety**: Strict TypeScript mode enabled

## Deployment

Deploy easily with
[Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme),
the platform from Next.js creators.

See the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for other options.

## License

This project is licensed under MIT.
