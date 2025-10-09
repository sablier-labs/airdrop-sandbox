import type { Address } from "viem";

/**
 * Sablier Merkle Airdrop Contract ABI
 * Minimal ABI for claim functionality
 */
export const AIRDROP_ABI = [
  {
    inputs: [
      { name: "index", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "merkleProof", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "index", type: "uint256" }],
    name: "isClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "merkleRoot",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CLAIM_FEE",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Get airdrop contract address from environment
 * Throws if not configured
 */
export function getAirdropContractAddress(): Address {
  const address = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS;

  if (!address) {
    throw new Error("NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS is not set");
  }

  return address as Address;
}

/**
 * Get chain ID from environment
 * Defaults to 1 (Ethereum mainnet)
 */
export function getChainId(): number {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId ? Number.parseInt(chainId, 10) : 1;
}

/**
 * Export contract configuration for easy access
 */
export const AIRDROP_CONTRACT = {
  abi: AIRDROP_ABI,
  address: getAirdropContractAddress,
} as const;
