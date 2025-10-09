import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { isAddress } from "viem";

/**
 * Recipient entry format
 */
type RecipientEntry = {
  address: string;
  amount: string;
};

/**
 * Validates recipient entries
 */
function validateEntries(entries: RecipientEntry[]): void {
  const seen = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    // Validate address format
    if (!isAddress(entry.address)) {
      throw new Error(`Invalid address at index ${index}: ${entry.address}`);
    }

    // Check for duplicates
    const normalized = entry.address.toLowerCase();
    if (seen.has(normalized)) {
      throw new Error(`Duplicate address at index ${index}: ${entry.address}`);
    }
    seen.add(normalized);

    // Validate amount
    const amount = BigInt(entry.amount);
    if (amount <= 0) {
      throw new Error(`Invalid amount at index ${index}: ${entry.amount}`);
    }
  }
}

/**
 * Generates a Merkle tree from recipient data
 */
function generateMerkleTree(inputPath: string, outputPath: string): void {
  console.log("🌳 Generating Merkle tree...");
  console.log(`📖 Reading recipients from: ${inputPath}`);

  // Read and parse input file
  const fileContent = readFileSync(inputPath, "utf-8");
  const recipients: RecipientEntry[] = JSON.parse(fileContent);

  console.log(`✅ Found ${recipients.length} recipients`);

  // Validate entries
  console.log("🔍 Validating entries...");
  validateEntries(recipients);
  console.log("✅ All entries valid");

  // Prepare values for StandardMerkleTree
  // Format: [index, address, amount] for each recipient (Sablier IPFS standard)
  const values = recipients.map((r, index) => [index.toString(), r.address, r.amount]);

  // Generate tree with type specification
  console.log("🔨 Building Merkle tree...");
  const tree = StandardMerkleTree.of(values, ["uint", "address", "uint256"]);

  // Get root hash
  const root = tree.root;
  console.log(`🌿 Merkle root: ${root}`);

  // Calculate total amount
  const totalAmount = recipients.reduce((sum, r) => sum + BigInt(r.amount), BigInt(0)).toString();

  // Serialize tree data
  const treeData = tree.dump();

  // Prepare output in Sablier IPFS format
  const output = {
    merkle_tree: JSON.stringify(treeData),
    number_of_recipients: recipients.length,
    recipients: recipients.map((r) => ({
      address: r.address,
      amount: r.amount,
    })),
    root,
    total_amount: totalAmount,
  };

  // Write to output file
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Tree data written to: ${outputPath}`);

  console.log("\n📋 Next steps:");
  console.log("1. Upload the tree to IPFS:");
  console.log(`   ipfs add ${outputPath}`);
  console.log("   Or use: Pinata, NFT.Storage, Web3.Storage");
  console.log("2. Add to .env.local:");
  console.log(`   NEXT_PUBLIC_MERKLE_ROOT=${root}`);
  console.log("   NEXT_PUBLIC_MERKLE_TREE_IPFS_URL=https://ipfs.io/ipfs/YOUR_CID_HERE");
  console.log("3. Deploy your airdrop contract with this Merkle root:");
}

// CLI execution
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error("Usage: bun run scripts/generate-merkle-tree.ts <input.json> <output.json>");
  console.error("");
  console.error("Example:");
  console.error(
    "  bun run scripts/generate-merkle-tree.ts data/recipients.json data/merkle-tree.json",
  );
  process.exit(1);
}

const [inputPath, outputPath] = args;

try {
  generateMerkleTree(join(process.cwd(), inputPath), join(process.cwd(), outputPath));
} catch (error) {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
}
