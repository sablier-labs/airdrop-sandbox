import { release } from "sablier/evm/releases/airdrops/v3.0";
import type { Address } from "viem";

/**
 * Sablier Merkle Airdrop Contract ABI (Airdrops v3.0)
 *
 * Uses SablierMerkleInstant as the default — all campaign types (Instant, LL, LT, VCA, Execute)
 * share the same claim interface (claim, hasClaimed, calculateMinFeeWei, MERKLE_ROOT).
 */
export const AIRDROP_ABI = release.abi.SablierMerkleInstant;

/**
 * Get airdrop contract address from environment
 * Throws if not configured
 */
export function getAirdropContractAddress(): Address | undefined {
  const address = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS;
  return address ? (address as Address) : undefined;
}

/**
 * Get chain ID from environment
 * Defaults to 1 (Ethereum mainnet)
 */
export function getChainId(): number {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId ? Number.parseInt(chainId, 10) : 1;
}
