/**
 * Sablier Merkle Airdrop Contract ABIs
 *
 * Type-safe ABIs imported from @sablier/airdrops package.
 * These ABIs are used for contract interactions via viem/wagmi.
 */

import SablierMerkleInstantArtifact from "@sablier/airdrops/artifacts/SablierMerkleInstant.json";
import SablierMerkleLLArtifact from "@sablier/airdrops/artifacts/SablierMerkleLL.json";
import SablierMerkleLTArtifact from "@sablier/airdrops/artifacts/SablierMerkleLT.json";
import type { Abi } from "viem";

/**
 * SablierMerkleInstant - Instant token distribution
 *
 * Allows recipients to claim their tokens immediately without vesting.
 * Tokens are transferred directly upon successful claim.
 *
 * Key Functions:
 * - claim(index, recipient, amount, merkleProof): Claim tokens immediately
 * - hasClaimed(index): Check if a leaf has been claimed
 * - hasExpired(): Check if campaign has expired
 * - FEE(): Get the protocol fee amount
 * - TOKEN(): Get the ERC20 token address
 * - MERKLE_ROOT(): Get the merkle root for verification
 */
export const SablierMerkleInstantAbi = SablierMerkleInstantArtifact.abi as Abi;

/**
 * SablierMerkleLL - Linear vesting distribution
 *
 * Creates Sablier lockup-linear streams for recipients.
 * Tokens vest linearly from start to end timestamp.
 *
 * Key Functions:
 * - claim(index, recipient, amount, merkleProof): Create linear vesting stream
 * - hasClaimed(index): Check if stream has been created
 * - hasExpired(): Check if campaign has expired
 * - FEE(): Get the protocol fee amount
 * - TOKEN(): Get the ERC20 token address
 * - MERKLE_ROOT(): Get the merkle root for verification
 */
export const SablierMerkleLLAbi = SablierMerkleLLArtifact.abi as Abi;

/**
 * SablierMerkleLT - Tranched vesting distribution
 *
 * Creates Sablier lockup-tranched streams for recipients.
 * Tokens vest in discrete tranches (unlocks) at specified timestamps.
 *
 * Key Functions:
 * - claim(index, recipient, amount, merkleProof): Create tranched vesting stream
 * - hasClaimed(index): Check if stream has been created
 * - hasExpired(): Check if campaign has expired
 * - FEE(): Get the protocol fee amount
 * - TOKEN(): Get the ERC20 token address
 * - MERKLE_ROOT(): Get the merkle root for verification
 */
export const SablierMerkleLTAbi = SablierMerkleLTArtifact.abi as Abi;

/**
 * Type-safe ABI exports for use with viem/wagmi hooks
 *
 * Usage with wagmi:
 * ```ts
 * import { useReadContract } from "wagmi";
 * import { SablierMerkleInstantAbi } from "./abis";
 *
 * const { data: hasClaimed } = useReadContract({
 *   address: contractAddress,
 *   abi: SablierMerkleInstantAbi,
 *   functionName: "hasClaimed",
 *   args: [index],
 * });
 * ```
 */
