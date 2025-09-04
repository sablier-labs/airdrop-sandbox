import type { Address } from "viem";

/**
 * Supported chain IDs for airdrop campaigns
 */
export type ChainId = 1 | 8453 | 11155111; // mainnet, base, sepolia

/**
 * Campaign timeline configuration
 */
export interface CampaignTimeline {
  /** Campaign announcement date */
  announcementDate: Date;
  /** Campaign start date (when claims become available) */
  claimStartDate: Date;
  /** Campaign end date (when claims are no longer available) */
  claimEndDate: Date;
  /** Grace period end date (final deadline for any remaining claims) */
  gracePeriodEndDate?: Date;
}

/**
 * Token information for the airdrop campaign
 */
export interface TokenInfo {
  /** Token contract address */
  address: Address;
  /** Token symbol (e.g., "SAPIEN") */
  symbol: string;
  /** Token name (e.g., "Sapien Token") */
  name: string;
  /** Number of decimal places */
  decimals: number;
  /** Token logo URL or path */
  logoUrl?: string;
}

/**
 * Contract addresses for a specific chain
 */
export interface ChainContracts {
  /** Merkle distributor contract address */
  distributorContract: Address;
  /** Campaign manager contract address */
  managerContract: Address;
  /** Token contract address */
  tokenContract: Address;
}

/**
 * Distribution statistics and parameters
 */
export interface DistributionInfo {
  /** Total number of tokens to be distributed */
  totalAmount: bigint;
  /** Total number of eligible recipients */
  totalRecipients: number;
  /** Average amount per recipient */
  averageAmount: bigint;
  /** Minimum claimable amount */
  minAmount: bigint;
  /** Maximum claimable amount */
  maxAmount: bigint;
  /** Merkle tree root hash */
  merkleRoot: `0x${string}`;
}

/**
 * Complete airdrop campaign configuration
 */
export interface AirdropCampaign {
  /** Unique campaign identifier */
  id: string;
  /** Campaign display name */
  name: string;
  /** Campaign description */
  description: string;
  /** Detailed campaign information */
  longDescription?: string;
  /** Token information */
  token: TokenInfo;
  /** Timeline configuration */
  timeline: CampaignTimeline;
  /** Distribution parameters */
  distribution: DistributionInfo;
  /** Contract addresses by chain ID */
  contracts: Record<ChainId, ChainContracts>;
  /** Default chain for the campaign */
  defaultChainId: ChainId;
  /** Whether the campaign is currently active */
  isActive: boolean;
  /** Campaign website or landing page */
  websiteUrl?: string;
  /** Social media and external links */
  socialLinks?: {
    discord?: string;
    telegram?: string;
    twitter?: string;
  };
}

/**
 * Example airdrop campaign configuration for Friends of Sapien
 * Based on the Sablier campaign screenshot data
 */
export const sapienAirdropCampaign: AirdropCampaign = {
  contracts: {
    1: {
      // Mainnet
      distributorContract: "0xab5111111111111111111111111111111111137a3",
      managerContract: "0x60c011111111111111111111111111111111116815",
      tokenContract: "0x1234567890123456789012345678901234567890",
    },
    8453: {
      // Base
      distributorContract: "0xab5222222222222222222222222222222222237a3",
      managerContract: "0x60c022222222222222222222222222222222226815",
      tokenContract: "0x2345678901234567890123456789012345678901",
    },
    11155111: {
      // Sepolia
      distributorContract: "0xab5333333333333333333333333333333333337a3",
      managerContract: "0x60c033333333333333333333333333333333336815",
      tokenContract: "0x3456789012345678901234567890123456789012",
    },
  },

  defaultChainId: 8453, // Base
  description: "Rewarding early supporters and contributors to the Sapien ecosystem",

  distribution: {
    averageAmount: BigInt("486315789473684210526"), // ~486.32 tokens average
    maxAmount: BigInt("10000000000000000000000"), // 10,000 tokens maximum
    merkleRoot: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12", // Replace with actual merkle root
    minAmount: BigInt("100000000000000000000"), // 100 tokens minimum
    totalAmount: BigInt("5080000000000000000000000"), // 5.08M tokens (18 decimals)
    totalRecipients: 10450,
  },
  id: "friends-of-sapien-2024",
  isActive: true,
  longDescription:
    "This airdrop recognizes the valuable contributions of our early community members, " +
    "developers, and supporters who helped build the foundation of Sapien. Recipients include " +
    "early users, governance participants, developers, and ecosystem contributors.",
  name: "Friends of Sapien",
  socialLinks: {
    discord: "https://discord.gg/sapien",
    telegram: "https://t.me/sapiennetwork",
    twitter: "https://twitter.com/sapiennetwork",
  },

  timeline: {
    announcementDate: new Date("2024-01-15T00:00:00Z"),
    claimEndDate: new Date("2024-08-01T23:59:59Z"),
    claimStartDate: new Date("2024-02-01T00:00:00Z"),
    gracePeriodEndDate: new Date("2024-09-01T23:59:59Z"),
  },

  token: {
    address: "0x1234567890123456789012345678901234567890", // Replace with actual token address
    decimals: 18,
    logoUrl: "/images/tokens/sapien.png",
    name: "Sapien Token",
    symbol: "SAPIEN",
  },
  websiteUrl: "https://sapien.network",
};

/**
 * Get contract addresses for a specific chain
 */
export const getContractsForChain = (chainId: ChainId): ChainContracts | undefined => {
  return sapienAirdropCampaign.contracts[chainId];
};

/**
 * Check if a chain is supported for the current campaign
 */
export const isSupportedChain = (chainId: number): chainId is ChainId => {
  return chainId in sapienAirdropCampaign.contracts;
};

/**
 * Get the distributor contract address for a specific chain
 */
export const getDistributorContract = (chainId: ChainId): Address | undefined => {
  return sapienAirdropCampaign.contracts[chainId]?.distributorContract;
};

/**
 * Get the manager contract address for a specific chain
 */
export const getManagerContract = (chainId: ChainId): Address | undefined => {
  return sapienAirdropCampaign.contracts[chainId]?.managerContract;
};

/**
 * Check if the campaign is currently in the claim period
 */
export const isCampaignActive = (): boolean => {
  const now = new Date();
  const { claimStartDate, claimEndDate } = sapienAirdropCampaign.timeline;
  return now >= claimStartDate && now <= claimEndDate;
};

/**
 * Check if the campaign is in the grace period
 */
export const isInGracePeriod = (): boolean => {
  const now = new Date();
  const { claimEndDate, gracePeriodEndDate } = sapienAirdropCampaign.timeline;

  if (!gracePeriodEndDate) return false;
  return now > claimEndDate && now <= gracePeriodEndDate;
};

/**
 * Get time remaining until claim deadline
 */
export const getTimeUntilDeadline = (): number => {
  const now = Date.now();
  const { claimEndDate, gracePeriodEndDate } = sapienAirdropCampaign.timeline;

  const deadline = gracePeriodEndDate || claimEndDate;
  return deadline.getTime() - now;
};

/**
 * Format token amount for display
 */
export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === 0n) {
    return whole.toString();
  }

  const fractional = remainder.toString().padStart(decimals, "0");
  const trimmedFractional = fractional.replace(/0+$/, "");

  return trimmedFractional.length > 0
    ? `${whole.toString()}.${trimmedFractional}`
    : whole.toString();
};
