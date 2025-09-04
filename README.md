# Sablier Airdrop Template

A modern, production-ready airdrop interface built with Next.js 15, Tailwind CSS, and wagmi. This template provides
everything you need to launch professional token airdrop campaigns with full wallet integration, eligibility checking,
and claim functionality.

## 🚀 Features

### Core Functionality

- **Merkle Tree-based Airdrops** - Efficient on-chain verification with off-chain storage
- **Multi-chain Support** - Ethereum, Base, Arbitrum, Optimism, and more
- **Wallet Integration** - WalletConnect v2, MetaMask, and other popular wallets
- **Real-time Eligibility Checking** - Instant verification with proof generation
- **Token Claiming** - Seamless claiming process with transaction tracking
- **Campaign Management** - Flexible campaign configuration and branding

### User Experience

- **Responsive Design** - Mobile-first approach with perfect tablet/desktop scaling
- **Interactive UI** - Smooth animations, hover effects, and micro-interactions
- **Toast Notifications** - Real-time feedback for all user actions
- **Loading States** - Professional loading indicators for async operations
- **Accessibility** - WCAG compliant with full keyboard navigation support
- **Dark Theme** - Elegant dark mode with glass morphism effects

### Developer Experience

- **TypeScript** - Full type safety with comprehensive interfaces
- **Modern Stack** - Next.js 15, React 19, Tailwind CSS v4
- **Component Library** - Reusable UI components with consistent design
- **Testing Ready** - Playwright E2E testing infrastructure
- **Performance Optimized** - Bundle optimization and lazy loading
- **Documentation** - Comprehensive API docs and setup guides

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Web3**: [wagmi v2](https://wagmi.sh/) + [viem](https://viem.sh/)
- **UI Components**: Custom component library with [Lucide React](https://lucide.dev/)
- **Notifications**: [react-hot-toast](https://react-hot-toast.com/)
- **Testing**: [Playwright](https://playwright.dev/)
- **Code Quality**: [Biome](https://biomejs.dev/) for linting and formatting
- **Package Manager**: [Bun](https://bun.sh/)

## 📋 Prerequisites

- **Node.js** 20 or later
- **Bun** (recommended) or npm/yarn/pnpm
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd airdrop-sandbox
bun install
```

### 2. Configuration Setup

The template uses a hybrid configuration system that separates sensitive environment variables from application
settings.

#### Step 2a: Environment Variables (Secrets Only)

Copy the environment template for sensitive data:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and secrets:

```bash
# Required API Keys
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Optional Analytics (if enabled in JSON config)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### Step 2b: Application Configuration (JSON)

Configure application settings using JSON files:

```bash
# Copy configuration templates
cp config/app.config.example.json config/app.config.json
cp config/campaign.config.example.json config/campaign.config.json
```

**App Configuration** (`config/app.config.json`):

```json
{
  "analytics": {
    "enableGoogleAnalytics": false,
    "enableSentryErrorMonitoring": false
  },
  "features": {
    "demoMode": false,
    "enableEnsResolution": true,
    "enableSocialSharing": true
  },
  "networks": {
    "defaultChainId": 1,
    "enabled": {
      "arbitrum": false,
      "base": true,
      "ethereum": true,
      "optimism": false,
      "polygon": false
    }
  },
  "ui": {
    "theme": "default"
  }
}
```

### 3. Configure Your Airdrop Campaign

Edit `config/campaign.config.json` to customize your airdrop:

```json
{
  "campaign": {
    "name": "Your Airdrop Name",
    "campaignDescription": "Your airdrop description"
  },
  "contracts": {
    "airdropAddress": "0x1234567890123456789012345678901234567890",
    "merkleRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "tokenAddress": "0x0987654321098765432109876543210987654321"
  },
  "distribution": {
    "claimStartDate": "2024-01-01T00:00:00Z",
    "claimEndDate": "2024-12-31T23:59:59Z",
    "totalAmount": "10000000",
    "totalRecipients": 5000
  },
  "token": {
    "decimals": 18,
    "symbol": "YOUR_TOKEN"
  }
}
```

### 4. Add Your Eligible Addresses

Update the Merkle tree data in `lib/contracts/merkle.ts` or connect to your data source:

```typescript
// Option 1: Static data
export const eligibleAddresses = [
  { address: "0x...", amount: "1000" },
  // ... more addresses
];

// Option 2: Dynamic loading (recommended)
export async function getEligibilityData(address: string) {
  // Fetch from your API or IPFS
  return await fetch(`/api/eligibility/${address}`);
}
```

### 5. Development

```bash
# Start development server
just dev

# Or with Turbopack (faster)
bun run dev --turbopack

# Build for production
just build

# Run tests
bun run test

# Code quality checks
just full-check
```

## 🏗 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main airdrop page
│   └── globals.css        # Global styles and animations
├── components/            # React components
│   ├── airdrop/          # Airdrop-specific components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── config/           # Configuration files
│   ├── contracts/        # Smart contract interfaces
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper utilities
├── public/               # Static assets
│   ├── logos/           # Brand and chain logos
│   └── favicon.ico      # Site favicon
└── tests/               # E2E tests
    └── airdrop.spec.ts  # Airdrop flow tests
```

## ⚙️ Configuration Guide

### Configuration Architecture

The template uses a hybrid configuration system:

- **Environment Variables** (`.env.local`): Sensitive data only (API keys, secrets)
- **JSON Configuration Files**: Non-sensitive settings, feature flags, and campaign details
- **TypeScript Validation**: Runtime validation with clear error messages

### Configuration Files

| File                          | Purpose                                 | Safe to Commit |
| ----------------------------- | --------------------------------------- | -------------- |
| `config/app.config.json`      | App settings, networks, features        | ✅ Yes         |
| `config/campaign.config.json` | Campaign details, contracts, token info | ✅ Yes         |
| `.env.local`                  | API keys and secrets                    | ❌ Never       |

### Application Configuration

**File**: `config/app.config.json`

```typescript
interface AppConfig {
  analytics: {
    enableGoogleAnalytics: boolean;
    enableSentryErrorMonitoring: boolean;
  };
  features: {
    demoMode: boolean;
    enableEnsResolution: boolean;
    enableSocialSharing: boolean;
  };
  networks: {
    defaultChainId: number;
    enabled: {
      arbitrum: boolean;
      base: boolean;
      ethereum: boolean;
      optimism: boolean;
      polygon: boolean;
    };
  };
  ui: {
    theme: "default" | "dark" | "light";
  };
}
```

### Campaign Configuration

**File**: `config/campaign.config.json`

```typescript
interface CampaignConfig {
  campaign: {
    name: string;
    campaignDescription: string;
  };
  contracts: {
    airdropAddress: string;
    merkleRoot: string;
    tokenAddress: string;
  };
  distribution: {
    claimEndDate: string;
    claimStartDate: string;
    totalAmount: string;
    totalRecipients: number;
  };
  token: {
    decimals: number;
    symbol: string;
  };
}
```

### Supported Networks

Configure networks in `config/app.config.json`:

- **Ethereum Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Polygon** (Chain ID: 137)

### Loading Configuration in Code

```typescript
import { getAppConfig, getCampaignConfig, getFullConfig } from "@/lib/utils/config";

// Load individual configurations
const appConfig = getAppConfig();
const campaignConfig = getCampaignConfig();

// Get combined configuration with environment overrides
const fullConfig = getFullConfig();
```

### Configuration Documentation

For detailed configuration reference:

- 📚 **[Configuration Reference](./docs/CONFIGURATION.md)** - Complete schema and options
- 🔄 **[Migration Guide](./docs/MIGRATION.md)** - Migrate from environment variables
- 🛠 **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔧 API Reference

### Core Hooks

#### `useEligibility(address?: string)`

Checks if an address is eligible for the airdrop.

```typescript
const { eligibility, isLoading, error } = useEligibility(walletAddress);

interface EligibilityResult {
  status: "eligible" | "not-eligible" | "error";
  amount?: string;
  proof?: MerkleProof;
  ensName?: string;
}
```

#### `useClaim()`

Handles the token claiming process.

```typescript
const { claim, transaction, canClaim, reset } = useClaim();

// Claim tokens with proof
await claim(merkleProof);

// Check transaction status
if (transaction.state === "success") {
  console.log("Claimed successfully!", transaction.hash);
}
```

### Component Props

#### `<CampaignHeader>`

```typescript
interface CampaignHeaderProps {
  title: string;
  description?: string;
  chain: { id: number; name: string };
  totalAmount: string;
  tokenSymbol: string;
  onShare?: () => void;
}
```

#### `<ClaimSidebar>`

```typescript
interface ClaimSidebarProps {
  walletAddress?: string;
  isConnected?: boolean;
  onConnectWallet?: () => void;
  onCheckEligibility?: (address: string) => Promise<EligibilityResult>;
  onClaim?: () => Promise<void>;
  tokenSymbol?: string;
  onClaimSuccess?: (txHash: string, streamId?: bigint) => void;
}
```

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Install Playwright browsers
bun playwright install

# Run all tests
bun test

# Run specific test file
bun playwright test tests/airdrop.spec.ts

# Run tests in UI mode
bun playwright test --ui

# Generate test report
bun playwright show-report
```

### Test Coverage

- ✅ Wallet connection flows
- ✅ Eligibility checking
- ✅ Claim process (mocked)
- ✅ Responsive design validation
- ✅ Accessibility compliance
- ✅ Error handling scenarios

## 📱 Responsive Design Breakpoints

```css
/* Mobile First Approach */
mobile:     320px - 639px   /* Default, no prefix needed */
sm:         640px - 767px   /* Small tablets */
md:         768px - 1023px  /* Tablets */
lg:         1024px - 1279px /* Small desktops */
xl:         1280px - 1535px /* Large desktops */
2xl:        1536px+         /* Extra large screens */
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

### Docker

```dockerfile
# Dockerfile is included in the project
docker build -t airdrop-template .
docker run -p 3000:3000 airdrop-template
```

### Other Platforms

- **Netlify**: Configure build command as `bun run build`
- **AWS Amplify**: Use the included `amplify.yml`
- **Railway**: One-click deploy with included configuration

## 🔒 Security Considerations

### Smart Contract Integration

- Always verify contract addresses before deployment
- Use proxy patterns for upgradeable contracts
- Implement proper access controls
- Consider audit requirements for mainnet deployment

### Frontend Security

- Environment variables are properly scoped (NEXT*PUBLIC* for client-side)
- No private keys or sensitive data in client code
- CSRF protection enabled
- Content Security Policy (CSP) configured

### Best Practices

- Validate all user inputs
- Sanitize external data sources
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Regular dependency updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Write tests for new features
- Update documentation for API changes
- Run `just full-check` before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Q: Wallet won't connect**

- Ensure WalletConnect Project ID is configured in `.env.local`
- Check network configuration in `config/app.config.json`
- Clear browser cache and try again

**Q: Eligibility check fails**

- Verify Merkle tree data is correctly formatted
- Check contract addresses in `config/campaign.config.json`
- Ensure address is in eligible list

**Q: Configuration validation errors**

- Check JSON syntax in configuration files
- Verify all required fields are present
- Ensure contract addresses match pattern `^0x[a-fA-F0-9]{40}# Sablier Airdrop Template

A modern, production-ready airdrop interface built with Next.js 15, Tailwind CSS, and wagmi. This template provides
everything you need to launch professional token airdrop campaigns with full wallet integration, eligibility checking,
and claim functionality.

## 🚀 Features

### Core Functionality

- **Merkle Tree-based Airdrops** - Efficient on-chain verification with off-chain storage
- **Multi-chain Support** - Ethereum, Base, Arbitrum, Optimism, and more
- **Wallet Integration** - WalletConnect v2, MetaMask, and other popular wallets
- **Real-time Eligibility Checking** - Instant verification with proof generation
- **Token Claiming** - Seamless claiming process with transaction tracking
- **Campaign Management** - Flexible campaign configuration and branding

### User Experience

- **Responsive Design** - Mobile-first approach with perfect tablet/desktop scaling
- **Interactive UI** - Smooth animations, hover effects, and micro-interactions
- **Toast Notifications** - Real-time feedback for all user actions
- **Loading States** - Professional loading indicators for async operations
- **Accessibility** - WCAG compliant with full keyboard navigation support
- **Dark Theme** - Elegant dark mode with glass morphism effects

### Developer Experience

- **TypeScript** - Full type safety with comprehensive interfaces
- **Modern Stack** - Next.js 15, React 19, Tailwind CSS v4
- **Component Library** - Reusable UI components with consistent design
- **Testing Ready** - Playwright E2E testing infrastructure
- **Performance Optimized** - Bundle optimization and lazy loading
- **Documentation** - Comprehensive API docs and setup guides

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Web3**: [wagmi v2](https://wagmi.sh/) + [viem](https://viem.sh/)
- **UI Components**: Custom component library with [Lucide React](https://lucide.dev/)
- **Notifications**: [react-hot-toast](https://react-hot-toast.com/)
- **Testing**: [Playwright](https://playwright.dev/)
- **Code Quality**: [Biome](https://biomejs.dev/) for linting and formatting
- **Package Manager**: [Bun](https://bun.sh/)

## 📋 Prerequisites

- **Node.js** 20 or later
- **Bun** (recommended) or npm/yarn/pnpm
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd airdrop-sandbox
bun install
```

### 2. Configuration Setup

The template uses a hybrid configuration system that separates sensitive environment variables from application
settings.

#### Step 2a: Environment Variables (Secrets Only)

Copy the environment template for sensitive data:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and secrets:

```bash
# Required API Keys
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Optional Analytics (if enabled in JSON config)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### Step 2b: Application Configuration (JSON)

Configure application settings using JSON files:

```bash
# Copy configuration templates
cp config/app.config.example.json config/app.config.json
cp config/campaign.config.example.json config/campaign.config.json
```

**App Configuration** (`config/app.config.json`):

```json
{
  "analytics": {
    "enableGoogleAnalytics": false,
    "enableSentryErrorMonitoring": false
  },
  "features": {
    "demoMode": false,
    "enableEnsResolution": true,
    "enableSocialSharing": true
  },
  "networks": {
    "defaultChainId": 1,
    "enabled": {
      "arbitrum": false,
      "base": true,
      "ethereum": true,
      "optimism": false,
      "polygon": false
    }
  },
  "ui": {
    "theme": "default"
  }
}
```

### 3. Configure Your Airdrop Campaign

Edit `config/campaign.config.json` to customize your airdrop:

```json
{
  "campaign": {
    "name": "Your Airdrop Name",
    "campaignDescription": "Your airdrop description"
  },
  "contracts": {
    "airdropAddress": "0x1234567890123456789012345678901234567890",
    "merkleRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "tokenAddress": "0x0987654321098765432109876543210987654321"
  },
  "distribution": {
    "claimStartDate": "2024-01-01T00:00:00Z",
    "claimEndDate": "2024-12-31T23:59:59Z",
    "totalAmount": "10000000",
    "totalRecipients": 5000
  },
  "token": {
    "decimals": 18,
    "symbol": "YOUR_TOKEN"
  }
}
```

### 4. Add Your Eligible Addresses

Update the Merkle tree data in `lib/contracts/merkle.ts` or connect to your data source:

```typescript
// Option 1: Static data
export const eligibleAddresses = [
  { address: "0x...", amount: "1000" },
  // ... more addresses
];

// Option 2: Dynamic loading (recommended)
export async function getEligibilityData(address: string) {
  // Fetch from your API or IPFS
  return await fetch(`/api/eligibility/${address}`);
}
```

### 5. Development

```bash
# Start development server
just dev

# Or with Turbopack (faster)
bun run dev --turbopack

# Build for production
just build

# Run tests
bun run test

# Code quality checks
just full-check
```

## 🏗 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main airdrop page
│   └── globals.css        # Global styles and animations
├── components/            # React components
│   ├── airdrop/          # Airdrop-specific components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── config/           # Configuration files
│   ├── contracts/        # Smart contract interfaces
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper utilities
├── public/               # Static assets
│   ├── logos/           # Brand and chain logos
│   └── favicon.ico      # Site favicon
└── tests/               # E2E tests
    └── airdrop.spec.ts  # Airdrop flow tests
```

## ⚙️ Configuration Guide

### Configuration Architecture

The template uses a hybrid configuration system:

- **Environment Variables** (`.env.local`): Sensitive data only (API keys, secrets)
- **JSON Configuration Files**: Non-sensitive settings, feature flags, and campaign details
- **TypeScript Validation**: Runtime validation with clear error messages

### Configuration Files

| File                          | Purpose                                 | Safe to Commit |
| ----------------------------- | --------------------------------------- | -------------- |
| `config/app.config.json`      | App settings, networks, features        | ✅ Yes         |
| `config/campaign.config.json` | Campaign details, contracts, token info | ✅ Yes         |
| `.env.local`                  | API keys and secrets                    | ❌ Never       |

### Application Configuration

**File**: `config/app.config.json`

```typescript
interface AppConfig {
  analytics: {
    enableGoogleAnalytics: boolean;
    enableSentryErrorMonitoring: boolean;
  };
  features: {
    demoMode: boolean;
    enableEnsResolution: boolean;
    enableSocialSharing: boolean;
  };
  networks: {
    defaultChainId: number;
    enabled: {
      arbitrum: boolean;
      base: boolean;
      ethereum: boolean;
      optimism: boolean;
      polygon: boolean;
    };
  };
  ui: {
    theme: "default" | "dark" | "light";
  };
}
```

### Campaign Configuration

**File**: `config/campaign.config.json`

```typescript
interface CampaignConfig {
  campaign: {
    name: string;
    campaignDescription: string;
  };
  contracts: {
    airdropAddress: string;
    merkleRoot: string;
    tokenAddress: string;
  };
  distribution: {
    claimEndDate: string;
    claimStartDate: string;
    totalAmount: string;
    totalRecipients: number;
  };
  token: {
    decimals: number;
    symbol: string;
  };
}
```

### Supported Networks

Configure networks in `config/app.config.json`:

- **Ethereum Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)
- **Polygon** (Chain ID: 137)

### Loading Configuration in Code

```typescript
import { getAppConfig, getCampaignConfig, getFullConfig } from "@/lib/utils/config";

// Load individual configurations
const appConfig = getAppConfig();
const campaignConfig = getCampaignConfig();

// Get combined configuration with environment overrides
const fullConfig = getFullConfig();
```

### Configuration Documentation

For detailed configuration reference:

- 📚 **[Configuration Reference](./docs/CONFIGURATION.md)** - Complete schema and options
- 🔄 **[Migration Guide](./docs/MIGRATION.md)** - Migrate from environment variables
- 🛠 **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔧 API Reference

### Core Hooks

#### `useEligibility(address?: string)`

Checks if an address is eligible for the airdrop.

```typescript
const { eligibility, isLoading, error } = useEligibility(walletAddress);

interface EligibilityResult {
  status: "eligible" | "not-eligible" | "error";
  amount?: string;
  proof?: MerkleProof;
  ensName?: string;
}
```

#### `useClaim()`

Handles the token claiming process.

```typescript
const { claim, transaction, canClaim, reset } = useClaim();

// Claim tokens with proof
await claim(merkleProof);

// Check transaction status
if (transaction.state === "success") {
  console.log("Claimed successfully!", transaction.hash);
}
```

### Component Props

#### `<CampaignHeader>`

```typescript
interface CampaignHeaderProps {
  title: string;
  description?: string;
  chain: { id: number; name: string };
  totalAmount: string;
  tokenSymbol: string;
  onShare?: () => void;
}
```

#### `<ClaimSidebar>`

```typescript
interface ClaimSidebarProps {
  walletAddress?: string;
  isConnected?: boolean;
  onConnectWallet?: () => void;
  onCheckEligibility?: (address: string) => Promise<EligibilityResult>;
  onClaim?: () => Promise<void>;
  tokenSymbol?: string;
  onClaimSuccess?: (txHash: string, streamId?: bigint) => void;
}
```

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Install Playwright browsers
bun playwright install

# Run all tests
bun test

# Run specific test file
bun playwright test tests/airdrop.spec.ts

# Run tests in UI mode
bun playwright test --ui

# Generate test report
bun playwright show-report
```

### Test Coverage

- ✅ Wallet connection flows
- ✅ Eligibility checking
- ✅ Claim process (mocked)
- ✅ Responsive design validation
- ✅ Accessibility compliance
- ✅ Error handling scenarios

## 📱 Responsive Design Breakpoints

```css
/* Mobile First Approach */
mobile:     320px - 639px   /* Default, no prefix needed */
sm:         640px - 767px   /* Small tablets */
md:         768px - 1023px  /* Tablets */
lg:         1024px - 1279px /* Small desktops */
xl:         1280px - 1535px /* Large desktops */
2xl:        1536px+         /* Extra large screens */
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

### Docker

```dockerfile
# Dockerfile is included in the project
docker build -t airdrop-template .
docker run -p 3000:3000 airdrop-template
```

### Other Platforms

- **Netlify**: Configure build command as `bun run build`
- **AWS Amplify**: Use the included `amplify.yml`
- **Railway**: One-click deploy with included configuration

## 🔒 Security Considerations

### Smart Contract Integration

- Always verify contract addresses before deployment
- Use proxy patterns for upgradeable contracts
- Implement proper access controls
- Consider audit requirements for mainnet deployment

### Frontend Security

- Environment variables are properly scoped (NEXT*PUBLIC* for client-side)
- No private keys or sensitive data in client code
- CSRF protection enabled
- Content Security Policy (CSP) configured

### Best Practices

- Validate all user inputs
- Sanitize external data sources
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Regular dependency updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Write tests for new features
- Update documentation for API changes
- Run `just full-check` before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

- Check date formats are ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)

**Q: Transaction fails during claim**

- Verify sufficient ETH for gas fees
- Check if claim period is active in `config/campaign.config.json`
- Ensure tokens haven't been claimed already

**Q: Features not working**

- Check feature flags in `config/app.config.json`
- Ensure required environment variables are set
- Restart development server after configuration changes

For detailed troubleshooting, see [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

### Getting Help

- 📚 [Documentation](https://docs.sablier.com)
- 💬 [Discord Community](https://discord.gg/sablier)
- 🐛 [GitHub Issues](https://github.com/sablier-labs/airdrop-template/issues)
- 📧 [Email Support](mailto:hello@sablier.com)

---

Built with ❤️ by the [Sablier](https://sablier.com) team
