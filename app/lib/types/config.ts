import type { Address } from "viem";

/**
 * Supported chain ID (currently only Base)
 */
export type ChainId = 8453;

/**
 * Analytics configuration
 */
export type AnalyticsConfig = {
  /** Enable Google Analytics tracking */
  enableGoogleAnalytics: boolean;
  /** Enable Sentry error monitoring and reporting */
  enableSentryErrorMonitoring: boolean;
};

/**
 * Feature flags configuration
 */
export type FeaturesConfig = {
  /** Enable demo mode with mock data and transactions */
  demoMode: boolean;
  /** Enable ENS name resolution for addresses */
  enableEnsResolution: boolean;
  /** Enable social sharing functionality */
  enableSocialSharing: boolean;
};

/**
 * Network configuration (simplified for single chain)
 */
export type NetworksConfig = {
  /** Chain ID for the application */
  chainId: ChainId;
};

/**
 * UI theme configuration
 */
export type UITheme = "default" | "dark" | "light";

/**
 * UI configuration
 */
export type UIConfig = {
  /** Application theme */
  theme: UITheme;
};

/**
 * Complete application configuration
 */
export type AppConfig = {
  /** Analytics and tracking settings */
  analytics: AnalyticsConfig;
  /** Feature flag settings */
  features: FeaturesConfig;
  /** Blockchain network settings */
  networks: NetworksConfig;
  /** User interface settings */
  ui: UIConfig;
};

/**
 * Campaign information
 */
export type CampaignInfo = {
  /** Campaign description */
  description: string;
  /** Campaign display name */
  name: string;
};

/**
 * Smart contract addresses
 */
export type ContractAddresses = {
  /** Airdrop distributor contract address */
  airdropAddress: Address;
  /** Merkle tree root hash for eligibility verification */
  merkleRoot: `0x${string}`;
  /** Token contract address */
  tokenAddress: Address;
};

/**
 * Distribution configuration
 */
export type DistributionConfig = {
  /** ISO 8601 date string for claim end */
  claimEndDate: string;
  /** ISO 8601 date string for claim start */
  claimStartDate: string;
  /** Total distribution amount as string (for precision) */
  totalAmount: string;
  /** Total number of eligible recipients */
  totalRecipients: number;
};

/**
 * Token information
 */
export type TokenConfig = {
  /** Number of decimal places for the token */
  decimals: number;
  /** Token symbol (e.g., "SAPIEN") */
  symbol: string;
};

/**
 * Campaign configuration
 */
export type CampaignConfig = {
  /** Campaign information */
  campaign: CampaignInfo;
  /** Smart contract addresses */
  contracts: ContractAddresses;
  /** Distribution parameters */
  distribution: DistributionConfig;
  /** Token information */
  token: TokenConfig;
};

/**
 * Environment variable overrides for runtime configuration
 */
export type EnvironmentOverrides = {
  /** Alchemy API key for Web3 provider */
  alchemyApiKey?: string;
  /** Google Analytics measurement ID */
  gaTrackingId?: string;
  /** Sentry DSN for error monitoring */
  sentryDsn?: string;
  /** Vercel deployment configuration */
  vercel: {
    orgId?: string;
    projectId?: string;
    token?: string;
  };
  /** WalletConnect project ID */
  walletConnectProjectId?: string;
};

/**
 * Processed distribution configuration with parsed dates
 */
export type ProcessedDistribution = Omit<DistributionConfig, "claimEndDate" | "claimStartDate"> & {
  /** Parsed claim end date */
  claimEndDate: Date;
  /** Parsed claim start date */
  claimStartDate: Date;
};

/**
 * Fully processed and merged configuration
 */
export type ProcessedConfig = {
  /** Analytics settings */
  analytics: AnalyticsConfig;
  /** Campaign information */
  campaign: CampaignInfo;
  /** Smart contract addresses */
  contracts: ContractAddresses;
  /** Distribution configuration with parsed dates */
  distribution: ProcessedDistribution;
  /** Environment variable overrides */
  environment: EnvironmentOverrides;
  /** Feature flags */
  features: FeaturesConfig;
  /** Network configuration */
  networks: NetworksConfig;
  /** Token information */
  token: TokenConfig;
  /** UI settings */
  ui: UIConfig;
};

/**
 * Configuration validation result
 */
export type ConfigValidationResult = {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
};

/**
 * Configuration loading result
 */
export type ConfigLoadResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fallback?: Partial<T> };

/**
 * Type guard to check if a chain ID is supported
 */
export function isSupportedChainId(chainId: number): chainId is ChainId {
  return chainId === 8453; // Only Base is supported
}

/**
 * Type guard to check if a UI theme is valid
 */
export function isValidUITheme(theme: string): theme is UITheme {
  return theme === "default" || theme === "dark" || theme === "light";
}

/**
 * Common placeholder addresses that should be rejected
 */
const PLACEHOLDER_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000", // Zero address
  "0x1234567890123456789012345678901234567890", // Common placeholder from config
  "0x1111111111111111111111111111111111111111", // Common placeholder
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // Common placeholder
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", // Common placeholder
  "0xcccccccccccccccccccccccccccccccccccccccc", // Common placeholder
  "0xdddddddddddddddddddddddddddddddddddddddd", // Common placeholder
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Common placeholder
  "0xffffffffffffffffffffffffffffffffffffffff", // Common placeholder
]);

/**
 * Type guard to check if an address is valid (non-zero and not a placeholder)
 */
export function isValidAddress(address: string): address is Address {
  const addressPattern = /^0x[a-fA-F0-9]{40}$/;
  const normalizedAddress = address.toLowerCase();
  return addressPattern.test(address) && !PLACEHOLDER_ADDRESSES.has(normalizedAddress);
}

/**
 * Common placeholder hashes that should be rejected
 */
const PLACEHOLDER_HASHES = new Set([
  "0x0000000000000000000000000000000000000000000000000000000000000000", // Zero hash
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12", // Common placeholder from config
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // Max value placeholder
  "0x1111111111111111111111111111111111111111111111111111111111111111", // Common placeholder
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // Common placeholder
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", // Common placeholder
]);

/**
 * Type guard to check if a hash is valid (non-zero and not a placeholder)
 */
export function isValidHash(hash: string): hash is `0x${string}` {
  const hashPattern = /^0x[a-fA-F0-9]{64}$/;
  const normalizedHash = hash.toLowerCase();
  return hashPattern.test(hash) && !PLACEHOLDER_HASHES.has(normalizedHash);
}

/**
 * Type guard to check if a date string is valid ISO 8601 format
 */
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !Number.isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Default configurations for fallback scenarios
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  analytics: {
    enableGoogleAnalytics: false,
    enableSentryErrorMonitoring: false,
  },
  features: {
    demoMode: false,
    enableEnsResolution: true,
    enableSocialSharing: true,
  },
  networks: {
    chainId: 8453, // Base
  },
  ui: {
    theme: "default",
  },
};

/**
 * Required environment variables
 */
export const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
  "NEXT_PUBLIC_ALCHEMY_API_KEY",
] as const;

/**
 * Optional environment variables with validation
 */
export const OPTIONAL_ENV_VARS = [
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_SENTRY_DSN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "VERCEL_TOKEN",
] as const;
