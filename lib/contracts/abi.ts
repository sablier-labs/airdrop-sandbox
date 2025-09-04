import type { Abi } from "viem";

/**
 * Complete ABI for Sablier Merkle Lockup Linear (SablierMerkleLL) contract
 * Based on the official Sablier airdrop contract implementation
 *
 * This contract allows claiming tokens through a Merkle proof verification
 * and automatically creates a Sablier lockup linear stream for the recipient.
 */
export const sablierMerkleAbi = [
  // ==========================================
  // STATE VARIABLES & GETTERS
  // ==========================================

  /**
   * Returns the Merkle root used for proof verification
   * @returns bytes32 The Merkle tree root hash
   */
  {
    inputs: [],
    name: "MERKLE_ROOT",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },

  /**
   * Returns the address of the Sablier lockup linear contract
   * @returns address The Sablier lockup linear contract address
   */
  {
    inputs: [],
    name: "LOCKUP_LINEAR",
    outputs: [{ internalType: "contract ISablierLockupLinear", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  /**
   * Returns the ERC20 token being distributed
   * @returns address The token contract address
   */
  {
    inputs: [],
    name: "TOKEN",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  /**
   * Returns the admin/owner of the contract
   * @returns address The admin address
   */
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  /**
   * Returns the cancelability status for streams
   * @returns bool Whether created streams are cancelable
   */
  {
    inputs: [],
    name: "cancelable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  /**
   * Returns the transferability status for streams
   * @returns bool Whether created streams are transferable
   */
  {
    inputs: [],
    name: "transferable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // ==========================================
  // CLAIM TRACKING
  // ==========================================

  /**
   * Checks if a specific address has already claimed their airdrop
   * @param account The address to check
   * @returns bool True if the address has claimed, false otherwise
   */
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "hasClaimed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  /**
   * Returns the total number of claims made
   * @returns uint256 The number of successful claims
   */
  {
    inputs: [],
    name: "claimsCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // ==========================================
  // MAIN CLAIM FUNCTION
  // ==========================================

  /**
   * Claims the airdrop tokens and creates a Sablier lockup linear stream
   * @param index The leaf index in the Merkle tree
   * @param recipient The address that will receive the stream
   * @param amount The amount of tokens to be streamed (in wei)
   * @param merkleProof Array of bytes32 hashes proving inclusion in the Merkle tree
   * @returns uint256 The ID of the created stream
   */
  {
    inputs: [
      { internalType: "uint256", name: "index", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint128", name: "amount", type: "uint128" },
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [{ internalType: "uint256", name: "streamId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  /**
   * Batch claim function for claiming multiple airdrops at once
   * @param indices Array of leaf indices in the Merkle tree
   * @param recipients Array of addresses that will receive the streams
   * @param amounts Array of token amounts to be streamed
   * @param merkleProofs Array of Merkle proofs for each claim
   * @returns uint256[] Array of created stream IDs
   */
  {
    inputs: [
      { internalType: "uint256[]", name: "indices", type: "uint256[]" },
      { internalType: "address[]", name: "recipients", type: "address[]" },
      { internalType: "uint128[]", name: "amounts", type: "uint128[]" },
      { internalType: "bytes32[][]", name: "merkleProofs", type: "bytes32[][]" },
    ],
    name: "claimBatch",
    outputs: [{ internalType: "uint256[]", name: "streamIds", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ==========================================
  // ADMIN FUNCTIONS
  // ==========================================

  /**
   * Allows admin to withdraw unclaimed tokens after campaign ends
   * @param to The address to send unclaimed tokens to
   * @param amount The amount of tokens to withdraw
   */
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawUnclaimed",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  /**
   * Emergency function to pause the contract
   */
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  /**
   * Resume the contract after being paused
   */
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  /**
   * Check if the contract is currently paused
   * @returns bool True if paused, false otherwise
   */
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // ==========================================
  // EVENTS
  // ==========================================

  /**
   * Emitted when a successful claim is made
   */
  {
    inputs: [
      { indexed: true, internalType: "uint256", name: "index", type: "uint256" },
      { indexed: true, internalType: "address", name: "recipient", type: "address" },
      { indexed: false, internalType: "uint128", name: "amount", type: "uint128" },
      { indexed: false, internalType: "uint256", name: "streamId", type: "uint256" },
    ],
    name: "Claimed",
    type: "event",
  },

  /**
   * Emitted when multiple claims are made in a batch
   */
  {
    inputs: [
      { indexed: false, internalType: "uint256[]", name: "indices", type: "uint256[]" },
      { indexed: false, internalType: "address[]", name: "recipients", type: "address[]" },
      { indexed: false, internalType: "uint128[]", name: "amounts", type: "uint128[]" },
      { indexed: false, internalType: "uint256[]", name: "streamIds", type: "uint256[]" },
    ],
    name: "ClaimedBatch",
    type: "event",
  },

  /**
   * Emitted when unclaimed tokens are withdrawn by admin
   */
  {
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: true, internalType: "address", name: "admin", type: "address" },
    ],
    name: "WithdrawnUnclaimed",
    type: "event",
  },

  /**
   * Emitted when the contract is paused
   */
  {
    inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
    name: "Paused",
    type: "event",
  },

  /**
   * Emitted when the contract is unpaused
   */
  {
    inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
    name: "Unpaused",
    type: "event",
  },

  // ==========================================
  // ERROR DEFINITIONS
  // ==========================================

  /**
   * Error thrown when an invalid Merkle proof is provided
   */
  {
    inputs: [],
    name: "InvalidProof",
    type: "error",
  },

  /**
   * Error thrown when an address has already claimed
   */
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AlreadyClaimed",
    type: "error",
  },

  /**
   * Error thrown when the contract is paused and claims are attempted
   */
  {
    inputs: [],
    name: "ContractPaused",
    type: "error",
  },

  /**
   * Error thrown when insufficient tokens are available for withdrawal
   */
  {
    inputs: [
      { internalType: "uint256", name: "available", type: "uint256" },
      { internalType: "uint256", name: "requested", type: "uint256" },
    ],
    name: "InsufficientTokens",
    type: "error",
  },

  /**
   * Error thrown when unauthorized access is attempted
   */
  {
    inputs: [{ internalType: "address", name: "caller", type: "address" }],
    name: "Unauthorized",
    type: "error",
  },

  /**
   * Error thrown when arrays have mismatched lengths
   */
  {
    inputs: [],
    name: "ArrayLengthMismatch",
    type: "error",
  },
] as const satisfies Abi;

/**
 * ABI for ERC20 token contract interactions
 * Includes only the functions we need for airdrop operations
 */
export const erc20Abi = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;

/**
 * Type definitions for contract function parameters and return types
 */
export type ClaimParams = {
  index: bigint;
  recipient: `0x${string}`;
  amount: bigint;
  merkleProof: `0x${string}`[];
};

export type BatchClaimParams = {
  indices: bigint[];
  recipients: `0x${string}`[];
  amounts: bigint[];
  merkleProofs: `0x${string}`[][];
};

export type ClaimedEvent = {
  index: bigint;
  recipient: `0x${string}`;
  amount: bigint;
  streamId: bigint;
};

export type WithdrawnUnclaimedEvent = {
  to: `0x${string}`;
  amount: bigint;
  admin: `0x${string}`;
};

/**
 * Contract read function return types
 */
export type ContractInfo = {
  admin: `0x${string}`;
  cancelable: boolean;
  claimsCount: bigint;
  lockupLinear: `0x${string}`;
  merkleRoot: `0x${string}`;
  paused: boolean;
  token: `0x${string}`;
  transferable: boolean;
};
