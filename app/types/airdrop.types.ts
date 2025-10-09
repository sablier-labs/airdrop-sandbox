import type { Address, Hex } from "viem";

/**
 * Merkle proof data returned from API
 */
export interface ClaimData {
  /** Index in the Merkle tree */
  index: number;
  /** Amount of tokens eligible to claim */
  amount: string;
  /** Merkle proof array */
  proof: Hex[];
}

/**
 * Claim status enumeration
 */
export enum ClaimStatus {
  /** Checking eligibility */
  CHECKING = "CHECKING",
  /** Not eligible for airdrop */
  NOT_ELIGIBLE = "NOT_ELIGIBLE",
  /** Eligible but not yet claimed */
  ELIGIBLE = "ELIGIBLE",
  /** Already claimed */
  ALREADY_CLAIMED = "ALREADY_CLAIMED",
  /** Transaction pending */
  CLAIMING = "CLAIMING",
  /** Successfully claimed */
  CLAIMED = "CLAIMED",
  /** Error occurred */
  ERROR = "ERROR",
}

/**
 * Airdrop campaign metadata
 * CUSTOMIZATION POINT: Modify this interface to add custom campaign fields
 */
export interface AirdropCampaign {
  /** Campaign name */
  name: string;
  /** Campaign description */
  description: string;
  /** Contract address */
  contractAddress: Address;
  /** Token symbol (e.g., "SAPIEN") */
  tokenSymbol: string;
  /** Token decimals */
  tokenDecimals: number;
  /** Merkle root hash */
  merkleRoot: Hex;
  /** Campaign start date */
  startDate?: Date;
  /** Campaign end date */
  endDate?: Date;
  /** Total number of recipients */
  totalRecipients?: number;
  /** Total amount allocated */
  totalAmount?: string;
}

/**
 * Transaction state for claim operation
 */
export interface TransactionState {
  /** Transaction hash */
  hash?: Hex;
  /** Waiting for wallet approval */
  isWriting: boolean;
  /** Transaction submitted, waiting for confirmation */
  isConfirming: boolean;
  /** Transaction confirmed */
  isConfirmed: boolean;
  /** Error if any */
  error: Error | null;
}

/**
 * API response for proof endpoint
 */
export interface ProofApiResponse {
  /** Success response */
  data?: ClaimData;
  /** Error response */
  error?: string;
}

// Re-export IPFS types for convenience
export type { IpfsMerkleData } from "./ipfs.types";
