import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import type { Address } from "viem";
import { getAddress } from "viem";

/**
 * CUSTOMIZE: This encoding format must match your Solidity contract's verification.
 * Sablier contracts expect ["address", "uint256"] encoding.
 * If your contract uses different parameters, update this constant.
 *
 * Examples:
 * - ["address", "uint256"] for address + amount
 * - ["address", "uint256", "uint256"] for address + amount + vesting duration
 * - ["address", "uint256", "bytes32"] for address + amount + metadata hash
 */
const MERKLE_ENCODING = ["address", "uint256"];

/**
 * Represents a single recipient in the airdrop campaign.
 */
export interface MerkleRecipient {
  /**
   * The recipient's Ethereum address (will be checksummed automatically)
   */
  address: Address;

  /**
   * The amount of tokens allocated to this recipient in smallest unit (wei/atoms)
   * Example: 1000000000000000000n for 1 token with 18 decimals
   */
  amount: bigint;

  // CUSTOMIZE: Add additional fields if your contract requires them:
  // duration?: bigint;
  // metadataHash?: Hash;
}

/**
 * Serialized Merkle tree data structure for persistence.
 * This format is compatible with OpenZeppelin's StandardMerkleTree.dump().
 */
export type MerkleTreeData = ReturnType<StandardMerkleTree<[string, bigint]>["dump"]>;

/**
 * Generates a Merkle tree from an array of recipients.
 *
 * @param recipients - Array of recipients with addresses and amounts
 * @returns StandardMerkleTree instance
 *
 * @example
 * ```typescript
 * const recipients = [
 *   { address: "0x1234...", amount: 1000000000000000000n }, // 1 token
 *   { address: "0x5678...", amount: 2000000000000000000n }, // 2 tokens
 * ];
 *
 * const tree = generateMerkleTree(recipients);
 * const root = tree.root; // Use this root in your smart contract
 * ```
 *
 * CUSTOMIZE: If you need to include additional data in the tree:
 * 1. Update MerkleRecipient interface above
 * 2. Update MERKLE_ENCODING constant
 * 3. Update the values.map() below to include new fields
 * 4. Update your Solidity contract's verification logic
 */
export function generateMerkleTree(
  recipients: MerkleRecipient[],
): StandardMerkleTree<[string, bigint]> {
  // CUSTOMIZE: Validate recipients array before tree generation
  if (recipients.length === 0) {
    throw new Error("Cannot generate Merkle tree with zero recipients");
  }

  // Checksum all addresses and prepare tree values
  const values: Array<[string, bigint]> = recipients.map((recipient) => {
    // CUSTOMIZE: Add additional validation here
    if (!recipient.address) {
      throw new Error("Recipient address is required");
    }
    if (recipient.amount <= 0n) {
      throw new Error(`Invalid amount for ${recipient.address}: ${recipient.amount}`);
    }

    // Checksum the address to prevent case-sensitivity issues
    const checksummedAddress = getAddress(recipient.address);

    // CUSTOMIZE: If you added fields to MerkleRecipient, include them here:
    // return [checksummedAddress, recipient.amount, recipient.duration];
    return [checksummedAddress, recipient.amount];
  });

  // Generate the Merkle tree using OpenZeppelin's implementation
  return StandardMerkleTree.of(values, MERKLE_ENCODING);
}

/**
 * Exports a Merkle tree to JSON format for persistence.
 *
 * @param tree - StandardMerkleTree instance
 * @returns Serialized tree data that can be saved to a file
 *
 * @example
 * ```typescript
 * const tree = generateMerkleTree(recipients);
 * const treeData = exportTreeData(tree);
 *
 * // Save to file
 * await fs.writeFile("merkle-tree.json", JSON.stringify(treeData, null, 2));
 *
 * // Or send to API
 * await fetch("/api/save-tree", {
 *   method: "POST",
 *   body: JSON.stringify(treeData),
 * });
 * ```
 */
export function exportTreeData(tree: StandardMerkleTree<[string, bigint]>): MerkleTreeData {
  return tree.dump();
}

/**
 * Loads a Merkle tree from serialized JSON data.
 *
 * @param json - Serialized tree data (from exportTreeData or tree.dump())
 * @returns StandardMerkleTree instance
 *
 * @example
 * ```typescript
 * // Load from file
 * const treeData = JSON.parse(await fs.readFile("merkle-tree.json", "utf-8"));
 * const tree = loadTreeData(treeData);
 *
 * // Or load from API
 * const response = await fetch("/api/get-tree");
 * const treeData = await response.json();
 * const tree = loadTreeData(treeData);
 *
 * // Use the loaded tree
 * const root = tree.root;
 * for (const [index, value] of tree.entries()) {
 *   const proof = tree.getProof(index);
 *   console.log(`Address: ${value[0]}, Amount: ${value[1]}, Proof:`, proof);
 * }
 * ```
 *
 * CUSTOMIZE: Add validation after loading:
 * ```typescript
 * const tree = loadTreeData(treeData);
 * if (tree.root !== expectedRoot) {
 *   throw new Error("Tree root mismatch - data may be corrupted");
 * }
 * ```
 */
export function loadTreeData(json: MerkleTreeData): StandardMerkleTree<[string, bigint]> {
  // CUSTOMIZE: Add validation before loading
  if (!json || !json.format || !json.tree || !json.values) {
    throw new Error("Invalid tree data format");
  }

  return StandardMerkleTree.load(json);
}
