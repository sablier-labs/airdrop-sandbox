import type { Address, Hash } from "viem";
import type { CHAIN_IDS, CHAIN_NAMES, chains } from "../web3/config";

// Chain types
export type SupportedChainId = (typeof chains)[number]["id"];
export type ChainName = (typeof CHAIN_NAMES)[SupportedChainId];

// Contract addresses by chain
export type ContractAddresses = {
  merkleInstant: Address;
  merkleLL: Address;
  merkleLT: Address;
};

export type ChainContractMap = Record<SupportedChainId, ContractAddresses>;

// Airdrop claim types
export type AirdropProof = {
  amount: bigint;
  proof: Hash[];
  recipient: Address;
};

export type AirdropClaim = {
  amount: string;
  chainId: SupportedChainId;
  contractAddress: Address;
  proof: Hash[];
  recipient: Address;
  tokenAddress?: Address;
};

// Transaction states
export type TransactionStatus = "idle" | "preparing" | "pending" | "success" | "error";

export type ClaimTransaction = {
  hash?: Hash;
  status: TransactionStatus;
  error?: string;
};

// Environment variables
export interface Web3Environment {
  walletConnectProjectId: string;
  rpcUrls: {
    [K in keyof typeof CHAIN_IDS]?: string;
  };
  contractAddresses: {
    merkleInstant: Address;
    merkleLL: Address;
    merkleLT: Address;
  };
}

// Utility types
export type OptionalAddress = Address | undefined;
export type OptionalHash = Hash | undefined;
