import type { Address, Hash } from "viem";
import type { MerkleLeaf, MerkleProof } from "./tree";
import { MerkleTree } from "./tree";

/**
 * Result of eligibility check
 */
export interface EligibilityResult {
  isEligible: boolean;
  leaf: MerkleLeaf | null;
  proof: Hash[] | null;
  error?: string;
}

/**
 * Result of proof verification
 */
export interface VerificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Batch eligibility check result
 */
export interface BatchEligibilityResult {
  eligible: Array<{
    address: Address;
    leaf: MerkleLeaf;
    proof: Hash[];
  }>;
  ineligible: Address[];
  errors: Array<{
    address: Address;
    error: string;
  }>;
}

/**
 * Utility class for merkle proof verification and eligibility checking
 */
export class MerkleVerification {
  private tree: MerkleTree;

  constructor(tree: MerkleTree) {
    this.tree = tree;
  }

  /**
   * Check if an address is eligible and get proof if available
   */
  checkEligibility(address: Address): EligibilityResult {
    try {
      const proof = this.tree.getProof(address);

      if (!proof) {
        return {
          error: "Address not found in merkle tree",
          isEligible: false,
          leaf: null,
          proof: null,
        };
      }

      return {
        isEligible: true,
        leaf: proof.leaf,
        proof: proof.proof,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        isEligible: false,
        leaf: null,
        proof: null,
      };
    }
  }

  /**
   * Verify a merkle proof against the tree root
   */
  verifyProof(leaf: MerkleLeaf, proof: Hash[]): VerificationResult {
    try {
      const isValid = MerkleTree.verifyProof(leaf, proof, this.tree.getRoot());

      return {
        error: isValid ? undefined : "Proof verification failed",
        isValid,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Verification error",
        isValid: false,
      };
    }
  }

  /**
   * Batch check eligibility for multiple addresses
   */
  batchCheckEligibility(addresses: Address[]): BatchEligibilityResult {
    const eligible: BatchEligibilityResult["eligible"] = [];
    const ineligible: Address[] = [];
    const errors: BatchEligibilityResult["errors"] = [];

    for (const address of addresses) {
      try {
        const result = this.checkEligibility(address);

        if (result.isEligible && result.leaf && result.proof) {
          eligible.push({
            address,
            leaf: result.leaf,
            proof: result.proof,
          });
        } else {
          ineligible.push(address);
        }
      } catch (error) {
        errors.push({
          address,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      eligible,
      errors,
      ineligible,
    };
  }

  /**
   * Get proof by index (useful for sequential claiming)
   */
  getProofByIndex(index: bigint): MerkleProof | null {
    return this.tree.getProofByIndex(index);
  }

  /**
   * Get all eligible addresses
   */
  getAllEligibleAddresses(): Address[] {
    return this.tree.getLeaves().map((leaf) => leaf.recipient);
  }

  /**
   * Get total allocation amount
   */
  getTotalAllocation(): bigint {
    return this.tree.getLeaves().reduce((total, leaf) => total + leaf.amount, 0n);
  }

  /**
   * Get allocation for specific address
   */
  getAllocation(address: Address): bigint {
    const leaf = this.tree.getLeaf(address);
    return leaf ? leaf.amount : 0n;
  }

  /**
   * Search for addresses with allocation above threshold
   */
  findLargeAllocations(threshold: bigint): Array<{
    address: Address;
    amount: bigint;
    index: bigint;
  }> {
    return this.tree
      .getLeaves()
      .filter((leaf) => leaf.amount >= threshold)
      .map((leaf) => ({
        address: leaf.recipient,
        amount: leaf.amount,
        index: leaf.index,
      }))
      .sort((a, b) => (b.amount < a.amount ? -1 : 1));
  }

  /**
   * Get statistics about the merkle tree
   */
  getTreeStatistics(): {
    totalLeaves: number;
    totalAllocation: bigint;
    averageAllocation: bigint;
    maxAllocation: bigint;
    minAllocation: bigint;
    root: Hash;
  } {
    const leaves = this.tree.getLeaves();
    const amounts = leaves.map((leaf) => leaf.amount);

    const totalAllocation = amounts.reduce((sum, amount) => sum + amount, 0n);
    const averageAllocation = totalAllocation / BigInt(amounts.length);
    const maxAllocation = amounts.reduce((max, amount) => (amount > max ? amount : max), 0n);
    const minAllocation = amounts.reduce(
      (min, amount) => (amount < min ? amount : min),
      totalAllocation,
    );

    return {
      averageAllocation,
      maxAllocation,
      minAllocation,
      root: this.tree.getRoot(),
      totalAllocation,
      totalLeaves: leaves.length,
    };
  }

  /**
   * Validate merkle tree integrity
   */
  validateTreeIntegrity(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const leaves = this.tree.getLeaves();

    // Check for duplicate indices
    const indices = new Set();
    for (const leaf of leaves) {
      if (indices.has(leaf.index.toString())) {
        errors.push(`Duplicate index found: ${leaf.index}`);
      }
      indices.add(leaf.index.toString());
    }

    // Check for duplicate recipients
    const recipients = new Set();
    for (const leaf of leaves) {
      const address = leaf.recipient.toLowerCase();
      if (recipients.has(address)) {
        errors.push(`Duplicate recipient found: ${leaf.recipient}`);
      }
      recipients.add(address);
    }

    // Check for zero amounts
    const zeroAmountLeaves = leaves.filter((leaf) => leaf.amount === 0n);
    if (zeroAmountLeaves.length > 0) {
      errors.push(`Found ${zeroAmountLeaves.length} leaves with zero amounts`);
    }

    // Verify each proof against the tree root
    let invalidProofs = 0;
    for (const leaf of leaves) {
      const proof = this.tree.getProof(leaf.recipient);
      if (!proof || !this.tree.verifyProof(proof)) {
        invalidProofs++;
      }
    }

    if (invalidProofs > 0) {
      errors.push(`Found ${invalidProofs} invalid proofs`);
    }

    return {
      errors,
      isValid: errors.length === 0,
    };
  }

  /**
   * Create verification instance from external data
   */
  static fromTreeData(treeData: {
    root: Hash;
    leaves: Array<{
      index: string | number | bigint;
      recipient: string;
      amount: string | number | bigint;
    }>;
  }): MerkleVerification {
    const leaves: MerkleLeaf[] = treeData.leaves.map((leaf) => ({
      amount: BigInt(leaf.amount),
      index: BigInt(leaf.index),
      recipient: leaf.recipient as Address,
    }));

    const tree = new MerkleTree(leaves);

    // Verify that the provided root matches the calculated root
    if (tree.getRoot() !== treeData.root) {
      throw new Error("Provided root does not match calculated root");
    }

    return new MerkleVerification(tree);
  }
}
