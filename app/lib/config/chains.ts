import type { Address, Chain } from "viem";
import { getAddress } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";

/**
 * Sablier MerkleFactory deployment addresses per chain
 *
 * These contracts are used to create and manage merkle-based token distributions.
 * @see https://docs.sablier.com/contracts/v2/deployments
 */
export const MERKLE_FACTORY_ADDRESSES = {
  [mainnet.id]: getAddress("0x71DD3Ca88E7564416E5C2E350090C12Bf8F6144a"),
  [base.id]: getAddress("0xD9e108f26fe104CE1058D48070438deDB3aD826A"),
  [arbitrum.id]: getAddress("0x7efd170e3e32Dc1b4c17eb4cFFf92c81FF43a6cb"),
  // CUSTOMIZE: Add more chains here as Sablier expands deployments
  // Example: [optimism.id]: getAddress("0x..."),
} as const satisfies Record<number, Address>;

/**
 * Configuration for each supported chain
 */
export interface ChainConfig {
  /** Viem chain object */
  chain: Chain;
  /** Sablier MerkleFactory contract address on this chain */
  merkleFactoryAddress: Address;
  /** Block explorer base URL */
  explorerUrl: string;
  /** RPC endpoints (public) */
  rpcUrls: readonly string[];
}

/**
 * Type-safe chain configuration object
 *
 * Contains all necessary information for interacting with Sablier contracts
 * on each supported chain.
 */
export const CHAIN_CONFIGS = {
  [mainnet.id]: {
    chain: mainnet,
    explorerUrl: "https://etherscan.io",
    merkleFactoryAddress: MERKLE_FACTORY_ADDRESSES[mainnet.id],
    rpcUrls: mainnet.rpcUrls.default.http,
  },
  [base.id]: {
    chain: base,
    explorerUrl: "https://basescan.org",
    merkleFactoryAddress: MERKLE_FACTORY_ADDRESSES[base.id],
    rpcUrls: base.rpcUrls.default.http,
  },
  [arbitrum.id]: {
    chain: arbitrum,
    explorerUrl: "https://arbiscan.io",
    merkleFactoryAddress: MERKLE_FACTORY_ADDRESSES[arbitrum.id],
    rpcUrls: arbitrum.rpcUrls.default.http,
  },
  // CUSTOMIZE: Add more chain configurations here
  // Example:
  // [optimism.id]: {
  //   chain: optimism,
  //   merkleFactoryAddress: MERKLE_FACTORY_ADDRESSES[optimism.id],
  //   explorerUrl: "https://optimistic.etherscan.io",
  //   rpcUrls: optimism.rpcUrls.default.http,
  // },
} as const satisfies Record<number, ChainConfig>;

/**
 * Array of all supported chains
 */
export const SUPPORTED_CHAINS = [mainnet, base, arbitrum] as const;

/**
 * Type helper for supported chain IDs
 */
export type SupportedChainId = keyof typeof CHAIN_CONFIGS;

/**
 * Get chain configuration by chain ID
 *
 * @param chainId - The chain ID to get configuration for
 * @returns Chain configuration or undefined if not supported
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAIN_CONFIGS[chainId as SupportedChainId];
}

/**
 * Check if a chain ID is supported
 *
 * @param chainId - The chain ID to check
 * @returns True if the chain is supported
 */
export function isChainSupported(chainId: number): chainId is SupportedChainId {
  return chainId in CHAIN_CONFIGS;
}
