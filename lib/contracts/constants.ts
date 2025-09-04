import type { Address } from "viem";

/**
 * Gas estimation constants for contract interactions
 */
export const GAS_ESTIMATES = {
  /** Gas limit for batch claims (per claim) */
  BATCH_CLAIM_PER_ITEM: 130_000n,
  /** Gas limit for a single airdrop claim */
  CLAIM: 150_000n,
  /** Gas limit for checking claim status */
  HAS_CLAIMED: 30_000n,
  /** Gas limit for pause/unpause operations */
  PAUSE_UNPAUSE: 50_000n,
  /** Gas limit for reading contract state */
  READ_STATE: 25_000n,
  /** Gas limit for admin withdrawal */
  WITHDRAW_UNCLAIMED: 80_000n,
} as const;

/**
 * Function selectors for contract calls (4-byte signatures)
 */
export const FUNCTION_SELECTORS = {
  /** admin() */
  ADMIN: "0xf851a440",
  /** claim(uint256,address,uint128,bytes32[]) */
  CLAIM: "0x2e7ba6ef",
  /** claimBatch(uint256[],address[],uint128[],bytes32[][]) */
  CLAIM_BATCH: "0x8c0a3ed4",
  /** hasClaimed(address) */
  HAS_CLAIMED: "0x9852595c",
  /** LOCKUP_LINEAR() */
  LOCKUP_LINEAR: "0x6b613c2a",
  /** MERKLE_ROOT() */
  MERKLE_ROOT: "0xbcdd4190",
  /** paused() */
  PAUSED: "0x5c975abb",
  /** TOKEN() */
  TOKEN: "0x82b2e257",
  /** withdrawUnclaimed(address,uint256) */
  WITHDRAW_UNCLAIMED: "0x7c61a5d5",
} as const;

/**
 * Event signatures for filtering logs
 */
export const EVENT_SIGNATURES = {
  /** Claimed(uint256 indexed,address indexed,uint128,uint256) */
  CLAIMED: "0x4ec90e965519d92681267467f775ada5bd214aa92c0dc93d90a5e880ce9ed026",
  /** ClaimedBatch(uint256[],address[],uint128[],uint256[]) */
  CLAIMED_BATCH: "0x7c1d2e9c5f5e4b12345678901234567890123456789012345678901234567890",
  /** Paused(address) */
  PAUSED: "0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258",
  /** Unpaused(address) */
  UNPAUSED: "0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa",
  /** WithdrawnUnclaimed(address indexed,uint256,address indexed) */
  WITHDRAWN_UNCLAIMED: "0x8c3a8e9c5d5f4a12345678901234567890123456789012345678901234567890",
} as const;

/**
 * Standard error codes and their meanings
 */
export const ERROR_CODES = {
  /** Address has already claimed */
  ALREADY_CLAIMED: "AlreadyClaimed(address)",
  /** Array length mismatch in batch operations */
  ARRAY_LENGTH_MISMATCH: "ArrayLengthMismatch()",
  /** Contract is currently paused */
  CONTRACT_PAUSED: "ContractPaused()",
  /** Insufficient tokens for operation */
  INSUFFICIENT_TOKENS: "InsufficientTokens(uint256,uint256)",
  /** Invalid Merkle proof provided */
  INVALID_PROOF: "InvalidProof()",
  /** Unauthorized access attempt */
  UNAUTHORIZED: "Unauthorized(address)",
} as const;

/**
 * Contract deployment block numbers for event filtering
 * These should be updated with actual deployment blocks
 */
export const DEPLOYMENT_BLOCKS = {
  /** Base mainnet deployment block */
  BASE: 8_000_000n,
  /** Ethereum mainnet deployment block */
  MAINNET: 18_500_000n,
  /** Sepolia testnet deployment block */
  SEPOLIA: 4_500_000n,
} as const;

/**
 * Maximum values for various operations
 */
export const LIMITS = {
  /** Maximum number of items in a batch claim */
  MAX_BATCH_SIZE: 50,
  /** Maximum gas price multiplier for retries */
  MAX_GAS_MULTIPLIER: 2.0,
  /** Maximum Merkle proof length */
  MAX_PROOF_LENGTH: 32,
  /** Maximum number of retry attempts for failed transactions */
  MAX_RETRY_ATTEMPTS: 3,
} as const;

/**
 * Time constants for various operations
 */
export const TIMEOUTS = {
  /** Block confirmation wait time */
  BLOCK_CONFIRMATION_TIME: 12_000,
  /** Contract call timeout (30 seconds) */
  CONTRACT_CALL_TIMEOUT: 30_000,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 2_000,
  /** Transaction confirmation timeout (5 minutes) */
  TRANSACTION_TIMEOUT: 300_000,
} as const;

/**
 * Common addresses used across different networks
 */
export const COMMON_ADDRESSES = {
  /** Dead address for burning */
  DEAD: "0x000000000000000000000000000000000000dEaD" as Address,
  /** Multicall3 contract (same address on all networks) */
  MULTICALL3: "0xcA11bde05977b3631167028862bE2a173976CA11" as Address,
  /** Zero address */
  ZERO: "0x0000000000000000000000000000000000000000" as Address,
} as const;

/**
 * Token decimal constants for common tokens
 */
export const TOKEN_DECIMALS = {
  /** USDC/USDT decimals */
  STABLECOIN: 6,
  /** Standard ERC20 decimals */
  STANDARD: 18,
  /** WBTC decimals */
  WBTC: 8,
} as const;

/**
 * Network-specific configuration
 */
export const NETWORK_CONFIG = {
  1: {
    blockTime: 12_000, // 12 seconds
    confirmations: 1,
    name: "mainnet",
  },
  8453: {
    blockTime: 2_000, // 2 seconds
    confirmations: 1,
    name: "base",
  },
  11155111: {
    blockTime: 12_000, // 12 seconds
    confirmations: 1,
    name: "sepolia",
  },
} as const;

/**
 * Default values for various operations
 */
export const DEFAULTS = {
  /** Default gas price multiplier for faster transactions */
  GAS_PRICE_MULTIPLIER: 1.1,
  /** Default page size for pagination */
  PAGE_SIZE: 100,
  /** Default slippage tolerance (1%) */
  SLIPPAGE_TOLERANCE: 0.01,
  /** Default deadline for transactions (20 minutes) */
  TRANSACTION_DEADLINE: 20 * 60, // 20 minutes in seconds
} as const;

/**
 * Merkle tree configuration constants
 */
export const MERKLE_CONFIG = {
  /** Default hash function for Merkle trees */
  HASH_FUNCTION: "keccak256",
  /** Whether leaves are pre-hashed */
  HASH_LEAVES: false,
  /** Whether to sort pairs in Merkle tree construction */
  SORT_PAIRS: true,
} as const;

/**
 * RPC endpoint rate limits and configurations
 */
export const RPC_CONFIG = {
  /** Retry backoff multiplier */
  BACKOFF_MULTIPLIER: 1.5,
  /** Maximum concurrent requests */
  MAX_CONCURRENT: 5,
  /** Maximum requests per second */
  MAX_RPS: 10,
  /** Request timeout in milliseconds */
  TIMEOUT: 10_000,
} as const;

/**
 * Cache durations for various data types (in milliseconds)
 */
export const CACHE_DURATIONS = {
  /** Block number cache duration (30 seconds) */
  BLOCK_NUMBER: 30 * 1000,
  /** User claim status cache duration (2 minutes) */
  CLAIM_STATUS: 2 * 60 * 1000,
  /** Contract state cache duration (5 minutes) */
  CONTRACT_STATE: 5 * 60 * 1000,
  /** Token metadata cache duration (1 hour) */
  TOKEN_METADATA: 60 * 60 * 1000,
} as const;

/**
 * Validation patterns for common data types
 */
export const VALIDATION_PATTERNS = {
  /** Ethereum address regex */
  ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  /** 32-byte hash regex */
  BYTES32: /^0x[a-fA-F0-9]{64}$/,
  /** Hexadecimal string regex */
  HEX: /^0x[a-fA-F0-9]+$/,
  /** Transaction hash regex */
  TX_HASH: /^0x[a-fA-F0-9]{64}$/,
} as const;

/**
 * Contract interface identifiers
 */
export const INTERFACE_IDS = {
  /** Access control interface ID */
  ACCESS_CONTROL: "0x7965db0b",
  /** ERC20 interface ID */
  ERC20: "0x36372b07",
  /** ERC165 interface ID */
  ERC165: "0x01ffc9a7",
  /** Pausable interface ID */
  PAUSABLE: "0x5c975abb",
} as const;

/**
 * Priority fee suggestions for different urgency levels
 */
export const PRIORITY_FEES = {
  /** High priority (next block) */
  HIGH: 5_000_000_000n, // 5 gwei
  /** Low priority (may take several blocks) */
  LOW: 1_000_000_000n, // 1 gwei
  /** Standard priority (1-3 blocks) */
  STANDARD: 2_000_000_000n, // 2 gwei
  /** Ultra high priority (immediate) */
  ULTRA: 10_000_000_000n, // 10 gwei
} as const;
