import type { Address } from "viem";
import type { Chain } from "wagmi/chains";
import { base, mainnet, sepolia } from "wagmi/chains";

export const supportedChains = [mainnet, base, sepolia] as const;

export type SupportedChain = (typeof supportedChains)[number];

/**
 * Chain-specific metadata and configuration
 */
export interface ChainMetadata {
  /** Chain ID */
  id: number;
  /** Chain name */
  name: string;
  /** Chain short name/symbol */
  shortName: string;
  /** Native currency symbol */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** RPC endpoints */
  rpcUrls: {
    default: string[];
    public: string[];
    alchemy?: string[];
    infura?: string[];
  };
  /** Block explorer configuration */
  blockExplorers: {
    default: {
      name: string;
      url: string;
      apiUrl?: string;
    };
    etherscan?: {
      name: string;
      url: string;
      apiUrl: string;
    };
  };
  /** Chain icon/logo */
  iconUrl?: string;
  /** Whether testnet */
  testnet?: boolean;
  /** Layer type */
  layer?: "L1" | "L2";
  /** Parent chain (for L2s) */
  parentChain?: {
    id: number;
    name: string;
  };
}

/**
 * Enhanced chain metadata with airdrop-specific configurations
 */
export const chainMetadata: Record<number, ChainMetadata> = {
  1: {
    blockExplorers: {
      default: {
        apiUrl: "https://api.etherscan.io/api",
        name: "Etherscan",
        url: "https://etherscan.io",
      },
      etherscan: {
        apiUrl: "https://api.etherscan.io/api",
        name: "Etherscan",
        url: "https://etherscan.io",
      },
    },
    iconUrl: "/images/chains/ethereum.svg",
    id: 1,
    layer: "L1",
    name: "Ethereum",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      alchemy: ["https://eth-mainnet.alchemyapi.io/v2"],
      default: ["https://eth.llamarpc.com"],
      infura: ["https://mainnet.infura.io/v3"],
      public: ["https://eth.llamarpc.com"],
    },
    shortName: "eth",
  },
  8453: {
    blockExplorers: {
      default: {
        apiUrl: "https://api.basescan.org/api",
        name: "BaseScan",
        url: "https://basescan.org",
      },
    },
    iconUrl: "/images/chains/base.svg",
    id: 8453,
    layer: "L2",
    name: "Base",
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    parentChain: {
      id: 1,
      name: "Ethereum",
    },
    rpcUrls: {
      alchemy: ["https://base-mainnet.g.alchemy.com/v2"],
      default: ["https://mainnet.base.org"],
      public: ["https://mainnet.base.org"],
    },
    shortName: "base",
  },
  11155111: {
    blockExplorers: {
      default: {
        apiUrl: "https://api-sepolia.etherscan.io/api",
        name: "Sepolia Etherscan",
        url: "https://sepolia.etherscan.io",
      },
      etherscan: {
        apiUrl: "https://api-sepolia.etherscan.io/api",
        name: "Sepolia Etherscan",
        url: "https://sepolia.etherscan.io",
      },
    },
    iconUrl: "/images/chains/ethereum.svg",
    id: 11155111,
    layer: "L1",
    name: "Sepolia",
    nativeCurrency: {
      decimals: 18,
      name: "Sepolia Ether",
      symbol: "SEP",
    },
    rpcUrls: {
      alchemy: ["https://eth-sepolia.g.alchemy.com/v2"],
      default: ["https://rpc.sepolia.org"],
      infura: ["https://sepolia.infura.io/v3"],
      public: ["https://rpc.sepolia.org"],
    },
    shortName: "sep",
    testnet: true,
  },
};

export const getChainById = (chainId: number): Chain | undefined => {
  return supportedChains.find((chain) => chain.id === chainId);
};

export const getChainName = (chainId: number): string => {
  const chain = getChainById(chainId);
  return chain?.name ?? "Unknown Chain";
};

export const getBlockExplorerUrl = (chainId: number): string | undefined => {
  const chain = getChainById(chainId);
  return chain?.blockExplorers?.default?.url;
};

/**
 * Get enhanced chain metadata
 */
export const getChainMetadata = (chainId: number): ChainMetadata | undefined => {
  return chainMetadata[chainId];
};

/**
 * Get chain icon URL
 */
export const getChainIconUrl = (chainId: number): string | undefined => {
  return chainMetadata[chainId]?.iconUrl;
};

/**
 * Check if chain is a testnet
 */
export const isTestnet = (chainId: number): boolean => {
  return chainMetadata[chainId]?.testnet ?? false;
};

/**
 * Get chain layer (L1/L2)
 */
export const getChainLayer = (chainId: number): "L1" | "L2" | undefined => {
  return chainMetadata[chainId]?.layer;
};

/**
 * Get parent chain for L2s
 */
export const getParentChain = (chainId: number): ChainMetadata["parentChain"] => {
  return chainMetadata[chainId]?.parentChain;
};

/**
 * Get block explorer API URL
 */
export const getBlockExplorerApiUrl = (chainId: number): string | undefined => {
  return chainMetadata[chainId]?.blockExplorers.default.apiUrl;
};

/**
 * Get default RPC URL for a chain
 */
export const getDefaultRpcUrl = (chainId: number): string | undefined => {
  const metadata = chainMetadata[chainId];
  return metadata?.rpcUrls.default[0];
};

/**
 * Get all supported chain IDs
 */
export const getSupportedChainIds = (): number[] => {
  return supportedChains.map((chain) => chain.id);
};

/**
 * Format chain name for display
 */
export const formatChainName = (chainId: number): string => {
  const metadata = getChainMetadata(chainId);
  if (!metadata) return "Unknown Chain";

  return metadata.testnet ? `${metadata.name} (Testnet)` : metadata.name;
};

/**
 * Get chain explorer transaction URL
 */
export const getTxExplorerUrl = (chainId: number, txHash: string): string | undefined => {
  const metadata = getChainMetadata(chainId);
  if (!metadata) return undefined;

  return `${metadata.blockExplorers.default.url}/tx/${txHash}`;
};

/**
 * Get chain explorer address URL
 */
export const getAddressExplorerUrl = (chainId: number, address: Address): string | undefined => {
  const metadata = getChainMetadata(chainId);
  if (!metadata) return undefined;

  return `${metadata.blockExplorers.default.url}/address/${address}`;
};

/**
 * Get chain explorer contract URL
 */
export const getContractExplorerUrl = (chainId: number, address: Address): string | undefined => {
  const metadata = getChainMetadata(chainId);
  if (!metadata) return undefined;

  return `${metadata.blockExplorers.default.url}/address/${address}#code`;
};

/**
 * Get chain explorer base URL
 */
export const getChainExplorer = (chainId: number): string | undefined => {
  const metadata = getChainMetadata(chainId);
  return metadata?.blockExplorers.default.url;
};
