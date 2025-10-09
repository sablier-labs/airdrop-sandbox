import type { Address, Hash } from "viem";
import { getAddress } from "viem";
import { base } from "viem/chains";

/**
 * Distribution type for the campaign
 *
 * - instant: Tokens are fully claimable immediately (MerkleInstant)
 * - linear: Tokens unlock linearly over time (MerkleLinear)
 * - tranched: Tokens unlock in discrete tranches (MerkleTranched)
 */
export type DistributionType = "instant" | "linear" | "tranched";

/**
 * Campaign configuration interface
 *
 * This defines all parameters needed to run an airdrop campaign using
 * Sablier's Merkle distribution contracts.
 */
export interface CampaignConfig {
  // CUSTOMIZE: The deployed MerkleInstant/Linear/Tranched contract address
  // This is the contract that holds the campaign state and merkle root
  contractAddress: Address;

  // CUSTOMIZE: Chain ID where the campaign contract is deployed
  // Examples: 1 (Ethereum), 8453 (Base), 42161 (Arbitrum)
  chainId: number;

  // CUSTOMIZE: Human-readable name for this campaign
  // Used for UI display and analytics
  campaignName: string;

  // CUSTOMIZE: The ERC-20 token being distributed
  // This is the token that recipients will claim
  tokenAddress: Address;

  // CUSTOMIZE: Token symbol for display (e.g., "USDC", "DAI", "SABLIER")
  tokenSymbol: string;

  // CUSTOMIZE: Token decimals (usually 6 or 18)
  // Required for proper amount formatting and display
  tokenDecimals: number;

  // CUSTOMIZE: Total amount of tokens allocated to this campaign
  // Expressed in token's smallest unit (e.g., wei for 18 decimals)
  // Example: 1000000000000000000n for 1 token with 18 decimals
  totalAmount: bigint;

  // CUSTOMIZE: Merkle root of the distribution tree
  // Generated from the recipient list using Sablier's merkle tree utilities
  // This is the cryptographic proof that validates all claims
  merkleRoot: Hash;

  // CUSTOMIZE: Fee required to claim (in native token, e.g., ETH, wei)
  // Set to 0n for free claims. Used to cover gas or protocol fees.
  claimFee: bigint;

  // CUSTOMIZE: Unix timestamp when the campaign expires
  // After this time, unclaimed tokens can be reclaimed by the campaign creator
  // Example: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 (30 days from now)
  expiresAt: number;

  // CUSTOMIZE: Type of distribution mechanism
  // Determines which Sablier contract is being used
  distributionType: DistributionType;

  // CUSTOMIZE (Optional): For linear/tranched campaigns, specify unlock parameters
  // Linear: startTime and duration for linear unlock
  // Tranched: array of unlock tranches with timestamps and percentages
  unlockSchedule?: {
    startTime?: number;
    duration?: number;
    tranches?: Array<{
      timestamp: number;
      percentage: number;
    }>;
  };
}

/**
 * Default campaign configuration
 *
 * IMPORTANT: This is an example configuration using Base testnet.
 * You MUST customize all values for your actual campaign.
 *
 * To deploy your own campaign:
 * 1. Deploy a MerkleInstant/Linear/Tranched contract via Sablier factory
 * 2. Generate merkle tree from your recipient list
 * 3. Update all values below with your campaign parameters
 * 4. Fund the contract with tokens
 */
export const defaultCampaignConfig: CampaignConfig = {
  // CUSTOMIZE: Give your campaign a meaningful name
  campaignName: "Example Airdrop Campaign",

  // CUSTOMIZE: Update to match your deployment chain
  chainId: base.id, // Base mainnet

  // CUSTOMIZE: Claim fee (0 for free claims)
  claimFee: 0n,
  // CUSTOMIZE: Replace with your deployed campaign contract address
  // This example uses a placeholder address on Base
  contractAddress: getAddress("0x0000000000000000000000000000000000000000"),

  // CUSTOMIZE: Distribution type
  // Change to 'linear' or 'tranched' if using those contract types
  distributionType: "instant",

  // CUSTOMIZE: Expiration timestamp
  // This example: approximately 90 days from project creation (Oct 9, 2025)
  // Calculate: Math.floor(Date.now() / 1000) + days * 24 * 60 * 60
  expiresAt: 1739577600, // Roughly Jan 9, 2026

  // CUSTOMIZE: Your merkle root from the generated tree
  // This is a placeholder - you must generate this from your recipient data
  merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",

  // CUSTOMIZE: The token you're distributing
  // This example uses USDC on Base
  tokenAddress: getAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),

  // CUSTOMIZE: USDC uses 6 decimals
  tokenDecimals: 6,

  // CUSTOMIZE: Token symbol
  tokenSymbol: "USDC",

  // CUSTOMIZE: Total allocation
  // This example: 10,000 USDC (10000 * 10^6)
  totalAmount: 10_000_000_000n,

  // CUSTOMIZE: Only needed for linear/tranched campaigns
  // Remove or leave undefined for instant campaigns
  unlockSchedule: undefined,
};

/**
 * Validate campaign configuration
 *
 * Performs basic validation checks on campaign config to catch
 * common configuration errors early.
 *
 * @param config - Campaign configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCampaignConfig(config: CampaignConfig): string[] {
  const errors: string[] = [];

  // Check for placeholder values
  if (config.contractAddress === "0x0000000000000000000000000000000000000000") {
    errors.push("Contract address is still set to placeholder value");
  }

  if (config.merkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    errors.push("Merkle root is still set to placeholder value");
  }

  // Validate numeric values
  if (config.totalAmount <= 0n) {
    errors.push("Total amount must be greater than 0");
  }

  if (config.expiresAt <= Math.floor(Date.now() / 1000)) {
    errors.push("Expiration time must be in the future");
  }

  if (config.tokenDecimals < 0 || config.tokenDecimals > 77) {
    errors.push("Token decimals must be between 0 and 77");
  }

  // Validate unlock schedule for non-instant campaigns
  if (config.distributionType === "linear") {
    if (!config.unlockSchedule?.startTime || !config.unlockSchedule?.duration) {
      errors.push("Linear campaigns require startTime and duration");
    }
  }

  if (config.distributionType === "tranched") {
    if (!config.unlockSchedule?.tranches || config.unlockSchedule.tranches.length === 0) {
      errors.push("Tranched campaigns require at least one tranche");
    }
  }

  return errors;
}
