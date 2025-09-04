# Configuration Files

This directory contains JSON configuration files for the Sablier Airdrop application. This structure separates
configuration concerns from sensitive environment variables.

## Files Overview

### `app.config.json`

Application-wide settings that control behavior and features:

- **Analytics**: Google Analytics and Sentry monitoring toggles
- **Features**: Demo mode, ENS resolution, social sharing
- **Networks**: Default chain ID and enabled blockchain networks
- **UI**: Theme and interface preferences

### `campaign.config.json`

Campaign-specific configuration for the airdrop:

- **Campaign**: Name, description, and branding
- **Contracts**: Smart contract addresses and Merkle root
- **Distribution**: Timeline, amounts, and recipient counts
- **Token**: Symbol, decimals, and metadata

### Example Files

- `app.config.example.json`: Documented schema for app configuration
- `campaign.config.example.json`: Documented schema for campaign configuration

## Environment Variables

Sensitive data remains in environment variables:

- API keys (Alchemy, WalletConnect)
- Analytics IDs (Google Analytics, Sentry DSN)
- Custom RPC URLs (optional)
- Deployment tokens (Vercel)

## Usage

```typescript
import { getAppConfig, getCampaignConfig, getFullConfig } from "@/lib/utils/config";

// Load individual configs
const appConfig = getAppConfig();
const campaignConfig = getCampaignConfig();

// Get combined configuration with environment overrides
const fullConfig = getFullConfig();
```

## Validation

Use the validation utility to ensure configuration completeness:

```typescript
import { validateConfig } from "@/lib/utils/config";

const { isValid, errors } = validateConfig();
if (!isValid) {
  console.error("Configuration errors:", errors);
}
```

## Migration from Environment Variables

The following environment variables are now configured via JSON:

| Environment Variable                | New Location                                            |
| ----------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_DEMO_MODE`             | `app.config.json` → `features.demoMode`                 |
| `NEXT_PUBLIC_ENABLE_ENS`            | `app.config.json` → `features.enableEnsResolution`      |
| `NEXT_PUBLIC_ENABLE_SOCIAL_SHARING` | `app.config.json` → `features.enableSocialSharing`      |
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID`      | `app.config.json` → `networks.defaultChainId`           |
| `NEXT_PUBLIC_ENABLE_*` (networks)   | `app.config.json` → `networks.enabled.*`                |
| `NEXT_PUBLIC_CAMPAIGN_NAME`         | `campaign.config.json` → `campaign.name`                |
| `NEXT_PUBLIC_CAMPAIGN_DESCRIPTION`  | `campaign.config.json` → `campaign.description`         |
| `NEXT_PUBLIC_CONTRACT_ADDRESS`      | `campaign.config.json` → `contracts.airdropAddress`     |
| `NEXT_PUBLIC_TOKEN_ADDRESS`         | `campaign.config.json` → `contracts.tokenAddress`       |
| `NEXT_PUBLIC_MERKLE_ROOT`           | `campaign.config.json` → `contracts.merkleRoot`         |
| `NEXT_PUBLIC_TOKEN_SYMBOL`          | `campaign.config.json` → `token.symbol`                 |
| `NEXT_PUBLIC_TOKEN_DECIMALS`        | `campaign.config.json` → `token.decimals`               |
| `NEXT_PUBLIC_TOTAL_AMOUNT`          | `campaign.config.json` → `distribution.totalAmount`     |
| `NEXT_PUBLIC_TOTAL_RECIPIENTS`      | `campaign.config.json` → `distribution.totalRecipients` |
| `NEXT_PUBLIC_CLAIM_START_DATE`      | `campaign.config.json` → `distribution.claimStartDate`  |
| `NEXT_PUBLIC_CLAIM_END_DATE`        | `campaign.config.json` → `distribution.claimEndDate`    |

## Benefits

1. **Separation of Concerns**: Configuration vs. secrets
2. **Type Safety**: TypeScript interfaces with validation
3. **Documentation**: JSON Schema with examples and descriptions
4. **Version Control**: Safe to commit non-sensitive configuration
5. **Environment Flexibility**: Easy deployment across environments
6. **Validation**: Built-in configuration validation with clear error messages
