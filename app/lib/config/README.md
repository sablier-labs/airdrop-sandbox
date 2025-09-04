# Configuration System

This directory contains the comprehensive TypeScript configuration system for the airdrop application.

## Overview

The configuration system provides:

- **Type-safe** loading of JSON configuration files
- **Validation** of all configuration data with clear error messages
- **Caching** for performance optimization
- **Environment variable overrides** for sensitive data
- **Graceful fallbacks** when configuration loading fails

## Architecture

```
lib/
├── types/config.ts       # Complete type definitions and validation utilities
├── config/loader.ts      # Configuration loading, validation, and caching system
└── utils/config.ts       # Legacy wrapper (deprecated, use loader directly)
```

## Usage

### Basic Configuration Loading

```typescript
import { getConfiguration } from "@/lib/config/loader";

// Load complete processed configuration
const config = await getConfiguration();

console.log(config.campaign.name);
console.log(config.token.symbol);
console.log(config.networks.defaultChainId);
```

### Advanced Loading with Error Handling

```typescript
import { loadConfiguration, validateConfiguration } from "@/lib/config/loader";

const result = await loadConfiguration();
if (result.success) {
  const config = result.data;
  const validation = validateConfiguration(config);

  if (!validation.isValid) {
    console.error("Validation errors:", validation.errors);
  }
} else {
  console.error("Loading failed:", result.error);
  if (result.fallback) {
    // Use fallback configuration
    const config = result.fallback;
  }
}
```

### Demo Mode Integration

```typescript
import { isDemoMode, getConfig } from "@/lib/utils/demo-mode";

const demoEnabled = await isDemoMode();
const config = await getConfig(); // Returns demo or production config
```

## Configuration Files

### App Configuration (`config/app.config.json`)

Controls application-wide settings:

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

### Campaign Configuration (`config/campaign.config.json`)

Campaign-specific settings:

```json
{
  "campaign": {
    "name": "Friends of Sapien Airdrop",
    "description": "Rewarding early supporters and contributors"
  },
  "contracts": {
    "airdropAddress": "0x1234...",
    "tokenAddress": "0x5678...",
    "merkleRoot": "0xabcd..."
  },
  "distribution": {
    "claimStartDate": "2024-01-01T00:00:00Z",
    "claimEndDate": "2024-12-31T23:59:59Z",
    "totalAmount": "10000000",
    "totalRecipients": 5000
  },
  "token": {
    "symbol": "SAPIEN",
    "decimals": 18
  }
}
```

## Environment Variables

### Required

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key for blockchain access

### Optional

- `NEXT_PUBLIC_DEMO_MODE` - Override demo mode setting ("true"/"false")
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics measurement ID
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error monitoring
- `NEXT_PUBLIC_{NETWORK}_RPC_URL` - Custom RPC URLs for specific networks
- Vercel deployment variables (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`)

## Type Definitions

The system provides comprehensive TypeScript types:

```typescript
// Main configuration types
type AppConfig = { analytics, features, networks, ui }
type CampaignConfig = { campaign, contracts, distribution, token }
type ProcessedConfig = // Merged and processed configuration

// Utility types
type ChainId = 1 | 8453 | 10 | 137 | 42161
type NetworkName = "ethereum" | "base" | "optimism" | "polygon" | "arbitrum"
type ConfigLoadResult<T> = { success: true, data: T } | { success: false, error: string }
```

## Validation

The system performs comprehensive validation:

### Contract Addresses

- Must be valid Ethereum addresses (40 hex chars)
- Cannot be zero address (`0x0000...`)

### Network Configuration

- Chain IDs must be supported (1, 8453, 10, 137, 42161)
- At least one network must be enabled
- Default chain must be enabled

### Dates and Amounts

- ISO 8601 date format required
- Start date must be before end date
- Token decimals between 0-77
- Amounts must be valid number strings

### Environment Variables

- Required variables must be present
- Optional variables validated if present

## Performance Features

### Caching

- 5-minute TTL cache for loaded configurations
- Avoids repeated file system reads
- `clearConfigCache()` for testing/development

### Lazy Loading

- JSON files imported at module level
- Async processing for type conversion
- Parallel loading of app and campaign configs

## Migration from Legacy System

The old `lib/utils/config.ts` file is now deprecated but maintained for backward compatibility:

```typescript
// Old (deprecated)
import { getAppConfig, getCampaignConfig, getFullConfig } from "@/lib/utils/config";

// New (recommended)
import { loadAppConfig, loadCampaignConfig, getConfiguration } from "@/lib/config/loader";
```

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Check `.env.local` file
2. **Invalid addresses**: Ensure non-zero addresses in campaign config
3. **Date format errors**: Use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
4. **Network misconfiguration**: Verify chain IDs and enabled networks

### Validation Script

Run the validation script to check configuration:

```bash
# Check current configuration
npm run tsx scripts/validate-config.ts

# Test configuration system
npm run tsx scripts/test-config.ts
```

### Type Checking

```bash
# Verify all types are correct
npm run tsc-check
```

## Best Practices

1. **Always use the new loader system** for new code
2. **Handle loading errors gracefully** with fallbacks
3. **Validate configuration** before using in production
4. **Use environment variables** for sensitive data
5. **Clear cache** during development when configs change
6. **Follow the type system** - let TypeScript guide you

This configuration system provides a robust, type-safe foundation for managing complex application settings across
development and production environments.
