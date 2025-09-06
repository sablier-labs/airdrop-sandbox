import type { Address, Hash } from "viem";
import type { chains } from "../web3/config";

// Chain types
export type SupportedChainId = (typeof chains)[number]["id"];
export type ChainName = (typeof chains)[number]["name"];

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

// Utility types
export type OptionalAddress = Address | undefined;
export type OptionalHash = Hash | undefined;
