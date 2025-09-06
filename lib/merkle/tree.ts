import type { Address, Hash } from "viem";
import { encodePacked, keccak256 } from "viem";

/**
 * Represents a leaf in the merkle tree
 */
export type MerkleLeaf = {
  index: bigint;
  recipient: Address;
  amount: bigint;
};

/**
 * Represents a merkle proof for claiming
 */
export type MerkleProof = {
  leaf: MerkleLeaf;
  proof: Hash[];
};

/**
 * Tree node used internally for construction
 */
type TreeNode = {
  hash: Hash;
  left?: TreeNode;
  right?: TreeNode;
};

/**
 * Merkle tree implementation for Sablier airdrops
 */
export class MerkleTree {
  private leaves: MerkleLeaf[];
  private tree: TreeNode[][];
  private root: Hash;

  constructor(leaves: MerkleLeaf[]) {
    this.leaves = [...leaves].sort((a, b) => {
      // Sort by index to ensure consistent tree construction
      if (a.index < b.index) return -1;
      if (a.index > b.index) return 1;
      return 0;
    });

    this.tree = this.buildTree();
    this.root = this.tree[this.tree.length - 1][0].hash;
  }

  /**
   * Get the merkle root
   */
  getRoot(): Hash {
    return this.root;
  }

  /**
   * Get the merkle proof for a specific recipient
   */
  getProof(recipient: Address): MerkleProof | null {
    const leaf = this.leaves.find((l) => l.recipient.toLowerCase() === recipient.toLowerCase());
    if (!leaf) {
      return null;
    }

    const leafIndex = this.leaves.indexOf(leaf);
    const proof: Hash[] = [];

    // Traverse up the tree to collect proof hashes
    let index = leafIndex;
    for (let level = 0; level < this.tree.length - 1; level++) {
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < this.tree[level].length) {
        proof.push(this.tree[level][siblingIndex].hash);
      }

      index = Math.floor(index / 2);
    }

    return {
      leaf,
      proof,
    };
  }

  /**
   * Get proof by index
   */
  getProofByIndex(index: bigint): MerkleProof | null {
    const leaf = this.leaves.find((l) => l.index === index);
    if (!leaf) {
      return null;
    }

    return this.getProof(leaf.recipient);
  }

  /**
   * Verify a merkle proof against the root
   */
  static verifyProof(leaf: MerkleLeaf, proof: Hash[], root: Hash): boolean {
    let computedHash = MerkleTree.hashLeaf(leaf);

    for (const proofElement of proof) {
      computedHash = MerkleTree.hashPair(computedHash, proofElement);
    }

    return computedHash === root;
  }

  /**
   * Verify proof using this tree's root
   */
  verifyProof(proof: MerkleProof): boolean {
    return MerkleTree.verifyProof(proof.leaf, proof.proof, this.root);
  }

  /**
   * Get all leaves in the tree
   */
  getLeaves(): MerkleLeaf[] {
    return [...this.leaves];
  }

  /**
   * Check if a recipient is eligible (has a leaf)
   */
  isEligible(recipient: Address): boolean {
    return this.leaves.some((leaf) => leaf.recipient.toLowerCase() === recipient.toLowerCase());
  }

  /**
   * Get leaf data for a recipient
   */
  getLeaf(recipient: Address): MerkleLeaf | null {
    return (
      this.leaves.find((leaf) => leaf.recipient.toLowerCase() === recipient.toLowerCase()) || null
    );
  }

  /**
   * Build the merkle tree from leaves
   */
  private buildTree(): TreeNode[][] {
    if (this.leaves.length === 0) {
      throw new Error("Cannot build tree with no leaves");
    }

    // Create leaf nodes
    let currentLevel: TreeNode[] = this.leaves.map((leaf) => ({
      hash: MerkleTree.hashLeaf(leaf),
    }));

    const tree: TreeNode[][] = [currentLevel];

    // Build tree bottom-up
    while (currentLevel.length > 1) {
      const nextLevel: TreeNode[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

        const parent: TreeNode = {
          hash: MerkleTree.hashPair(left.hash, right.hash),
          left,
          right: right !== left ? right : undefined,
        };

        nextLevel.push(parent);
      }

      currentLevel = nextLevel;
      tree.push(currentLevel);
    }

    return tree;
  }

  /**
   * Hash a leaf node (index, recipient, amount)
   */
  private static hashLeaf(leaf: MerkleLeaf): Hash {
    return keccak256(
      encodePacked(["uint256", "address", "uint128"], [leaf.index, leaf.recipient, leaf.amount]),
    );
  }

  /**
   * Hash two nodes together (sorted to ensure deterministic results)
   */
  private static hashPair(a: Hash, b: Hash): Hash {
    return a <= b
      ? keccak256(encodePacked(["bytes32", "bytes32"], [a, b]))
      : keccak256(encodePacked(["bytes32", "bytes32"], [b, a]));
  }

  /**
   * Create tree from CSV data
   */
  static fromCSV(csvData: string): MerkleTree {
    const lines = csvData.trim().split("\n");
    const leaves: MerkleLeaf[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Skip header
      const [indexStr, recipient, amountStr] = lines[i].split(",");

      if (!indexStr || !recipient || !amountStr) {
        throw new Error(`Invalid CSV line ${i}: ${lines[i]}`);
      }

      leaves.push({
        amount: BigInt(amountStr.trim()),
        index: BigInt(indexStr.trim()),
        recipient: recipient.trim() as Address,
      });
    }

    return new MerkleTree(leaves);
  }

  /**
   * Create tree from JSON data
   */
  static fromJSON(jsonData: string | object): MerkleTree {
    const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

    if (!Array.isArray(data)) {
      throw new Error("JSON data must be an array of leaves");
    }

    const leaves: MerkleLeaf[] = data.map((item, i) => {
      if (
        typeof item.index === "undefined" ||
        !item.recipient ||
        typeof item.amount === "undefined"
      ) {
        throw new Error(`Invalid leaf at index ${i}: missing required fields`);
      }

      return {
        amount: BigInt(item.amount),
        index: BigInt(item.index),
        recipient: item.recipient as Address,
      };
    });

    return new MerkleTree(leaves);
  }

  /**
   * Export tree data for verification
   */
  toJSON(): {
    root: Hash;
    leaves: MerkleLeaf[];
    totalLeaves: number;
  } {
    return {
      leaves: this.leaves,
      root: this.root,
      totalLeaves: this.leaves.length,
    };
  }
}
