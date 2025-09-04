# Configuration Reference

The Sablier Airdrop Template uses a JSON-based configuration system that separates sensitive environment variables from
non-sensitive application settings. This approach provides better type safety, validation, and maintainability while
keeping secrets secure.

## Overview

The configuration system consists of:

- **Environment Variables (`.env`)**: Sensitive data only (API keys, secrets, deployment tokens)
- **JSON Configuration Files**: Non-sensitive settings, feature flags, and campaign details
- **TypeScript Validation**: Runtime validation with clear error messages

## Configuration Architecture

```
config/
├── app.config.json         # Application-wide settings
├── campaign.config.json    # Campaign-specific configuration
├── app.config.example.json # Schema and documentation
└── campaign.config.example.json # Schema and documentation
```

## Application Configuration (`app.config.json`)

Controls application-wide behavior, features, and network settings.

### Schema Overview

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

### Configuration Sections

#### Analytics (`analytics`)

Controls third-party analytics and monitoring services.

| Property                      | Type      | Default | Description                                  |
| ----------------------------- | --------- | ------- | -------------------------------------------- |
| `enableGoogleAnalytics`       | `boolean` | `false` | Enable Google Analytics 4 tracking           |
| `enableSentryErrorMonitoring` | `boolean` | `false` | Enable Sentry error monitoring and reporting |

**Example:**

```json
{
  "analytics": {
    "enableGoogleAnalytics": true,
    "enableSentryErrorMonitoring": true
  }
}
```

#### Features (`features`)

Application feature toggles and functionality controls.

| Property              | Type      | Default | Description                                           |
| --------------------- | --------- | ------- | ----------------------------------------------------- |
| `demoMode`            | `boolean` | `false` | Enable demo mode with mock data for testing           |
| `enableEnsResolution` | `boolean` | `true`  | Enable ENS (Ethereum Name Service) address resolution |
| `enableSocialSharing` | `boolean` | `true`  | Enable social media sharing functionality             |

**Example:**

```json
{
  "features": {
    "demoMode": false,
    "enableEnsResolution": true,
    "enableSocialSharing": true
  }
}
```

#### Networks (`networks`)

Blockchain network configuration and availability.

| Property           | Type      | Default | Description                                                                                  |
| ------------------ | --------- | ------- | -------------------------------------------------------------------------------------------- |
| `defaultChainId`   | `number`  | `1`     | Primary blockchain network (1=Ethereum, 8453=Base, 42161=Arbitrum, 10=Optimism, 137=Polygon) |
| `enabled.arbitrum` | `boolean` | `false` | Enable Arbitrum network support                                                              |
| `enabled.base`     | `boolean` | `true`  | Enable Base network support                                                                  |
| `enabled.ethereum` | `boolean` | `true`  | Enable Ethereum network support                                                              |
| `enabled.optimism` | `boolean` | `false` | Enable Optimism network support                                                              |
| `enabled.polygon`  | `boolean` | `false` | Enable Polygon network support                                                               |

**Supported Chain IDs:**

- **1**: Ethereum Mainnet
- **8453**: Base
- **42161**: Arbitrum One
- **10**: Optimism
- **137**: Polygon

**Example:**

```json
{
  "networks": {
    "defaultChainId": 8453,
    "enabled": {
      "arbitrum": false,
      "base": true,
      "ethereum": true,
      "optimism": false,
      "polygon": false
    }
  }
}
```

#### UI (`ui`)

User interface preferences and theme settings.

| Property | Type                             | Default     | Description                  |
| -------- | -------------------------------- | ----------- | ---------------------------- |
| `theme`  | `"default" \| "dark" \| "light"` | `"default"` | Application theme preference |

**Theme Options:**

- `"default"`: System preference (auto dark/light)
- `"dark"`: Force dark theme
- `"light"`: Force light theme

**Example:**

```json
{
  "ui": {
    "theme": "dark"
  }
}
```

### Complete Example

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

## Campaign Configuration (`campaign.config.json`)

Contains campaign-specific settings for the airdrop including contract addresses, token details, and distribution
parameters.

### Schema Overview

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

### Configuration Sections

#### Campaign (`campaign`)

Basic campaign information and branding.

| Property              | Type     | Max Length | Description                           |
| --------------------- | -------- | ---------- | ------------------------------------- |
| `name`                | `string` | 100        | Display name for the airdrop campaign |
| `campaignDescription` | `string` | 500        | Campaign description shown to users   |

**Example:**

```json
{
  "campaign": {
    "name": "Friends of Sapien Airdrop",
    "campaignDescription": "Rewarding early supporters and contributors to the ecosystem"
  }
}
```

#### Contracts (`contracts`)

Smart contract addresses and configuration.

| Property         | Type     | Pattern               | Description                                                |
| ---------------- | -------- | --------------------- | ---------------------------------------------------------- |
| `airdropAddress` | `string` | `^0x[a-fA-F0-9]{40}$` | Address of the deployed airdrop contract                   |
| `merkleRoot`     | `string` | `^0x[a-fA-F0-9]{64}$` | Root hash of the Merkle tree containing eligible addresses |
| `tokenAddress`   | `string` | `^0x[a-fA-F0-9]{40}$` | Address of the ERC-20 token being distributed              |

**Example:**

```json
{
  "contracts": {
    "airdropAddress": "0x1234567890123456789012345678901234567890",
    "merkleRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "tokenAddress": "0x0987654321098765432109876543210987654321"
  }
}
```

#### Distribution (`distribution`)

Token distribution details and timeline.

| Property          | Type     | Format       | Description                                          |
| ----------------- | -------- | ------------ | ---------------------------------------------------- |
| `claimEndDate`    | `string` | ISO 8601     | End date for claim period                            |
| `claimStartDate`  | `string` | ISO 8601     | Start date for claim period                          |
| `totalAmount`     | `string` | Numbers only | Total tokens to distribute (in token units, not wei) |
| `totalRecipients` | `number` | Min: 1       | Total number of eligible recipients                  |

**Date Format:** ISO 8601 format (e.g., `"2024-12-31T23:59:59Z"`)

**Example:**

```json
{
  "distribution": {
    "claimStartDate": "2024-01-01T00:00:00Z",
    "claimEndDate": "2024-12-31T23:59:59Z",
    "totalAmount": "10000000",
    "totalRecipients": 5000
  }
}
```

#### Token (`token`)

Token metadata and properties.

| Property   | Type     | Range                | Description                            |
| ---------- | -------- | -------------------- | -------------------------------------- |
| `decimals` | `number` | 0-18                 | Number of decimal places for the token |
| `symbol`   | `string` | Max 10 chars, A-Z0-9 | Token symbol (ticker)                  |

**Example:**

```json
{
  "token": {
    "decimals": 18,
    "symbol": "SAPIEN"
  }
}
```

### Complete Example

```json
{
  "campaign": {
    "name": "Friends of Sapien Airdrop",
    "campaignDescription": "Rewarding early supporters and contributors to the ecosystem"
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
    "symbol": "SAPIEN"
  }
}
```

## Environment Variables

Sensitive data that should never be committed to version control.

### Required Variables

| Variable                               | Type     | Description                       | Where to Get                                           |
| -------------------------------------- | -------- | --------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `string` | WalletConnect project identifier  | [WalletConnect Cloud](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_ALCHEMY_API_KEY`          | `string` | Alchemy API key for RPC endpoints | [Alchemy Dashboard](https://www.alchemy.com)           |

### Optional Variables

| Variable                        | Type     | Description                         |
| ------------------------------- | -------- | ----------------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `string` | Google Analytics 4 measurement ID   |
| `NEXT_PUBLIC_SENTRY_DSN`        | `string` | Sentry DSN for error monitoring     |
| `VERCEL_ORG_ID`                 | `string` | Vercel organization ID (deployment) |
| `VERCEL_PROJECT_ID`             | `string` | Vercel project ID (deployment)      |
| `VERCEL_TOKEN`                  | `string` | Vercel deployment token             |

## Usage in Code

### Loading Configuration

```typescript
import { getAppConfig, getCampaignConfig, getFullConfig } from "@/lib/utils/config";

// Load individual configurations
const appConfig = getAppConfig();
const campaignConfig = getCampaignConfig();

// Get combined configuration with environment variable overrides
const fullConfig = getFullConfig();
```

### Type Safety

```typescript
// All configurations are fully typed
const chainId: number = appConfig.networks.defaultChainId;
const tokenSymbol: string = campaignConfig.token.symbol;
const isDemoMode: boolean = appConfig.features.demoMode;
```

### Validation

```typescript
import { validateConfig } from "@/lib/utils/config";

// Validate configuration on startup
const { isValid, errors } = validateConfig();

if (!isValid) {
  console.error("Configuration validation failed:", errors);
  process.exit(1);
}
```

## JSON Schema Validation

Both configuration files include JSON Schema definitions for IDE support and validation.

### Schema Properties

- **`$schema`**: JSON Schema version
- **`title`**: Configuration file title
- **`description`**: File purpose description
- **Property definitions**: Type, format, validation rules, examples

### IDE Integration

Most modern IDEs with JSON support will provide:

- **Autocomplete**: Property suggestions based on schema
- **Validation**: Real-time error checking
- **Documentation**: Hover tooltips with property descriptions
- **Type Checking**: Format and pattern validation

## Best Practices

### Configuration Management

1. **Separate Concerns**: Keep sensitive data in environment variables, configuration in JSON
2. **Version Control**: Commit example files, never commit actual configuration with secrets
3. **Validation**: Always validate configuration on application startup
4. **Documentation**: Keep schema examples up to date with actual usage
5. **Environment Parity**: Use same configuration structure across all environments

### Security

1. **Never Commit Secrets**: Use `.env.local` for sensitive data
2. **Principle of Least Privilege**: Only expose necessary data to client-side
3. **Environment Variables**: Use `NEXT_PUBLIC_` prefix only for client-side data
4. **Regular Updates**: Keep API keys and tokens current

### Development Workflow

1. **Copy Examples**: Start with `.example.json` files
2. **Gradual Configuration**: Configure one section at a time
3. **Validate Early**: Run validation after each configuration change
4. **Test Thoroughly**: Test all configuration combinations
5. **Document Changes**: Update examples when adding new properties

### Deployment

1. **Environment-Specific**: Use different configuration files per environment
2. **Automated Validation**: Include configuration validation in CI/CD
3. **Rollback Strategy**: Keep previous configurations for quick rollbacks
4. **Monitoring**: Monitor configuration-related errors in production

## Advanced Topics

### Custom Validation

Extend the validation system for custom requirements:

```typescript
import { z } from "zod";

// Custom validator for contract addresses
const contractAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

// Custom date validation
const futureDateSchema = z.string().refine((date) => new Date(date) > new Date(), "Date must be in the future");
```

### Dynamic Configuration

Load configuration from external sources:

```typescript
async function loadRemoteConfig(environment: string) {
  const response = await fetch(`/api/config/${environment}`);
  const config = await response.json();

  return validateConfig(config);
}
```

### Configuration Versioning

Handle configuration schema evolution:

```typescript
interface ConfigV1 {
  version: 1;
  // v1 properties
}

interface ConfigV2 {
  version: 2;
  // v2 properties with migrations
}

function migrateConfig(config: ConfigV1): ConfigV2 {
  // Migration logic
}
```
