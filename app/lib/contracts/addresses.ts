/**
 * Sablier Merkle Airdrop Contract Addresses
 *
 * Multi-chain address registry for deployed Sablier Merkle contracts.
 * Addresses are checksummed for type safety with viem.
 */

import type { Address } from "viem";
import { getAddress } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";

/**
 * Contract address mapping by chain ID
 *
 * Structure: { [chainId: number]: Address }
 *
 * // CUSTOMIZE: Add more chains as needed
 * To add a new chain:
 * 1. Import the chain from viem/chains
 * 2. Add the chainId and address to the mapping below
 * 3. Update SUPPORTED_CHAINS array
 */
const CONTRACT_ADDRESSES: Record<number, Address> = {
  // Ethereum Mainnet
  [mainnet.id]: getAddress("0x71DD3Ca88E7564416E5C2E350090C12Bf8F6144a"),

  // Base
  [base.id]: getAddress("0xD9e108f26fe104CE1058D48070438deDB3aD826A"),

  // Arbitrum One
  [arbitrum.id]: getAddress("0x7efd170e3e32Dc1b4c17eb4cFFf92c81FF43a6cb"),
};

/**
 * Supported chain IDs for Sablier Merkle contracts
 */
export const SUPPORTED_CHAINS = [mainnet.id, base.id, arbitrum.id] as const;

/**
 * Type for supported chain IDs
 */
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number];

/**
 * Get the Sablier Merkle contract address for a given chain
 *
 * @param chainId - The chain ID to get the address for
 * @returns The checksummed contract address
 * @throws Error if chainId is not supported
 *
 * @example
 * ```ts
 * import { getContractAddress } from "./addresses";
 * import { mainnet } from "viem/chains";
 *
 * const address = getContractAddress(mainnet.id);
 * // => "0x71DD3Ca88E7564416E5C2E350090C12Bf8F6144a"
 * ```
 */
export function getContractAddress(chainId: number): Address {
  const address = CONTRACT_ADDRESSES[chainId];

  if (!address) {
    throw new Error(
      `No Sablier Merkle contract address found for chain ID ${chainId}. ` +
        `Supported chains: ${SUPPORTED_CHAINS.join(", ")}`,
    );
  }

  return address;
}

/**
 * Check if a chain ID is supported
 *
 * @param chainId - The chain ID to check
 * @returns true if the chain is supported
 *
 * @example
 * ```ts
 * import { isSupportedChain } from "./addresses";
 * import { mainnet, optimism } from "viem/chains";
 *
 * isSupportedChain(mainnet.id); // => true
 * isSupportedChain(optimism.id); // => false
 * ```
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAINS.includes(chainId as SupportedChainId);
}

/**
 * Get all contract addresses as a map
 *
 * @returns Record of chain ID to contract address
 *
 * @example
 * ```ts
 * import { getAllAddresses } from "./addresses";
 *
 * const addresses = getAllAddresses();
 * // => { 1: "0x71D...", 8453: "0xD9e...", 42161: "0x7ef..." }
 * ```
 */
export function getAllAddresses(): Readonly<Record<number, Address>> {
  return CONTRACT_ADDRESSES;
}
