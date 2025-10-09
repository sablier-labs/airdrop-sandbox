import type { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import type { Address, Hash } from "viem";
import { getAddress } from "viem";
import type { MerkleRecipient } from "./tree";

/**
 * CUSTOMIZE: Replace this mock data with your actual recipient list.
 *
 * Options for loading real data:
 *
 * 1. **From JSON file:**
 * ```typescript
 * import recipients from "./recipients.json";
 * export const MOCK_RECIPIENTS = recipients as MerkleRecipient[];
 * ```
 *
 * 2. **From API endpoint:**
 * ```typescript
 * export async function loadRecipients(): Promise<MerkleRecipient[]> {
 *   const response = await fetch("/api/recipients");
 *   const data = await response.json();
 *   return data.map(r => ({
 *     address: getAddress(r.address),
 *     amount: BigInt(r.amount)
 *   }));
 * }
 * ```
 *
 * 3. **From CSV file:**
 * ```typescript
 * import { parse } from "csv-parse/sync";
 * import fs from "fs";
 *
 * const csvContent = fs.readFileSync("recipients.csv", "utf-8");
 * const records = parse(csvContent, { columns: true });
 * export const RECIPIENTS = records.map(r => ({
 *   address: getAddress(r.address),
 *   amount: BigInt(r.amount)
 * }));
 * ```
 *
 * 4. **From blockchain events:**
 * ```typescript
 * import { createPublicClient, http } from "viem";
 * import { mainnet } from "viem/chains";
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * });
 *
 * export async function loadFromEvents() {
 *   const logs = await client.getContractEvents({
 *     address: "0x...",
 *     abi: [...],
 *     eventName: "Snapshot",
 *     fromBlock: 18000000n,
 *     toBlock: "latest",
 *   });
 *
 *   return logs.map(log => ({
 *     address: log.args.holder,
 *     amount: log.args.balance,
 *   }));
 * }
 * ```
 *
 * 5. **From database:**
 * ```typescript
 * import { db } from "@/lib/db";
 *
 * export async function loadFromDatabase() {
 *   const results = await db.query(
 *     "SELECT address, amount FROM airdrop_recipients WHERE campaign_id = $1",
 *     [campaignId]
 *   );
 *
 *   return results.rows.map(row => ({
 *     address: getAddress(row.address),
 *     amount: BigInt(row.amount),
 *   }));
 * }
 * ```
 */
export const MOCK_RECIPIENTS: MerkleRecipient[] = [
  {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" as Address,
    amount: 1000000000000000000n, // 1.0 tokens (18 decimals)
  },
  {
    address: "0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as Address,
    amount: 2500000000000000000n, // 2.5 tokens
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as Address,
    amount: 5000000000000000000n, // 5.0 tokens
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" as Address,
    amount: 10000000000000000000n, // 10.0 tokens
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" as Address,
    amount: 750000000000000000n, // 0.75 tokens
  },
  {
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" as Address,
    amount: 3333333333333333333n, // ~3.33 tokens
  },
  {
    address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
    amount: 15000000000000000000n, // 15.0 tokens
  },
  {
    address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" as Address,
    amount: 500000000000000000n, // 0.5 tokens
  },
  {
    address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" as Address,
    amount: 8000000000000000000n, // 8.0 tokens
  },
  {
    address: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720" as Address,
    amount: 12000000000000000000n, // 12.0 tokens
  },
];

/**
 * Eligibility information for a specific address.
 */
export interface EligibilityData {
  /**
   * Whether the address is eligible for the airdrop
   */
  eligible: true;

  /**
   * The index of the address in the Merkle tree
   */
  index: number;

  /**
   * The amount of tokens allocated to this address
   */
  amount: bigint;

  /**
   * The Merkle proof for this address (array of sibling hashes)
   */
  proof: Hash[];

  /**
   * The recipient's address (checksummed)
   */
  address: Address;
}

/**
 * Gets eligibility information for a specific address from the Merkle tree.
 *
 * @param address - The address to check (will be checksummed automatically)
 * @param tree - The StandardMerkleTree instance
 * @returns Eligibility data if found, null if not eligible
 *
 * @example
 * ```typescript
 * import { generateMerkleTree } from "./tree";
 * import { MOCK_RECIPIENTS } from "./data";
 *
 * const tree = generateMerkleTree(MOCK_RECIPIENTS);
 * const eligibility = getEligibilityForAddress(
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   tree
 * );
 *
 * if (eligibility) {
 *   console.log(`Eligible for ${eligibility.amount} tokens`);
 *   console.log(`Proof:`, eligibility.proof);
 *   console.log(`Index:`, eligibility.index);
 * } else {
 *   console.log("Not eligible for this airdrop");
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Example: Use in a React component
 * function ClaimButton({ userAddress }: { userAddress: Address }) {
 *   const tree = useMemo(() => generateMerkleTree(MOCK_RECIPIENTS), []);
 *   const eligibility = useMemo(
 *     () => getEligibilityForAddress(userAddress, tree),
 *     [userAddress, tree]
 *   );
 *
 *   if (!eligibility) {
 *     return <div>You are not eligible for this airdrop</div>;
 *   }
 *
 *   return (
 *     <button onClick={() => claim(eligibility.proof, eligibility.index, eligibility.amount)}>
 *       Claim {formatUnits(eligibility.amount, 18)} tokens
 *     </button>
 *   );
 * }
 * ```
 *
 * CUSTOMIZE: Add caching for large trees:
 * ```typescript
 * const eligibilityCache = new Map<Address, EligibilityData | null>();
 *
 * export function getEligibilityForAddress(
 *   address: Address,
 *   tree: StandardMerkleTree<[string, bigint]>
 * ): EligibilityData | null {
 *   const checksummedAddress = getAddress(address);
 *
 *   if (eligibilityCache.has(checksummedAddress)) {
 *     return eligibilityCache.get(checksummedAddress)!;
 *   }
 *
 *   // ... computation ...
 *
 *   eligibilityCache.set(checksummedAddress, result);
 *   return result;
 * }
 * ```
 */
export function getEligibilityForAddress(
  address: Address,
  tree: StandardMerkleTree<[string, bigint]>,
): EligibilityData | null {
  // Checksum the address to ensure consistent comparison
  const checksummedAddress = getAddress(address);

  // Search through the tree entries to find the matching address
  for (const [index, value] of tree.entries()) {
    const [entryAddress, entryAmount] = value;

    // Compare checksummed addresses
    if (getAddress(entryAddress) === checksummedAddress) {
      // Get the Merkle proof for this entry
      const proof = tree.getProof(index) as Hash[];

      return {
        address: checksummedAddress,
        amount: entryAmount,
        eligible: true,
        index,
        proof,
      };
    }
  }

  // Address not found in tree
  return null;
}

/**
 * CUSTOMIZE: Add utility functions for your specific use case.
 *
 * Examples:
 */

/**
 * Gets eligibility data for multiple addresses in a single operation.
 * More efficient than calling getEligibilityForAddress multiple times.
 *
 * @example
 * ```typescript
 * const addresses = ["0x123...", "0x456...", "0x789..."];
 * const results = getBatchEligibility(addresses, tree);
 *
 * results.forEach((result, i) => {
 *   if (result) {
 *     console.log(`${addresses[i]}: ${result.amount} tokens`);
 *   } else {
 *     console.log(`${addresses[i]}: Not eligible`);
 *   }
 * });
 * ```
 */
export function getBatchEligibility(
  addresses: Address[],
  tree: StandardMerkleTree<[string, bigint]>,
): Array<EligibilityData | null> {
  // Build a map for O(1) lookups
  const eligibilityMap = new Map<Address, EligibilityData>();

  for (const [index, value] of tree.entries()) {
    const [entryAddress, entryAmount] = value;
    const checksummed = getAddress(entryAddress);

    eligibilityMap.set(checksummed, {
      address: checksummed,
      amount: entryAmount,
      eligible: true,
      index,
      proof: tree.getProof(index) as Hash[],
    });
  }

  // Map input addresses to their eligibility
  return addresses.map((addr) => {
    const checksummed = getAddress(addr);
    return eligibilityMap.get(checksummed) ?? null;
  });
}

/**
 * Gets all eligible addresses and their allocations.
 * Useful for generating reports or displaying the full recipient list.
 *
 * @example
 * ```typescript
 * const all = getAllEligible(tree);
 * console.log(`Total recipients: ${all.length}`);
 * console.log(`Total allocation: ${all.reduce((sum, e) => sum + e.amount, 0n)}`);
 * ```
 */
export function getAllEligible(tree: StandardMerkleTree<[string, bigint]>): EligibilityData[] {
  const results: EligibilityData[] = [];

  for (const [index, value] of tree.entries()) {
    const [entryAddress, entryAmount] = value;

    results.push({
      address: getAddress(entryAddress),
      amount: entryAmount,
      eligible: true,
      index,
      proof: tree.getProof(index) as Hash[],
    });
  }

  return results;
}

/**
 * Gets summary statistics for the recipient list.
 *
 * @example
 * ```typescript
 * const stats = getRecipientStats(tree);
 * console.log(`Recipients: ${stats.count}`);
 * console.log(`Total: ${formatUnits(stats.total, 18)} tokens`);
 * console.log(`Average: ${formatUnits(stats.average, 18)} tokens`);
 * console.log(`Min: ${formatUnits(stats.min, 18)} tokens`);
 * console.log(`Max: ${formatUnits(stats.max, 18)} tokens`);
 * ```
 */
export function getRecipientStats(tree: StandardMerkleTree<[string, bigint]>): {
  count: number;
  total: bigint;
  average: bigint;
  min: bigint;
  max: bigint;
} {
  let count = 0;
  let total = 0n;
  let min = BigInt(Number.MAX_SAFE_INTEGER);
  let max = 0n;

  for (const [, value] of tree.entries()) {
    const [, amount] = value;
    count++;
    total += amount;
    if (amount < min) min = amount;
    if (amount > max) max = amount;
  }

  return {
    average: count > 0 ? total / BigInt(count) : 0n,
    count,
    max,
    min: count > 0 ? min : 0n,
    total,
  };
}
