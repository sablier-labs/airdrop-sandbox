import { sablier } from "sablier";
import { release } from "sablier/evm/releases/airdrops/v3.0";
import type { Address, Hex } from "viem";

/**
 * Sablier Merkle Airdrop Contract ABI (Airdrops v3.0)
 *
 * Uses SablierMerkleInstant as the default — all campaign types (Instant, LL, LT, VCA, Execute)
 * share the same claim interface (claim, hasClaimed, calculateMinFeeWei, MERKLE_ROOT) and the
 * v3.0 view surface (hasExpired, minFeeUSD, ipfsCID).
 */
export const AIRDROP_ABI = release.abi.SablierMerkleInstant;

/** Returns the configured airdrop campaign address, or undefined if not set. */
export function getAirdropContractAddress(): Address | undefined {
  const address = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS;
  return address ? (address as Address) : undefined;
}

/** Returns the configured chain id, defaulting to Ethereum mainnet. */
export function getChainId(): number {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId ? Number.parseInt(chainId, 10) : 1;
}

/**
 * Builds a block-explorer transaction URL using the Sablier SDK chain registry.
 * Falls back to Etherscan if the chain isn't in the registry.
 */
export function getExplorerTxUrl(hash: Hex, chainId: number): string {
  const baseUrl =
    sablier.chains.get(chainId)?.blockExplorers?.default?.url ?? "https://etherscan.io";
  return `${baseUrl}/tx/${hash}`;
}
