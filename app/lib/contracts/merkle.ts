import { MerkleTree } from "merkletreejs";
import type { Address } from "viem";
import { keccak256 } from "viem";

/**
 * Represents a single leaf in the Merkle tree for airdrop claims
 */
export interface MerkleLeaf {
  /** The index of this leaf in the tree (used for claiming) */
  index: number;
  /** The recipient address */
  address: Address;
  /** The amount of tokens to be claimed (in wei) */
  amount: bigint;
}

/**
 * Merkle proof data required for claiming
 */
export interface MerkleProof {
  /** The leaf data */
  leaf: MerkleLeaf;
  /** Array of sibling hashes to prove inclusion */
  proof: `0x${string}`[];
  /** The root hash of the tree */
  root: `0x${string}`;
}

/**
 * Complete airdrop data including tree and all proofs
 */
export interface AirdropData {
  /** The Merkle tree root */
  root: `0x${string}`;
  /** Total number of eligible recipients */
  totalRecipients: number;
  /** Total amount being distributed */
  totalAmount: bigint;
  /** All eligible recipients and their allocations */
  recipients: MerkleLeaf[];
  /** Precomputed proofs for all recipients */
  proofs: Record<Address, MerkleProof>;
}

/**
 * Hashes a MerkleLeaf to create a leaf node
 * Uses the same format as the Solidity contract: keccak256(abi.encode(index, address, amount))
 *
 * @param leaf The leaf data to hash
 * @returns The hashed leaf as a Buffer
 */
export function hashLeaf(leaf: MerkleLeaf): Buffer {
  // Encode as per Solidity: abi.encode(uint256 index, address account, uint128 amount)
  const indexHex = leaf.index.toString(16).padStart(64, "0");
  const addressHex = leaf.address.slice(2).toLowerCase().padStart(64, "0");
  const amountHex = leaf.amount.toString(16).padStart(32, "0");

  const encoded = `0x${indexHex}${addressHex}${amountHex}`;
  return Buffer.from(keccak256(encoded as `0x${string}`).slice(2), "hex");
}

/**
 * Creates a Merkle tree from an array of recipients
 *
 * @param recipients Array of recipient data (address and amount)
 * @returns Complete airdrop data with tree, proofs, and metadata
 */
export function createMerkleTree(
  recipients: Array<{ address: Address; amount: bigint }>,
): AirdropData {
  if (recipients.length === 0) {
    throw new Error("Recipients array cannot be empty");
  }

  // Create indexed leaves
  const leaves: MerkleLeaf[] = recipients.map((recipient, index) => ({
    address: recipient.address,
    amount: recipient.amount,
    index,
  }));

  // Hash all leaves
  const leafHashes = leaves.map(hashLeaf);

  // Create the Merkle tree
  const tree = new MerkleTree(leafHashes, keccak256, {
    hashLeaves: false, // We already hashed the leaves
    sortPairs: true,
  });

  const root = tree.getHexRoot() as `0x${string}`;

  // Generate proofs for all recipients
  const proofs: Record<Address, MerkleProof> = {};

  leaves.forEach((leaf, index) => {
    const proof = tree.getHexProof(leafHashes[index]).map((p) => p as `0x${string}`);

    proofs[leaf.address] = {
      leaf,
      proof,
      root,
    };
  });

  // Calculate total amount
  const totalAmount = leaves.reduce((sum, leaf) => sum + leaf.amount, 0n);

  return {
    proofs,
    recipients: leaves,
    root,
    totalAmount,
    totalRecipients: leaves.length,
  };
}

/**
 * Generates a Merkle proof for a specific recipient
 *
 * @param recipients All recipients in the airdrop
 * @param targetAddress The address to generate a proof for
 * @returns The Merkle proof data or null if address not found
 */
export function generateProofForAddress(
  recipients: Array<{ address: Address; amount: bigint }>,
  targetAddress: Address,
): MerkleProof | null {
  const airdropData = createMerkleTree(recipients);

  const normalizedAddress = targetAddress.toLowerCase() as Address;
  return airdropData.proofs[normalizedAddress] || null;
}

/**
 * Verifies a Merkle proof against a root hash
 *
 * @param proof The proof data to verify
 * @param root The expected root hash
 * @returns True if the proof is valid
 */
export function verifyMerkleProof(proof: MerkleProof, root: `0x${string}`): boolean {
  if (proof.root !== root) {
    return false;
  }

  try {
    const leafHash = hashLeaf(proof.leaf);
    return MerkleTree.verify(
      proof.proof.map((p) => Buffer.from(p.slice(2), "hex")),
      leafHash,
      Buffer.from(root.slice(2), "hex"),
      keccak256,
    );
  } catch (error) {
    console.error("Error verifying Merkle proof:", error);
    return false;
  }
}

/**
 * Validates that a proof corresponds to the expected parameters
 *
 * @param proof The proof to validate
 * @param expectedAddress The expected recipient address
 * @param expectedAmount The expected token amount
 * @param expectedIndex The expected leaf index
 * @returns True if all parameters match
 */
export function validateProofParameters(
  proof: MerkleProof,
  expectedAddress: Address,
  expectedAmount: bigint,
  expectedIndex: number,
): boolean {
  return (
    proof.leaf.address.toLowerCase() === expectedAddress.toLowerCase() &&
    proof.leaf.amount === expectedAmount &&
    proof.leaf.index === expectedIndex
  );
}

/**
 * Checks if an address is eligible for the airdrop
 *
 * @param recipients All eligible recipients
 * @param address The address to check
 * @returns The recipient data if eligible, null otherwise
 */
export function findEligibleRecipient(
  recipients: Array<{ address: Address; amount: bigint }>,
  address: Address,
): { address: Address; amount: bigint } | null {
  const normalizedAddress = address.toLowerCase();
  return recipients.find((r) => r.address.toLowerCase() === normalizedAddress) || null;
}

/**
 * Gets the leaf index for a specific address in the recipients array
 *
 * @param recipients All recipients in the airdrop
 * @param address The address to find the index for
 * @returns The index or -1 if not found
 */
export function getLeafIndex(
  recipients: Array<{ address: Address; amount: bigint }>,
  address: Address,
): number {
  const normalizedAddress = address.toLowerCase();
  return recipients.findIndex((r) => r.address.toLowerCase() === normalizedAddress);
}

/**
 * Formats a Merkle proof for use in contract calls
 *
 * @param proof The proof data
 * @returns Formatted parameters ready for the claim function
 */
export function formatProofForClaim(proof: MerkleProof) {
  return {
    amount: proof.leaf.amount,
    index: BigInt(proof.leaf.index),
    merkleProof: proof.proof,
    recipient: proof.leaf.address,
  };
}

/**
 * Validates the structure and data of a Merkle proof
 *
 * @param proof The proof to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateMerkleProof(proof: MerkleProof): string[] {
  const errors: string[] = [];

  if (!proof.leaf) {
    errors.push("Missing leaf data");
    return errors;
  }

  if (!proof.leaf.address || !/^0x[a-fA-F0-9]{40}$/.test(proof.leaf.address)) {
    errors.push("Invalid address format");
  }

  if (proof.leaf.amount <= 0n) {
    errors.push("Amount must be greater than 0");
  }

  if (proof.leaf.index < 0) {
    errors.push("Index must be non-negative");
  }

  if (!proof.root || !/^0x[a-fA-F0-9]{64}$/.test(proof.root)) {
    errors.push("Invalid root hash format");
  }

  if (!Array.isArray(proof.proof)) {
    errors.push("Proof must be an array");
  } else {
    proof.proof.forEach((hash, i) => {
      if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
        errors.push(`Invalid hash format at proof[${i}]`);
      }
    });
  }

  return errors;
}

/**
 * Creates sample airdrop data for testing purposes
 *
 * @param count Number of recipients to generate
 * @param baseAmount Base amount for each recipient (will be varied)
 * @returns Complete test airdrop data
 */
export function createTestAirdropData(
  count: number = 100,
  baseAmount: bigint = BigInt("1000000000000000000"),
): AirdropData {
  const recipients: Array<{ address: Address; amount: bigint }> = [];

  for (let i = 0; i < count; i++) {
    // Generate deterministic test addresses
    const addressNum = (i + 1).toString(16).padStart(40, "0");
    const address = `0x${addressNum}` as Address;

    // Vary amounts for more realistic distribution
    const multiplier = BigInt(Math.floor(Math.random() * 10) + 1);
    const amount = baseAmount * multiplier;

    recipients.push({ address, amount });
  }

  return createMerkleTree(recipients);
}

/**
 * Exports airdrop data to JSON format
 *
 * @param airdropData The airdrop data to export
 * @returns JSON string representation
 */
export function exportAirdropData(airdropData: AirdropData): string {
  const exportData = {
    ...airdropData,
    // Convert bigint values to strings for JSON serialization
    recipients: airdropData.recipients.map((r) => ({
      ...r,
      amount: r.amount.toString(),
    })),
    totalAmount: airdropData.totalAmount.toString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Imports airdrop data from JSON format
 *
 * @param jsonData The JSON string to import
 * @returns Parsed airdrop data with proper bigint types
 */
export function importAirdropData(jsonData: string): AirdropData {
  const data = JSON.parse(jsonData) as {
    root: `0x${string}`;
    totalRecipients: number;
    totalAmount: string;
    recipients: Array<{ address: Address; amount: string; index: number }>;
    proofs: Record<Address, MerkleProof>;
  };

  return {
    ...data,
    // Convert string values back to bigint
    recipients: data.recipients.map((r) => ({
      ...r,
      amount: BigInt(r.amount),
    })),
    totalAmount: BigInt(data.totalAmount),
  };
}
