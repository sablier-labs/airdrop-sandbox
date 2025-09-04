# Troubleshooting Guide

This guide helps resolve common issues with the JSON configuration system and the Sablier Airdrop Template.

## Configuration Issues

### Configuration Not Loading

**Symptoms:**

- Application shows default values instead of configured settings
- "Configuration not found" errors in console
- Features not working as configured

**Causes & Solutions:**

#### 1. Missing Configuration Files

**Check:**

```bash
ls -la config/
# Should show:
# app.config.json
# campaign.config.json
```

**Fix:**

```bash
# Copy example files if missing
cp config/app.config.example.json config/app.config.json
cp config/campaign.config.example.json config/campaign.config.json
```

#### 2. Invalid JSON Syntax

**Check:**

```bash
# Validate JSON syntax
jq . config/app.config.json
jq . config/campaign.config.json
```

**Common JSON Errors:**

- **Trailing commas**: `"value": true,}` → `"value": true}`
- **Missing quotes**: `{property: "value"}` → `{"property": "value"}`
- **Unescaped quotes**: `"It's working"` → `"It's working"`

**Fix:** Use a JSON validator or IDE with JSON support to identify and fix syntax errors.

#### 3. File Permissions

**Check:**

```bash
ls -la config/*.json
# Should be readable (r--) by your user
```

**Fix:**

```bash
chmod 644 config/*.json
```

### Configuration Validation Errors

**Symptoms:**

- Application won't start
- Validation error messages in console
- TypeScript compilation errors

#### Contract Address Validation

**Error:**

```
Invalid contract address format
```

**Fix:** Ensure addresses match the pattern `^0x[a-fA-F0-9]{40}$`:

```json
{
  "contracts": {
    "airdropAddress": "0x1234567890123456789012345678901234567890",
    "tokenAddress": "0x0987654321098765432109876543210987654321"
  }
}
```

#### Merkle Root Validation

**Error:**

```
Invalid merkle root format
```

**Fix:** Ensure merkle root matches the pattern `^0x[a-fA-F0-9]{64}$`:

```json
{
  "contracts": {
    "merkleRoot": "0x0000000000000000000000000000000000000000000000000000000000000000"
  }
}
```

#### Date Format Validation

**Error:**

```
Invalid date format
```

**Fix:** Use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`):

```json
{
  "distribution": {
    "claimStartDate": "2024-01-01T00:00:00Z",
    "claimEndDate": "2024-12-31T23:59:59Z"
  }
}
```

#### Chain ID Validation

**Error:**

```
Unsupported chain ID
```

**Fix:** Use supported chain IDs:

```json
{
  "networks": {
    "defaultChainId": 1, // 1, 8453, 42161, 10, or 137
    "enabled": {
      "ethereum": true // corresponds to chain ID 1
    }
  }
}
```

**Supported Networks:**

- `1`: Ethereum Mainnet
- `8453`: Base
- `42161`: Arbitrum One
- `10`: Optimism
- `137`: Polygon

### Environment Variable Issues

#### Missing Required Variables

**Error:**

```
Missing required environment variable: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

**Fix:** Add to `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_api_key_here
```

#### Analytics Configuration Mismatch

**Error:**

```
GA_MEASUREMENT_ID required when analytics.enableGoogleAnalytics is true
```

**Fix:** Either disable analytics in JSON config:

```json
{
  "analytics": {
    "enableGoogleAnalytics": false
  }
}
```

Or add the environment variable:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Application Issues

### Wallet Connection Problems

#### WalletConnect Issues

**Error:**

```
WalletConnect initialization failed
```

**Diagnosis:**

```bash
# Check project ID is set
echo $NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

**Fix:**

1. Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id
   ```
3. Restart the development server

#### Network Configuration Issues

**Error:**

```
Unsupported network
```

**Fix:** Check network configuration in `config/app.config.json`:

```json
{
  "networks": {
    "defaultChainId": 1,
    "enabled": {
      "ethereum": true,
      "base": true,
      "arbitrum": false,
      "optimism": false,
      "polygon": false
    }
  }
}
```

### Eligibility Check Failures

#### Contract Connection Issues

**Error:**

```
Failed to read contract
```

**Diagnosis:**

1. Check contract addresses in `config/campaign.config.json`
2. Verify network configuration
3. Check Alchemy API key

**Fix:**

```json
{
  "contracts": {
    "airdropAddress": "0x...actual_deployed_contract_address",
    "tokenAddress": "0x...actual_token_contract_address"
  }
}
```

#### Merkle Proof Issues

**Error:**

```
Invalid proof
```

**Diagnosis:**

1. Check if address is in eligible list
2. Verify merkle root matches deployed contract
3. Check proof generation logic

**Fix:** Regenerate merkle tree and update configuration:

```json
{
  "contracts": {
    "merkleRoot": "0x...updated_merkle_root"
  }
}
```

### Feature Not Working

#### Demo Mode

**Issue:** Demo mode not activating

**Check:**

```json
{
  "features": {
    "demoMode": true
  }
}
```

**Fix:** Restart development server after configuration change

#### ENS Resolution

**Issue:** ENS names not resolving

**Check:**

1. Feature is enabled:
   ```json
   {
     "features": {
       "enableEnsResolution": true
     }
   }
   ```
2. Network supports ENS (Ethereum Mainnet)

#### Social Sharing

**Issue:** Share button not appearing

**Check:**

```json
{
  "features": {
    "enableSocialSharing": true
  }
}
```

## Development Issues

### Build Errors

#### TypeScript Compilation Errors

**Error:**

```
Type error: Property 'xyz' does not exist
```

**Fix:**

1. Run type checking:
   ```bash
   just tsc-check
   ```
2. Update configuration to match TypeScript interfaces
3. Regenerate types if needed

#### Import Resolution Issues

**Error:**

```
Module not found: Can't resolve '@/lib/utils/config'
```

**Fix:**

1. Check file exists: `ls -la lib/utils/config.ts`
2. Verify TypeScript path mapping in `tsconfig.json`
3. Restart development server

### Runtime Errors

#### Configuration Loading Errors

**Error:**

```
Failed to load configuration
```

**Debug Steps:**

1. Check browser console for detailed errors
2. Verify file permissions
3. Test JSON validity
4. Check network requests in browser dev tools

**Fix:**

```bash
# Validate configuration
npm run dev 2>&1 | grep -i config

# Check file access
curl http://localhost:3000/config/app.config.json
```

## Migration Issues

### Environment Variable Conflicts

**Issue:** Old environment variables taking precedence

**Fix:**

1. Remove migrated variables from `.env.local`
2. Restart development server
3. Clear browser cache

### Missing Configuration

**Issue:** Features stopped working after migration

**Diagnosis:** Compare old `.env` with new JSON configuration to identify missing settings.

**Fix:** Create a migration checklist:

```bash
# Check each migrated setting
echo "Demo mode: $(grep -o '"demoMode": [^,]*' config/app.config.json)"
echo "ENS: $(grep -o '"enableEnsResolution": [^,]*' config/app.config.json)"
echo "Networks: $(grep -A 10 '"enabled"' config/app.config.json)"
```

## Performance Issues

### Slow Configuration Loading

**Issue:** Application startup slow

**Cause:** Large configuration files or network latency

**Fix:**

1. Minimize configuration file size
2. Use local development server
3. Check for unnecessary nested objects

### Memory Usage

**Issue:** High memory consumption

**Cause:** Configuration validation running repeatedly

**Fix:**

1. Cache configuration after first load
2. Use environment-specific configurations
3. Monitor validation frequency

## Testing Issues

### E2E Test Failures

**Issue:** Tests failing with configuration errors

**Fix:**

1. Use test-specific configuration:
   ```bash
   cp config/app.config.json config/app.config.test.json
   ```
2. Override configuration in test environment
3. Mock configuration loading

### Unit Test Issues

**Issue:** Configuration-dependent tests failing

**Fix:**

```typescript
// Mock configuration in tests
jest.mock("@/lib/utils/config", () => ({
  getAppConfig: () => mockAppConfig,
  getCampaignConfig: () => mockCampaignConfig,
}));
```

## Deployment Issues

### Production Build Failures

**Error:**

```
Configuration validation failed in production build
```

**Fix:**

1. Ensure production configuration files exist
2. Validate all configuration before deployment
3. Check environment-specific settings

### Environment-Specific Issues

**Issue:** Different behavior across environments

**Solution:** Use environment-specific configuration files:

```bash
config/
├── app.config.json              # Development
├── app.config.staging.json      # Staging
├── app.config.production.json   # Production
└── campaign.config.json         # Same across environments
```

## Debugging Tools

### Configuration Validation Script

Create `scripts/validate-config.js`:

```javascript
const fs = require("fs");

function validateConfig() {
  try {
    const appConfig = JSON.parse(fs.readFileSync("config/app.config.json", "utf8"));
    const campaignConfig = JSON.parse(fs.readFileSync("config/campaign.config.json", "utf8"));

    console.log("✅ Configuration files are valid JSON");
    console.log("App config keys:", Object.keys(appConfig));
    console.log("Campaign config keys:", Object.keys(campaignConfig));

    return true;
  } catch (error) {
    console.error("❌ Configuration validation failed:", error.message);
    return false;
  }
}

validateConfig();
```

### Environment Check Script

Create `scripts/check-env.js`:

```javascript
const requiredVars = ["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", "NEXT_PUBLIC_ALCHEMY_API_KEY"];

const missing = requiredVars.filter((varName) => !process.env[varName]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:", missing);
  process.exit(1);
} else {
  console.log("✅ All required environment variables are set");
}
```

### Development Debugging

Add debug logging to configuration loading:

```typescript
// lib/utils/config.ts
export function getAppConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    console.debug("✅ App config loaded:", Object.keys(config));
    return config;
  } catch (error) {
    console.error("❌ Failed to load app config:", error);
    throw error;
  }
}
```

## Getting Help

### Information to Provide

When seeking help, provide:

1. **Error Message**: Full error text and stack trace
2. **Configuration Files**: Relevant sections (remove sensitive data)
3. **Environment**: Node.js version, OS, browser
4. **Steps to Reproduce**: What actions triggered the issue

### Example Issue Report

```markdown
## Issue Description

Configuration validation failing on startup

## Error Message
```

Invalid contract address format in campaign.config.json

````

## Configuration
```json
{
  "contracts": {
    "airdropAddress": "0x123..." // truncated for privacy
  }
}
````

## Environment

- Node.js: v20.10.0
- OS: macOS 14.0
- Browser: Chrome 120

## Steps to Reproduce

1. Copy example configuration files
2. Update contract addresses
3. Run `npm run dev`

````

### Community Resources

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/sablier-labs/airdrop-template/issues)
- **Discord**: [Join the Sablier community](https://discord.gg/sablier)
- **Documentation**: [Configuration Reference](./CONFIGURATION.md)
- **Migration Guide**: [Environment to JSON Migration](./MIGRATION.md)

### Professional Support

For production deployments and custom development:
- **Email**: [hello@sablier.com](mailto:hello@sablier.com)
- **Documentation**: [Official Sablier Docs](https://docs.sablier.com)

## Prevention Tips

### Best Practices

1. **Always Validate**: Run validation after configuration changes
2. **Version Control**: Commit example files, never commit secrets
3. **Environment Parity**: Use same configuration structure across environments
4. **Regular Updates**: Keep configurations synchronized with application updates
5. **Testing**: Include configuration validation in CI/CD pipelines

### Monitoring

Set up monitoring for configuration-related issues:
```typescript
// Add to application startup
const { isValid, errors } = validateConfig();
if (!isValid) {
  console.error('Configuration validation failed:', errors);
  // Send to monitoring service
  analytics.track('config_validation_failed', { errors });
}
````

### Automation

Automate configuration checks:

```bash
# Add to package.json scripts
{
  "scripts": {
    "config:validate": "node scripts/validate-config.js",
    "config:check-env": "node scripts/check-env.js",
    "predev": "npm run config:validate && npm run config:check-env"
  }
}
```
