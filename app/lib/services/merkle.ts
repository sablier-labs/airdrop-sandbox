/**
 * @fileoverview Merkle tree data service for fetching and processing airdrop recipient data from IPFS
 *
 * This service handles:
 * - Fetching merkle tree data from IPFS
 * - Parsing recipient information (index, address, amount)
 * - Generating merkle proofs for eligibility verification
 * - Caching data for performance
 */

import type { MerkleProof } from "@/app/lib/contracts/merkle";

/**
 * Structure of recipient data from IPFS
 */
export type Recipient = {
  /** Merkle tree index */
  index: number;
  /** Recipient address */
  address: `0x${string}`;
  /** Amount in wei (as string) */
  amount: string;
  /** Position in tree for proof generation */
  treeIndex: number;
};

/**
 * Merkle tree data structure from IPFS
 */
export type MerkleTreeData = {
  format: string;
  leafEncoding: string[];
  tree: string[];
  values: Array<{
    value: [string, string, string]; // [index, address, amount]
    tree_index: number;
  }>;
};

/**
 * Cache for IPFS data to avoid repeated fetches
 */
const dataCache = new Map<
  string,
  {
    data: MerkleTreeData;
    recipients: Map<string, Recipient>;
    timestamp: number;
  }
>();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * IPFS gateway URL for the merkle tree data
 */
const IPFS_URL = "https://ipfs.io/ipfs/Qmb9hBwSzAwF1z8WYpmhzquJ2Bp4th8sodq6jyhGgd2HX8";

/**
 * Fetch merkle tree data from IPFS
 */
async function fetchMerkleTreeData(): Promise<MerkleTreeData> {
  const cacheKey = "merkle-tree-data";
  const cached = dataCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(IPFS_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS data: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();

    if (!jsonData.merkle_tree) {
      throw new Error("Invalid IPFS data structure: missing merkle_tree field");
    }

    // Parse the merkle_tree JSON string
    const merkleTreeData = JSON.parse(jsonData.merkle_tree);

    const processedData: MerkleTreeData = {
      format: merkleTreeData.format,
      leafEncoding: merkleTreeData.leaf_encoding,
      tree: merkleTreeData.tree,
      values: merkleTreeData.values,
    };

    // Create recipients lookup map
    const recipients = new Map<string, Recipient>();

    for (const item of processedData.values) {
      const [indexStr, address, amountStr] = item.value;
      const recipient: Recipient = {
        address: address as `0x${string}`,
        amount: amountStr,
        index: parseInt(indexStr, 10),
        treeIndex: item.tree_index,
      };
      recipients.set(address.toLowerCase(), recipient);
    }

    // Cache the data
    dataCache.set(cacheKey, {
      data: processedData,
      recipients,
      timestamp: Date.now(),
    });

    return processedData;
  } catch (error) {
    console.error("Failed to fetch merkle tree data:", error);
    throw new Error(
      `IPFS fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get recipient data for a specific address
 */
export async function getRecipient(address: string): Promise<Recipient | null> {
  try {
    await fetchMerkleTreeData(); // Ensure data is cached

    const cacheKey = "merkle-tree-data";
    const cached = dataCache.get(cacheKey);

    if (!cached) {
      throw new Error("Failed to cache merkle tree data");
    }

    const normalizedAddress = address.toLowerCase();
    return cached.recipients.get(normalizedAddress) || null;
  } catch (error) {
    console.error("Failed to get recipient:", error);
    return null;
  }
}

/**
 * Check if an address is eligible for the airdrop
 */
export async function isEligible(address: string): Promise<boolean> {
  const recipient = await getRecipient(address);
  return recipient !== null;
}

/**
 * Get all recipients (for testing/debugging)
 */
export async function getAllRecipients(): Promise<Recipient[]> {
  try {
    await fetchMerkleTreeData();

    const cacheKey = "merkle-tree-data";
    const cached = dataCache.get(cacheKey);

    if (!cached) {
      throw new Error("Failed to cache merkle tree data");
    }

    return Array.from(cached.recipients.values());
  } catch (error) {
    console.error("Failed to get all recipients:", error);
    return [];
  }
}

/**
 * Generate merkle proof for a recipient
 * This is a simplified version - in production you'd want proper merkle proof generation
 */
export async function generateMerkleProof(address: string): Promise<MerkleProof | null> {
  try {
    const recipient = await getRecipient(address);

    if (!recipient) {
      return null;
    }

    const merkleTreeData = await fetchMerkleTreeData();
    const root = merkleTreeData.tree[0] as `0x${string}`;

    // For now, we'll create a simplified proof structure
    // In a full implementation, you'd generate the actual merkle path from the tree
    const proof: MerkleProof = {
      leaf: {
        address: recipient.address,
        amount: BigInt(recipient.amount),
        index: recipient.index,
      },
      proof: [], // TODO: Generate actual merkle proof path from tree
      root,
    };

    return proof;
  } catch (error) {
    console.error("Failed to generate merkle proof:", error);
    return null;
  }
}

/**
 * Get merkle root from the tree data
 */
export async function getMerkleRoot(): Promise<string | null> {
  try {
    const merkleTreeData = await fetchMerkleTreeData();
    // The root is typically the first element in the tree array
    return merkleTreeData.tree[0] || null;
  } catch (error) {
    console.error("Failed to get merkle root:", error);
    return null;
  }
}

/**
 * Get total number of recipients
 */
export async function getTotalRecipients(): Promise<number> {
  try {
    const merkleTreeData = await fetchMerkleTreeData();
    return merkleTreeData.values.length;
  } catch (error) {
    console.error("Failed to get total recipients:", error);
    return 0;
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  dataCache.clear();
}
