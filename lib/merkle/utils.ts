import type { Address, Hash } from "viem";
import type { MerkleLeaf } from "./tree";
import { MerkleTree } from "./tree";
import { MerkleVerification } from "./verification";

/**
 * Airdrop data format
 */
export interface AirdropData {
  [address: string]: {
    amount: string | number | bigint;
    index?: number | bigint;
  };
}

/**
 * IPFS tree data format
 */
export interface IPFSTreeData {
  root: Hash;
  leaves: Array<{
    index: string;
    recipient: string;
    amount: string;
  }>;
  metadata?: {
    totalAllocation: string;
    totalRecipients: number;
    createdAt: string;
    version: string;
  };
}

/**
 * Tree creation options
 */
export interface TreeCreationOptions {
  sortByAmount?: boolean;
  validateAddresses?: boolean;
  minimumAmount?: bigint;
}

/**
 * Load merkle tree data from IPFS
 */
export async function loadTreeFromIPFS(
  ipfsHash: string,
  ipfsGateway: string = "https://ipfs.io/ipfs/",
): Promise<MerkleVerification> {
  try {
    const url = `${ipfsGateway}${ipfsHash}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
    }

    const data: IPFSTreeData = await response.json();

    // Validate required fields
    if (!data.root || !data.leaves || !Array.isArray(data.leaves)) {
      throw new Error("Invalid IPFS tree data format");
    }

    const leaves: MerkleLeaf[] = data.leaves.map((leaf, index) => {
      if (!leaf.index || !leaf.recipient || !leaf.amount) {
        throw new Error(`Invalid leaf at index ${index}: missing required fields`);
      }

      return {
        amount: BigInt(leaf.amount),
        index: BigInt(leaf.index),
        recipient: leaf.recipient as Address,
      };
    });

    const tree = new MerkleTree(leaves);

    // Verify that the IPFS root matches calculated root
    if (tree.getRoot() !== data.root) {
      throw new Error("IPFS root hash does not match calculated root");
    }

    return new MerkleVerification(tree);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load tree from IPFS: ${error.message}`);
    }
    throw new Error("Failed to load tree from IPFS: Unknown error");
  }
}
