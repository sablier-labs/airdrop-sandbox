import type { Address, Hash } from "viem";

/**
 * Type of distribution for the campaign.
 * - instant: Tokens are immediately available upon claim
 * - linear: Tokens vest linearly over time
 * - tranched: Tokens unlock in discrete steps
 */
export type DistributionType = "instant" | "linear" | "tranched";

/**
 * Campaign metadata containing all configuration and state information.
 */
export interface Campaign {
  /**
   * The on-chain address of the deployed campaign contract
   */
  contractAddress: Address;

  /**
   * The blockchain network ID (e.g., 1 for Ethereum mainnet, 137 for Polygon)
   */
  chainId: number;

  /**
   * Human-readable name of the campaign
   */
  campaignName: string;

  /**
   * The ERC-20 token contract address being distributed
   */
  tokenAddress: Address;

  /**
   * Token symbol (e.g., "USDC", "DAI")
   */
  tokenSymbol: string;

  /**
   * Number of decimal places for the token (typically 18)
   */
  tokenDecimals: number;

  /**
   * Total amount of tokens allocated for the campaign in smallest unit
   */
  totalAmount: bigint;

  /**
   * Merkle root hash used for claim verification
   */
  merkleRoot: Hash;

  /**
   * Fee required to execute a claim in native currency (wei)
   */
  claimFee: bigint;

  /**
   * Unix timestamp when the campaign expires and unclaimed tokens can be withdrawn
   */
  expiresAt: number;

  /**
   * The distribution mechanism for claimed tokens
   */
  distributionType: DistributionType;
}

/**
 * Vesting schedule configuration for linear or tranched distributions.
 * Only applicable when distributionType is 'linear' or 'tranched'.
 */
export interface VestingSchedule {
  /**
   * Duration before vesting begins in seconds
   */
  cliff: bigint;

  /**
   * Total duration of the vesting period in seconds
   */
  duration: bigint;

  /**
   * Whether the vesting stream can be canceled by the campaign creator
   */
  cancelable: boolean;

  /**
   * Whether the recipient can transfer the vesting NFT to another address
   */
  transferable: boolean;
}

/**
 * Single tranche configuration for tranched distributions.
 * Represents one unlock event in a multi-step vesting schedule.
 */
export interface TrancheData {
  /**
   * Unix timestamp when this tranche unlocks
   */
  unlockTime: bigint;

  /**
   * Amount of tokens that unlock in this tranche in smallest unit
   */
  amount: bigint;
}
