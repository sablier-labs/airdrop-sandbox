# Migration Guide: Environment Variables to JSON Configuration

This guide walks you through migrating from the legacy environment variable-based configuration system to the new
JSON-based configuration architecture.

## Overview

The migration involves moving non-sensitive configuration from environment variables to structured JSON files while
keeping sensitive data (API keys, secrets) in environment variables.

### Benefits of Migration

- **Type Safety**: Full TypeScript support with interfaces and validation
- **Better Organization**: Logical grouping of related settings
- **Schema Validation**: Runtime validation with clear error messages
- **IDE Support**: Autocomplete, validation, and documentation
- **Version Control**: Safe to commit non-sensitive configuration
- **Environment Flexibility**: Easy configuration management across deployments

## Pre-Migration Checklist

Before starting the migration:

- [ ] **Backup Current Configuration**: Save your current `.env` or `.env.local` file
- [ ] **Read Configuration Reference**: Review [`CONFIGURATION.md`](./CONFIGURATION.md) for full schema details
- [ ] **Prepare JSON Files**: Copy example files to create your configuration
- [ ] **Test Environment**: Have a development environment ready for testing

## Step-by-Step Migration

### Step 1: Prepare Configuration Files

Copy the example configuration files to create your JSON configuration:

```bash
# Copy application configuration template
cp config/app.config.example.json config/app.config.json

# Copy campaign configuration template
cp config/campaign.config.example.json config/campaign.config.json
```

### Step 2: Migrate Application Settings

Transform your environment variables to JSON configuration using the mapping table below.

#### Analytics Configuration

| Old Environment Variable                        | New JSON Location                       | Example Value  |
| ----------------------------------------------- | --------------------------------------- | -------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` _(keep as env)_ | _Remains in `.env`_                     | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` _(keep as env)_        | _Remains in `.env`_                     | `https://...`  |
| _(feature flag)_                                | `analytics.enableGoogleAnalytics`       | `true/false`   |
| _(feature flag)_                                | `analytics.enableSentryErrorMonitoring` | `true/false`   |

**Migration:**

```json
// config/app.config.json
{
  "analytics": {
    "enableGoogleAnalytics": true,
    "enableSentryErrorMonitoring": false
  }
}
```

#### Feature Configuration

| Old Environment Variable            | New JSON Location              | Example Value |
| ----------------------------------- | ------------------------------ | ------------- |
| `NEXT_PUBLIC_DEMO_MODE`             | `features.demoMode`            | `false`       |
| `NEXT_PUBLIC_ENABLE_ENS`            | `features.enableEnsResolution` | `true`        |
| `NEXT_PUBLIC_ENABLE_SOCIAL_SHARING` | `features.enableSocialSharing` | `true`        |

**Migration Example:**

```bash
# Old .env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_ENABLE_ENS=true
NEXT_PUBLIC_ENABLE_SOCIAL_SHARING=true
```

```json
// New config/app.config.json
{
  "features": {
    "demoMode": false,
    "enableEnsResolution": true,
    "enableSocialSharing": true
  }
}
```

#### Network Configuration

| Old Environment Variable       | New JSON Location           | Example Value |
| ------------------------------ | --------------------------- | ------------- |
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | `networks.defaultChainId`   | `1`           |
| `NEXT_PUBLIC_ENABLE_ETHEREUM`  | `networks.enabled.ethereum` | `true`        |
| `NEXT_PUBLIC_ENABLE_BASE`      | `networks.enabled.base`     | `true`        |
| `NEXT_PUBLIC_ENABLE_ARBITRUM`  | `networks.enabled.arbitrum` | `false`       |
| `NEXT_PUBLIC_ENABLE_OPTIMISM`  | `networks.enabled.optimism` | `false`       |
| `NEXT_PUBLIC_ENABLE_POLYGON`   | `networks.enabled.polygon`  | `false`       |

**Migration Example:**

```bash
# Old .env
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
NEXT_PUBLIC_ENABLE_ETHEREUM=true
NEXT_PUBLIC_ENABLE_BASE=true
NEXT_PUBLIC_ENABLE_ARBITRUM=false
NEXT_PUBLIC_ENABLE_OPTIMISM=false
NEXT_PUBLIC_ENABLE_POLYGON=false
```

```json
// New config/app.config.json
{
  "networks": {
    "defaultChainId": 1,
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

#### UI Configuration

| Old Environment Variable | New JSON Location | Example Value |
| ------------------------ | ----------------- | ------------- |
| _(new feature)_          | `ui.theme`        | `"default"`   |

**Migration:**

```json
// config/app.config.json
{
  "ui": {
    "theme": "default"
  }
}
```

### Step 3: Migrate Campaign Settings

Transform campaign-specific environment variables to JSON configuration.

#### Campaign Information

| Old Environment Variable           | New JSON Location              | Example Value                  |
| ---------------------------------- | ------------------------------ | ------------------------------ |
| `NEXT_PUBLIC_CAMPAIGN_NAME`        | `campaign.name`                | `"Friends of Sapien Airdrop"`  |
| `NEXT_PUBLIC_CAMPAIGN_DESCRIPTION` | `campaign.campaignDescription` | `"Rewarding early supporters"` |

#### Contract Configuration

| Old Environment Variable       | New JSON Location          | Example Value |
| ------------------------------ | -------------------------- | ------------- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `contracts.airdropAddress` | `"0x1234..."` |
| `NEXT_PUBLIC_TOKEN_ADDRESS`    | `contracts.tokenAddress`   | `"0x5678..."` |
| `NEXT_PUBLIC_MERKLE_ROOT`      | `contracts.merkleRoot`     | `"0x0000..."` |

#### Distribution Settings

| Old Environment Variable       | New JSON Location              | Example Value            |
| ------------------------------ | ------------------------------ | ------------------------ |
| `NEXT_PUBLIC_TOTAL_AMOUNT`     | `distribution.totalAmount`     | `"10000000"`             |
| `NEXT_PUBLIC_TOTAL_RECIPIENTS` | `distribution.totalRecipients` | `5000`                   |
| `NEXT_PUBLIC_CLAIM_START_DATE` | `distribution.claimStartDate`  | `"2024-01-01T00:00:00Z"` |
| `NEXT_PUBLIC_CLAIM_END_DATE`   | `distribution.claimEndDate`    | `"2024-12-31T23:59:59Z"` |

#### Token Information

| Old Environment Variable     | New JSON Location | Example Value |
| ---------------------------- | ----------------- | ------------- |
| `NEXT_PUBLIC_TOKEN_SYMBOL`   | `token.symbol`    | `"SAPIEN"`    |
| `NEXT_PUBLIC_TOKEN_DECIMALS` | `token.decimals`  | `18`          |

**Complete Migration Example:**

```bash
# Old .env
NEXT_PUBLIC_CAMPAIGN_NAME="Friends of Sapien Airdrop"
NEXT_PUBLIC_CAMPAIGN_DESCRIPTION="Rewarding early supporters and contributors to the ecosystem"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x1234567890123456789012345678901234567890"
NEXT_PUBLIC_TOKEN_ADDRESS="0x0987654321098765432109876543210987654321"
NEXT_PUBLIC_MERKLE_ROOT="0x0000000000000000000000000000000000000000000000000000000000000000"
NEXT_PUBLIC_TOKEN_SYMBOL="SAPIEN"
NEXT_PUBLIC_TOKEN_DECIMALS=18
NEXT_PUBLIC_TOTAL_AMOUNT="10000000"
NEXT_PUBLIC_TOTAL_RECIPIENTS=5000
NEXT_PUBLIC_CLAIM_START_DATE="2024-01-01T00:00:00Z"
NEXT_PUBLIC_CLAIM_END_DATE="2024-12-31T23:59:59Z"
```

```json
// New config/campaign.config.json
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

### Step 4: Update Environment Variables

Keep only sensitive data in your environment variables file. Create or update `.env.local`:

```bash
# =============================================================================
# Sablier Airdrop Template - Sensitive Environment Variables Only
# =============================================================================

# REQUIRED: Web3 API Keys
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# OPTIONAL: Analytics & Monitoring (if analytics.enableGoogleAnalytics = true)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# OPTIONAL: Error Monitoring (if analytics.enableSentryErrorMonitoring = true)
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# OPTIONAL: Deployment Tokens
# VERCEL_ORG_ID=your_vercel_org_id
# VERCEL_PROJECT_ID=your_vercel_project_id
# VERCEL_TOKEN=your_vercel_token
```

### Step 5: Remove Migrated Variables

Remove the migrated environment variables from your `.env.local` file. These are now configured in JSON:

**Variables to Remove:**

- `NEXT_PUBLIC_DEMO_MODE`
- `NEXT_PUBLIC_ENABLE_ENS`
- `NEXT_PUBLIC_ENABLE_SOCIAL_SHARING`
- `NEXT_PUBLIC_DEFAULT_CHAIN_ID`
- `NEXT_PUBLIC_ENABLE_*` (all network flags)
- `NEXT_PUBLIC_CAMPAIGN_NAME`
- `NEXT_PUBLIC_CAMPAIGN_DESCRIPTION`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_MERKLE_ROOT`
- `NEXT_PUBLIC_TOKEN_SYMBOL`
- `NEXT_PUBLIC_TOKEN_DECIMALS`
- `NEXT_PUBLIC_TOTAL_AMOUNT`
- `NEXT_PUBLIC_TOTAL_RECIPIENTS`
- `NEXT_PUBLIC_CLAIM_START_DATE`
- `NEXT_PUBLIC_CLAIM_END_DATE`

### Step 6: Validate Configuration

Test your new configuration:

```bash
# Run configuration validation
npm run dev

# Or run validation specifically
just full-check
```

If validation fails, check the console for specific error messages and fix any configuration issues.

## Configuration Templates

### Minimal Production Configuration

**`config/app.config.json`** (Production):

```json
{
  "analytics": {
    "enableGoogleAnalytics": true,
    "enableSentryErrorMonitoring": true
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
      "base": false,
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

### Multi-Chain Configuration

**`config/app.config.json`** (Multi-chain):

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
    "defaultChainId": 8453,
    "enabled": {
      "arbitrum": true,
      "base": true,
      "ethereum": true,
      "optimism": true,
      "polygon": false
    }
  },
  "ui": {
    "theme": "default"
  }
}
```

### Development Configuration

**`config/app.config.json`** (Development):

```json
{
  "analytics": {
    "enableGoogleAnalytics": false,
    "enableSentryErrorMonitoring": false
  },
  "features": {
    "demoMode": true,
    "enableEnsResolution": true,
    "enableSocialSharing": true
  },
  "networks": {
    "defaultChainId": 11155111,
    "enabled": {
      "arbitrum": false,
      "base": false,
      "ethereum": true,
      "optimism": false,
      "polygon": false
    }
  },
  "ui": {
    "theme": "dark"
  }
}
```

## Testing Your Migration

### 1. Configuration Validation

```bash
# Start development server to trigger validation
npm run dev

# Look for validation messages in console
```

### 2. Feature Testing

Test each migrated feature:

- [ ] **Demo Mode**: Enable/disable and verify mock data behavior
- [ ] **ENS Resolution**: Test address resolution in UI
- [ ] **Social Sharing**: Verify sharing functionality
- [ ] **Network Selection**: Test all enabled networks
- [ ] **Theme**: Test theme switching if implemented

### 3. Analytics Testing

If analytics are enabled:

- [ ] **Google Analytics**: Check GA4 events in browser dev tools
- [ ] **Sentry**: Test error reporting (intentionally trigger an error)

### 4. Campaign Data

Verify campaign information displays correctly:

- [ ] **Campaign Name**: Check header and metadata
- [ ] **Description**: Verify campaign description text
- [ ] **Token Symbol**: Check token display throughout UI
- [ ] **Distribution Dates**: Verify claim period display
- [ ] **Contract Addresses**: Test contract interactions

## Common Migration Issues

### Issue 1: Configuration Not Loading

**Symptoms:**

- Default values being used instead of configuration
- "Configuration not found" errors

**Solutions:**

1. Ensure JSON files are in correct location (`config/` directory)
2. Verify JSON syntax is valid (use a JSON validator)
3. Check file permissions (readable by application)

### Issue 2: Validation Errors

**Symptoms:**

- Application won't start
- Validation error messages in console

**Solutions:**

1. Check JSON schema compliance (especially patterns and types)
2. Verify date formats are ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
3. Ensure contract addresses are valid hex strings
4. Check numeric values are correct type (number vs string)

### Issue 3: Missing Environment Variables

**Symptoms:**

- API calls failing
- Wallet connection issues

**Solutions:**

1. Ensure required environment variables are still present
2. Check `.env.local` file exists and is properly formatted
3. Restart development server after environment changes

### Issue 4: Type Errors

**Symptoms:**

- TypeScript compilation errors
- Runtime type mismatches

**Solutions:**

1. Run `just tsc-check` to identify type issues
2. Verify configuration matches TypeScript interfaces
3. Check for missing or extra properties

## Rollback Strategy

If migration issues occur, you can quickly rollback:

### Immediate Rollback

1. **Restore Environment Variables**: Copy your backed-up `.env` file
2. **Remove JSON Files**: Temporarily rename JSON config files
3. **Restart Application**: The app will fall back to environment variable mode

### Gradual Migration

1. **Migrate Incrementally**: Start with one configuration section
2. **Test Thoroughly**: Verify each section before continuing
3. **Keep Backups**: Maintain working configurations at each step

## Post-Migration Cleanup

After successful migration:

### 1. Remove Legacy Code

Remove any custom environment variable parsing code that's no longer needed.

### 2. Update Documentation

Update any project-specific documentation that references old environment variables.

### 3. Update CI/CD

Update deployment scripts and CI/CD pipelines to use JSON configuration files.

### 4. Team Communication

Inform team members about:

- New configuration system
- Location of example files
- Environment variable changes
- Validation requirements

## Advanced Migration Topics

### Environment-Specific Configurations

Manage different configurations per environment:

```bash
config/
├── app.config.json           # Default/development
├── app.config.staging.json   # Staging environment
├── app.config.production.json # Production environment
└── campaign.config.json      # Campaign (usually same across envs)
```

### Automated Migration Script

Create a script to automate the migration:

```typescript
// scripts/migrate-config.ts
import fs from "fs";
import path from "path";

function migrateEnvToJson() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf8");

  // Parse environment variables
  const envVars = {};
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key] = value;
    }
  });

  // Transform to JSON configuration
  const appConfig = {
    features: {
      demoMode: envVars.NEXT_PUBLIC_DEMO_MODE === "true",
      enableEnsResolution: envVars.NEXT_PUBLIC_ENABLE_ENS === "true",
      enableSocialSharing: envVars.NEXT_PUBLIC_ENABLE_SOCIAL_SHARING === "true",
    },
    // ... rest of transformation
  };

  // Write JSON files
  fs.writeFileSync(path.join(process.cwd(), "config/app.config.json"), JSON.stringify(appConfig, null, 2));
}
```

### Configuration Versioning

Handle configuration schema changes over time:

```typescript
interface ConfigV1 {
  version: 1;
  // ... v1 properties
}

interface ConfigV2 {
  version: 2;
  // ... v2 properties
}

function migrateConfig(config: ConfigV1): ConfigV2 {
  return {
    version: 2,
    // ... migration logic
  };
}
```

## Support

If you encounter issues during migration:

1. **Check Configuration Reference**: Review [`CONFIGURATION.md`](./CONFIGURATION.md)
2. **Validate JSON Syntax**: Use online JSON validators
3. **Check Troubleshooting**: Review [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)
4. **Review Examples**: Compare with example configuration files
5. **Test Incrementally**: Migrate one section at a time
