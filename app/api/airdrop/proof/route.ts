import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Hex } from "viem";
import { isAddress } from "viem";
import type { ClaimData, ProofApiResponse } from "@/lib/types/airdrop.types";
import type { IpfsMerkleData } from "@/lib/types/ipfs.types";

type AirdropTree = StandardMerkleTree<[string, string, string]>;

type CachedAirdropTree = {
  tree: AirdropTree;
  /** Lowercase address -> treeIndex; built once per tree load for O(1) lookup. */
  addressIndex: Map<string, number>;
};

// In-memory cache for the Merkle tree and its address index.
// Avoids fetching from IPFS on every request and scanning all leaves per lookup.
let cached: CachedAirdropTree | null = null;

function arraysEqual(a: unknown, b: readonly string[]): boolean {
  if (!Array.isArray(a) || a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/**
 * Fetches and loads Merkle tree from IPFS.
 * Caches the tree plus a lowercase-address index in memory for subsequent requests.
 */
async function getMerkleTree(): Promise<CachedAirdropTree> {
  if (cached) {
    return cached;
  }

  const ipfsUrl = process.env.NEXT_PUBLIC_MERKLE_TREE_IPFS_URL;
  if (!ipfsUrl) {
    throw new Error("NEXT_PUBLIC_MERKLE_TREE_IPFS_URL is not configured");
  }

  console.log("Fetching Merkle tree from IPFS:", ipfsUrl);

  const response = await fetch(ipfsUrl, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
  }

  const data: IpfsMerkleData = await response.json();

  let treeData: { leafEncoding?: unknown; [key: string]: unknown };
  try {
    treeData = JSON.parse(data.merkle_tree);
  } catch (parseError) {
    throw new Error("IPFS payload contains malformed merkle_tree JSON", { cause: parseError });
  }

  // Leaf format: [index, address, amount]. OpenZeppelin requires `leafEncoding`;
  // some legacy uploads omit it, so backfill with the canonical Sablier format and
  // warn if a non-canonical encoding is supplied so we don't silently mis-load.
  const expectedEncoding = ["uint256", "address", "uint256"];
  if (!treeData.leafEncoding) {
    treeData.leafEncoding = expectedEncoding;
  } else if (!arraysEqual(treeData.leafEncoding, expectedEncoding)) {
    console.warn("Unexpected leaf encoding:", treeData.leafEncoding);
  }

  // `StandardMerkleTree.load` validates the payload at runtime; the IPFS-sourced
  // JSON cannot be statically typed, so we route it through `unknown`.
  const tree = StandardMerkleTree.load(
    treeData as unknown as Parameters<typeof StandardMerkleTree.load<[string, string, string]>>[0],
  );

  // Build a lowercase-address -> treeIndex map for O(1) lookup.
  const addressIndex = new Map<string, number>();
  for (const [treeIndex, [, entryAddress]] of tree.entries()) {
    addressIndex.set(entryAddress.toLowerCase(), treeIndex);
  }

  cached = { addressIndex, tree };

  console.log("Merkle tree loaded successfully:", {
    recipients: data.number_of_recipients,
    root: data.root,
  });

  return cached;
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
    const { tree, addressIndex } = await getMerkleTree();

    const treeIndex = addressIndex.get(address.toLowerCase());
    if (treeIndex === undefined) {
      return NextResponse.json({ error: "Address not eligible" }, { status: 404 });
    }

    // Leaf structure: [index, address, amount]
    const [leafIndex, , entryAmount] = tree.at(treeIndex) ?? [];
    if (leafIndex === undefined || entryAmount === undefined) {
      // Defensive: index map and tree are built in lockstep so this should never trigger.
      throw new Error("Merkle tree address index is out of sync with the tree");
    }

    const claimData: ClaimData = {
      amount: entryAmount,
      index: Number(leafIndex),
      proof: tree.getProof(treeIndex) as Hex[],
    };

    return NextResponse.json({ data: claimData });
  } catch (error) {
    // Log full error server-side; never echo raw error details to the client to avoid
    // leaking IPFS URLs, env var names, or stack-derived info.
    console.error("Error generating proof:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS support
 * Allows external integrations to call this API
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
