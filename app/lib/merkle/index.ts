/**
 * Merkle Tree Utilities for Sablier Airdrops
 *
 * This module provides comprehensive Merkle tree functionality for managing
 * token airdrops with cryptographic proof verification.
 *
 * @module merkle
 *
 * @example
 * ```typescript
 * import {
 *   generateMerkleTree,
 *   exportTreeData,
 *   getEligibilityForAddress,
 *   verifyProof,
 *   MOCK_RECIPIENTS,
 * } from "@/lib/merkle";
 *
 * // Generate tree
 * const tree = generateMerkleTree(MOCK_RECIPIENTS);
 * const root = tree.root;
 *
 * // Check eligibility
 * const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
 * const eligibility = getEligibilityForAddress(userAddress, tree);
 *
 * if (eligibility) {
 *   // Verify proof before claiming
 *   const isValid = verifyProof(
 *     root,
 *     eligibility.proof,
 *     eligibility.index,
 *     userAddress,
 *     eligibility.amount
 *   );
 *
 *   if (isValid) {
 *     // Proceed with claim transaction
 *     console.log("Ready to claim:", eligibility.amount);
 *   }
 * }
 * ```
 */

// Data and eligibility
export {
  type EligibilityData,
  getAllEligible,
  getBatchEligibility,
  getEligibilityForAddress,
  getRecipientStats,
  MOCK_RECIPIENTS,
} from "./data";
// Tree generation and management
export {
  exportTreeData,
  generateMerkleTree,
  loadTreeData,
  type MerkleRecipient,
  type MerkleTreeData,
} from "./tree";
// Proof verification
export {
  batchVerifyProofs,
  getLeafHash,
  verifyProof,
} from "./verify";
