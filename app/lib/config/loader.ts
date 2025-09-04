import type {
  AppConfig,
  CampaignConfig,
  ChainId,
  ConfigLoadResult,
  ConfigValidationResult,
  EnvironmentOverrides,
  ProcessedConfig,
  ProcessedDistribution,
} from "@/app/lib/types/config";
import {
  DEFAULT_APP_CONFIG,
  isSupportedChainId,
  isValidAddress,
  isValidHash,
  isValidUITheme,
} from "@/app/lib/types/config";

// Import JSON configs using require for compatibility
import appConfig from "../../config/app.config.json";
import campaignConfig from "../../config/campaign.config.json";

/**
 * Configuration cache to avoid repeated processing
 */
const configCache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Cache TTL in milliseconds (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Validate app configuration structure
 */
function isValidAppConfig(data: unknown): data is AppConfig {
  if (!data || typeof data !== "object") return false;

  const config = data as Record<string, unknown>;

  return (
    typeof config.analytics === "object" &&
    config.analytics !== null &&
    typeof (config.analytics as Record<string, unknown>).enableGoogleAnalytics === "boolean" &&
    typeof (config.analytics as Record<string, unknown>).enableSentryErrorMonitoring ===
      "boolean" &&
    typeof config.features === "object" &&
    config.features !== null &&
    typeof (config.features as Record<string, unknown>).demoMode === "boolean" &&
    typeof (config.features as Record<string, unknown>).enableEnsResolution === "boolean" &&
    typeof (config.features as Record<string, unknown>).enableSocialSharing === "boolean" &&
    typeof config.networks === "object" &&
    config.networks !== null &&
    typeof (config.networks as Record<string, unknown>).chainId === "number" &&
    typeof config.ui === "object" &&
    config.ui !== null &&
    typeof (config.ui as Record<string, unknown>).theme === "string"
  );
}

/**
 * Validate campaign configuration structure
 */
function isValidCampaignConfig(data: unknown): data is CampaignConfig {
  if (!data || typeof data !== "object") return false;

  const config = data as Record<string, unknown>;

  return (
    typeof config.campaign === "object" &&
    config.campaign !== null &&
    typeof (config.campaign as Record<string, unknown>).name === "string" &&
    typeof (config.campaign as Record<string, unknown>).description === "string" &&
    typeof config.contracts === "object" &&
    config.contracts !== null &&
    typeof (config.contracts as Record<string, unknown>).airdropAddress === "string" &&
    typeof (config.contracts as Record<string, unknown>).tokenAddress === "string" &&
    typeof (config.contracts as Record<string, unknown>).merkleRoot === "string" &&
    typeof config.distribution === "object" &&
    config.distribution !== null &&
    typeof (config.distribution as Record<string, unknown>).claimStartDate === "string" &&
    typeof (config.distribution as Record<string, unknown>).claimEndDate === "string" &&
    typeof (config.distribution as Record<string, unknown>).totalAmount === "string" &&
    typeof (config.distribution as Record<string, unknown>).totalRecipients === "number" &&
    typeof config.token === "object" &&
    config.token !== null &&
    typeof (config.token as Record<string, unknown>).symbol === "string" &&
    typeof (config.token as Record<string, unknown>).decimals === "number"
  );
}

/**
 * Load application configuration
 */
export async function loadAppConfig(): Promise<ConfigLoadResult<AppConfig>> {
  try {
    // Validate the imported data structure
    if (!isValidAppConfig(appConfig)) {
      return {
        error: "Invalid app configuration structure",
        fallback: DEFAULT_APP_CONFIG,
        success: false,
      };
    }

    return { data: appConfig as AppConfig, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Failed to load app config: ${errorMessage}`,
      fallback: DEFAULT_APP_CONFIG,
      success: false,
    };
  }
}

/**
 * Load campaign configuration
 */
export async function loadCampaignConfig(): Promise<ConfigLoadResult<CampaignConfig>> {
  try {
    // Validate the imported data structure
    if (!isValidCampaignConfig(campaignConfig)) {
      return {
        error: "Invalid campaign configuration structure",
        fallback: campaignConfig as Partial<CampaignConfig>,
        success: false,
      };
    }

    return { data: campaignConfig as CampaignConfig, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Failed to load campaign config: ${errorMessage}`,
      success: false,
    };
  }
}

/**
 * Load sensitive environment variables only
 * Non-sensitive configuration is now handled via JSON config files
 */
export function loadEnvironmentOverrides(): EnvironmentOverrides {
  return {
    // API keys and sensitive tokens only
    alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,

    // Analytics and monitoring (sensitive tracking IDs)
    gaTrackingId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Vercel deployment tokens (build-time only, not client-side)
    vercel: {
      orgId: process.env.VERCEL_ORG_ID,
      projectId: process.env.VERCEL_PROJECT_ID,
      token: process.env.VERCEL_TOKEN,
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  };
}

/**
 * Merge configurations and process data types
 */
function mergeAndProcessConfigs(
  appConfig: AppConfig,
  campaignConfig: CampaignConfig,
  environmentOverrides: EnvironmentOverrides,
): ProcessedConfig {
  // Apply environment overrides to app config
  const mergedAppConfig: AppConfig = {
    ...appConfig,
    features: {
      ...appConfig.features,
      // Demo mode now configured in JSON - environment variable removed
      demoMode: appConfig.features.demoMode,
    },
  };

  // Process distribution dates
  const processedDistribution: ProcessedDistribution = {
    ...campaignConfig.distribution,
    claimEndDate: new Date(campaignConfig.distribution.claimEndDate),
    claimStartDate: new Date(campaignConfig.distribution.claimStartDate),
  };

  return {
    analytics: mergedAppConfig.analytics,
    campaign: campaignConfig.campaign,
    contracts: campaignConfig.contracts,
    distribution: processedDistribution,
    environment: environmentOverrides,
    features: mergedAppConfig.features,
    networks: mergedAppConfig.networks,
    token: campaignConfig.token,
    ui: mergedAppConfig.ui,
  };
}

/**
 * Validate the complete configuration
 */
export function validateConfiguration(config: ProcessedConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required environment variables
  if (!config.environment.walletConnectProjectId) {
    errors.push("Missing required environment variable: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
  }

  if (!config.environment.alchemyApiKey) {
    errors.push("Missing required environment variable: NEXT_PUBLIC_ALCHEMY_API_KEY");
  }

  // Validate contract addresses
  if (!isValidAddress(config.contracts.airdropAddress)) {
    errors.push("Invalid airdrop contract address - must be a valid non-zero Ethereum address");
  }

  if (!isValidAddress(config.contracts.tokenAddress)) {
    errors.push("Invalid token contract address - must be a valid non-zero Ethereum address");
  }

  if (!isValidHash(config.contracts.merkleRoot)) {
    errors.push("Invalid merkle root - must be a valid 32-byte hash");
  }

  // Validate network configuration
  if (!isSupportedChainId(config.networks.chainId)) {
    errors.push(`Unsupported chain ID: ${config.networks.chainId}`);
  }

  // Validate UI theme
  if (!isValidUITheme(config.ui.theme)) {
    errors.push(`Invalid UI theme: ${config.ui.theme}. Must be "default", "dark", or "light"`);
  }

  // Validate dates
  if (config.distribution.claimStartDate >= config.distribution.claimEndDate) {
    errors.push("Claim start date must be before claim end date");
  }

  const now = new Date();
  if (config.distribution.claimEndDate < now) {
    warnings.push("Claim period has ended");
  }

  if (config.distribution.claimStartDate > now) {
    warnings.push("Claim period has not started yet");
  }

  // Validate token configuration
  if (config.token.decimals < 0 || config.token.decimals > 77) {
    errors.push("Token decimals must be between 0 and 77");
  }

  if (!config.token.symbol || config.token.symbol.length === 0) {
    errors.push("Token symbol is required");
  }

  if (config.token.symbol.length > 11) {
    warnings.push(
      "Token symbol is longer than 11 characters - may not display properly in some wallets",
    );
  }

  // Validate distribution amounts
  if (config.distribution.totalRecipients <= 0) {
    errors.push("Total recipients must be greater than 0");
  }

  try {
    const totalAmount = BigInt(config.distribution.totalAmount);
    if (totalAmount <= 0n) {
      errors.push("Total amount must be greater than 0");
    }
  } catch {
    errors.push("Total amount must be a valid number string");
  }

  // Check analytics configuration
  if (config.analytics.enableGoogleAnalytics && !config.environment.gaTrackingId) {
    warnings.push("Google Analytics is enabled but no tracking ID is provided");
  }

  if (config.analytics.enableSentryErrorMonitoring && !config.environment.sentryDsn) {
    warnings.push("Sentry error monitoring is enabled but no DSN is provided");
  }

  return {
    errors,
    isValid: errors.length === 0,
    warnings,
  };
}

/**
 * Load and validate the complete configuration
 */
export async function loadConfiguration(): Promise<ConfigLoadResult<ProcessedConfig>> {
  const cacheKey = "processed-config";
  const cached = configCache.get(cacheKey);

  // Check if we have valid cached data
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.data as ProcessedConfig, success: true };
  }

  try {
    // Load configurations in parallel
    const [appResult, campaignResult] = await Promise.all([loadAppConfig(), loadCampaignConfig()]);

    // Handle app config loading errors
    if (!appResult.success) {
      if (!appResult.fallback) {
        return {
          error: `Failed to load app configuration: ${appResult.error}`,
          success: false,
        };
      }
      console.warn(`App config loading failed, using fallback: ${appResult.error}`);
    }

    // Handle campaign config loading errors
    if (!campaignResult.success) {
      return {
        error: `Failed to load campaign configuration: ${campaignResult.error}`,
        success: false,
      };
    }

    const appConfig = appResult.success ? appResult.data : (appResult.fallback as AppConfig);
    const campaignConfig = campaignResult.data;
    const environmentOverrides = loadEnvironmentOverrides();

    // Merge and process configurations
    const processedConfig = mergeAndProcessConfigs(appConfig, campaignConfig, environmentOverrides);

    // Validate the complete configuration
    const validation = validateConfiguration(processedConfig);

    if (!validation.isValid) {
      return {
        error: `Configuration validation failed: ${validation.errors.join(", ")}`,
        fallback: processedConfig,
        success: false,
      };
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn("Configuration warnings:", validation.warnings);
    }

    // Cache the result
    configCache.set(cacheKey, { data: processedConfig, timestamp: Date.now() });

    return {
      data: processedConfig,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Unexpected error during configuration loading: ${errorMessage}`,
      success: false,
    };
  }
}

/**
 * Get configuration with error handling and fallbacks
 */
export async function getConfiguration(): Promise<ProcessedConfig> {
  const result = await loadConfiguration();

  if (!result.success) {
    if (result.fallback) {
      console.error("Configuration loading failed, using fallback:", result.error);
      return result.fallback as ProcessedConfig;
    }

    throw new Error(`Failed to load configuration: ${result.error}`);
  }

  return result.data;
}

/**
 * Clear configuration cache (useful for testing or hot reloading)
 */
export function clearConfigCache(): void {
  configCache.clear();
}

/**
 * Check if demo mode is enabled
 */
export async function isDemoMode(): Promise<boolean> {
  try {
    const config = await getConfiguration();
    return config.features.demoMode;
  } catch {
    // Fallback to false if config loading fails
    console.warn("Failed to load configuration for demo mode check, defaulting to false");
    return false;
  }
}

/**
 * Get configured chain ID
 */
export async function getConfiguredChainId(): Promise<ChainId> {
  const config = await getConfiguration();
  return config.networks.chainId;
}

/**
 * Check if a chain ID matches the configured chain
 */
export async function isConfiguredChain(chainId: number): Promise<boolean> {
  const config = await getConfiguration();
  return config.networks.chainId === chainId;
}
