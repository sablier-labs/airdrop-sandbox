import type { Address, Chain } from "viem";
import { base } from "viem/chains";

/**
 * The configured chain for this application
 * This is imported from viem/chains based on the configured chainId
 */
export const chain = base;

/**
 * Get the configured chain
 */
export const getChain = (): Chain => chain;

/**
 * Get chain name
 */
export const getChainName = (): string => chain.name;

/**
 * Get block explorer URL
 */
export const getBlockExplorerUrl = (): string | undefined => {
  return chain.blockExplorers?.default?.url;
};

/**
 * Get chain ID
 */
export const getChainId = (): number => chain.id;

/**
 * Check if given chain ID matches the configured chain
 */
export const isConfiguredChain = (chainId: number): boolean => {
  return chainId === chain.id;
};

/**
 * Get chain icon URL (app-specific, not from viem)
 */
export const getChainIconUrl = (): string => {
  // This is app-specific metadata, not available in viem chains
  return "/images/chains/base.svg";
};

/**
 * Check if chain is a testnet
 */
export const isTestnet = (): boolean => {
  return chain.testnet ?? false;
};

/**
 * Get chain native currency
 */
export const getNativeCurrency = () => chain.nativeCurrency;

/**
 * Get chain RPC URLs
 */
export const getRpcUrls = () => chain.rpcUrls;

/**
 * Get chain block explorers
 */
export const getBlockExplorers = () => chain.blockExplorers;

/**
 * Format chain name for display
 */
export const formatChainName = (): string => {
  return isTestnet() ? `${chain.name} (Testnet)` : chain.name;
};

/**
 * Get chain explorer transaction URL
 */
export const getTxExplorerUrl = (txHash: string): string | undefined => {
  const explorerUrl = getBlockExplorerUrl();
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : undefined;
};

/**
 * Get chain explorer address URL
 */
export const getAddressExplorerUrl = (address: Address): string | undefined => {
  const explorerUrl = getBlockExplorerUrl();
  return explorerUrl ? `${explorerUrl}/address/${address}` : undefined;
};

/**
 * Get chain explorer contract URL
 */
export const getContractExplorerUrl = (address: Address): string | undefined => {
  const explorerUrl = getBlockExplorerUrl();
  return explorerUrl ? `${explorerUrl}/address/${address}#code` : undefined;
};

/**
 * Get chain explorer base URL
 */
export const getChainExplorer = (): string | undefined => {
  return getBlockExplorerUrl();
};
