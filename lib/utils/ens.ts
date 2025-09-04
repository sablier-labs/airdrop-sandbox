import type { Address } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsName } from "wagmi";

/**
 * Result type for ENS resolution
 */
export type EnsResolution = {
  /** The resolved address (if ENS name was provided) or original address */
  address: Address;
  /** The resolved ENS name (if address was provided and has ENS) */
  ensName?: string;
  /** Whether this was an ENS name that got resolved to an address */
  wasEnsName: boolean;
  /** Whether this address has an ENS name (reverse lookup) */
  hasEnsName: boolean;
  /** Any error that occurred during resolution */
  error?: string;
  /** Whether the resolution is still loading */
  isLoading: boolean;
};

/**
 * Hook to resolve ENS names to addresses and addresses to ENS names
 *
 * @param input - ENS name or address to resolve
 * @returns Resolution result with address, ENS name, and loading states
 */
export function useEnsResolution(input?: string): EnsResolution {
  const isEnsName = input?.endsWith(".eth") || false;
  const isAddress = input?.startsWith("0x") && input.length === 42;

  // Resolve ENS name to address
  const {
    data: resolvedAddress,
    isLoading: isAddressLoading,
    error: addressError,
  } = useEnsAddress({
    name: isEnsName ? normalize(input as string) : undefined,
    query: {
      enabled: !!input && isEnsName,
    },
  });

  // Reverse resolve address to ENS name
  const {
    data: resolvedEnsName,
    isLoading: isNameLoading,
    error: nameError,
  } = useEnsName({
    address: (isAddress ? input : resolvedAddress) as Address | undefined,
    query: {
      enabled: !!(isAddress ? input : resolvedAddress),
    },
  });

  const isLoading = isAddressLoading || isNameLoading;
  const error = addressError?.message || nameError?.message;

  if (!input) {
    return {
      address: "0x" as Address,
      hasEnsName: false,
      isLoading: false,
      wasEnsName: false,
    };
  }

  if (isEnsName) {
    return {
      address: resolvedAddress || ("0x" as Address),
      ensName: resolvedAddress ? input : undefined,
      error,
      hasEnsName: !!resolvedAddress,
      isLoading,
      wasEnsName: true,
    };
  }

  if (isAddress) {
    return {
      address: input as Address,
      ensName: resolvedEnsName || undefined,
      error,
      hasEnsName: !!resolvedEnsName,
      isLoading,
      wasEnsName: false,
    };
  }

  return {
    address: "0x" as Address,
    error: "Invalid address or ENS name format",
    hasEnsName: false,
    isLoading: false,
    wasEnsName: false,
  };
}

/**
 * Validates if a string is a valid address or ENS name
 */
export function isValidAddressOrEns(input: string): boolean {
  if (!input) return false;

  // Check if it's a valid ENS name
  if (input.endsWith(".eth")) {
    return input.length > 4 && /^[a-zA-Z0-9-]+\.eth$/.test(input);
  }

  // Check if it's a valid Ethereum address
  if (input.startsWith("0x")) {
    return /^0x[a-fA-F0-9]{40}$/.test(input);
  }

  return false;
}

/**
 * Formats an address for display (shortened with ENS name if available)
 */
export function formatAddressDisplay(address?: Address, ensName?: string): string {
  if (!address || address === "0x") return "";

  if (ensName) {
    return `${ensName} (${address.slice(0, 6)}...${address.slice(-4)})`;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
