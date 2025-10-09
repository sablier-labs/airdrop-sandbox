import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Hex } from "viem";
import { isAddress } from "viem";
import type { ClaimData, ProofApiResponse } from "@/types/airdrop.types";
import type { IpfsMerkleData } from "@/types/ipfs.types";

// In-memory cache for the Merkle tree
// Avoids fetching from IPFS on every request
let cachedTree: StandardMerkleTree<[string, string, string]> | null = null;

/**
 * Fetches and loads Merkle tree from IPFS
 * Caches the tree in memory for subsequent requests
 */
async function getMerkleTree(): Promise<StandardMerkleTree<[string, string, string]>> {
  // Return cached tree if available
  if (cachedTree) {
    return cachedTree;
  }

  const ipfsUrl = process.env.NEXT_PUBLIC_MERKLE_TREE_IPFS_URL;

  if (!ipfsUrl) {
    throw new Error("NEXT_PUBLIC_MERKLE_TREE_IPFS_URL is not configured");
  }

  console.log("Fetching Merkle tree from IPFS:", ipfsUrl);

  // Fetch from IPFS
  const response = await fetch(ipfsUrl, {
    // Add timeout and cache headers
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
  }

  const data: IpfsMerkleData = await response.json();

  // The merkle_tree field is a stringified JSON
  const treeData = JSON.parse(data.merkle_tree);

  // Fix missing leafEncoding field (OpenZeppelin requires this)
  if (!treeData.leafEncoding) {
    treeData.leafEncoding = ["uint256", "address", "uint256"];
  }

  // Verify leaf encoding matches expected format
  const expectedEncoding = ["uint256", "address", "uint256"];
  if (JSON.stringify(treeData.leafEncoding) !== JSON.stringify(expectedEncoding)) {
    console.warn("Unexpected leaf encoding:", treeData.leafEncoding);
  }

  // Load the tree (leaf format: [index, address, amount])
  cachedTree = StandardMerkleTree.load(treeData);

  console.log("Merkle tree loaded successfully:", {
    recipients: data.number_of_recipients,
    root: data.root,
  });

  return cachedTree;
}

/**
 * GET /api/airdrop/proof?address=0x...
 *
 * Fetches Merkle proof from IPFS-hosted tree
 *
 * Response format:
 * - 200: { data: { index, amount, proof } }
 * - 400: { error: "Invalid address" }
 * - 404: { error: "Address not eligible" }
 * - 500: { error: "Internal server error" }
 */
export async function GET(request: NextRequest): Promise<NextResponse<ProofApiResponse>> {
  try {
    const address = request.nextUrl.searchParams.get("address");

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Fetch tree from IPFS (cached after first request)
    const tree = await getMerkleTree();

    // Search for the address in the tree
    // Leaf structure: [index, address, amount]
    for (const [treeIndex, value] of tree.entries()) {
      const [index, entryAddress, entryAmount] = value;

      // Case-insensitive address comparison
      if (entryAddress.toLowerCase() === address.toLowerCase()) {
        const proof = tree.getProof(treeIndex);

        const claimData: ClaimData = {
          amount: entryAmount,
          index: Number(index), // Use index from leaf data
          proof: proof as Hex[],
        };

        return NextResponse.json({ data: claimData });
      }
    }

    // Address not found in tree
    return NextResponse.json({ error: "Address not eligible" }, { status: 404 });
  } catch (error) {
    console.error("Error generating proof:", error);

    // Return detailed error in development
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS support
 * Allows external integrations to call this API
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
    status: 200,
  });
}
