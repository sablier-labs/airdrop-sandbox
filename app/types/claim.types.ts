import type { Hash } from "viem";

/**
 * Array of hashes representing the proof path from a leaf to the Merkle root.
 * Used to verify that an address is eligible to claim tokens.
 */
export type MerkleProof = Hash[];

/**
 * Eligibility information for a potential claimant.
 * Contains all data needed to determine if an address can claim and submit the proof.
 */
export interface EligibilityData {
  /**
   * Whether the address is eligible to claim tokens
   */
  eligible: boolean;

  /**
   * The index in the Merkle tree (null if not eligible)
   */
  index: number | null;

  /**
   * Amount of tokens claimable in smallest unit (null if not eligible)
   */
  amount: bigint | null;

  /**
   * Merkle proof required for claiming (null if not eligible)
   */
  proof: Hash[] | null;

  /**
   * Error message if eligibility check failed
   */
  error?: string;
}

/**
 * Current claim status for an address in a campaign.
 * Tracks whether tokens have been claimed and any associated metadata.
 */
export interface ClaimStatus {
  /**
   * Whether this address has already claimed their tokens
   */
  hasClaimed: boolean;

  /**
   * Whether the campaign has expired
   */
  isExpired: boolean;

  /**
   * Unix timestamp when the claim was executed (undefined if not claimed)
   */
  claimTimestamp?: number;

  /**
   * Sablier stream ID for vesting claims (undefined for instant claims)
   */
  streamId?: bigint;
}

/**
 * Transaction status for a claim operation.
 * Tracks the lifecycle of a claim transaction from submission to completion.
 */
export interface ClaimTransaction {
  /**
   * Transaction hash on the blockchain
   */
  hash: Hash;

  /**
   * Current status of the transaction
   */
  status: "pending" | "success" | "error";

  /**
   * Error message if the transaction failed
   */
  error?: string;
}
