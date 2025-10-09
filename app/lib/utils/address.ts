import type { Address } from "viem";
import { getAddress, isAddress } from "viem";

/**
 * Validates and normalizes an Ethereum address
 * @param address - The address to validate
 * @returns Checksummed address
 * @throws Error if address is invalid
 */
export function validateAndNormalizeAddress(address: string): Address {
  if (!isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }
  return getAddress(address);
}

/**
 * Shortens an Ethereum address for display
 * @param address - The address to shorten
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Formats an address for display with optional shortening
 * @param address - The address to format
 * @param shorten - Whether to shorten the address
 * @returns Formatted address
 */
export function formatAddress(address: Address, shorten = true): string {
  return shorten ? shortenAddress(address) : address;
}
