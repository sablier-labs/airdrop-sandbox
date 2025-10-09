import type { Address, Hash } from "viem";
import { encodeAbiParameters, keccak256 } from "viem";

/**
 * CUSTOMIZE: This leaf hashing logic must match your Solidity contract's implementation.
 *
 * Standard OpenZeppelin Solidity verification:
 * ```solidity
 * bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(address, amount))));
 * require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
 * ```
 *
 * This double-hashing prevents second preimage attacks and is the OpenZeppelin standard.
 * If your contract uses a different hashing scheme, update getLeafHash() below.
 */

/**
 * Generates the leaf hash for a Merkle tree entry.
 *
 * This matches OpenZeppelin's standard double-hashing approach:
 * `keccak256(bytes.concat(keccak256(abi.encode(address, amount))))`
 *
 * @param index - The index of the leaf in the tree (for logging/debugging)
 * @param address - The recipient's Ethereum address
 * @param amount - The amount in smallest unit (wei/atoms)
 * @returns The computed leaf hash
 *
 * @example
 * ```typescript
 * const leafHash = getLeafHash(
 *   0,
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   1000000000000000000n // 1 token with 18 decimals
 * );
 * console.log("Leaf hash:", leafHash);
 * // => "0x..."
 * ```
 *
 * CUSTOMIZE: If your contract uses additional parameters:
 * ```typescript
 * export function getLeafHash(
 *   index: number,
 *   address: Address,
 *   amount: bigint,
 *   duration: bigint, // Add new parameter
 * ): Hash {
 *   const encoded = encodeAbiParameters(
 *     [
 *       { type: "address" },
 *       { type: "uint256" },
 *       { type: "uint256" }, // Add new type
 *     ],
 *     [address, amount, duration], // Add new value
 *   );
 *   const innerHash = keccak256(encoded);
 *   return keccak256(innerHash);
 * }
 * ```
 */
export function getLeafHash(_index: number, address: Address | string, amount: bigint): Hash {
  // First hash: keccak256(abi.encode(address, amount))
  const encoded = encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }],
    [address as Address, amount],
  );
  const innerHash = keccak256(encoded);

  // Second hash: keccak256(bytes.concat(innerHash))
  // In Solidity: keccak256(bytes.concat(keccak256(abi.encode(...))))
  return keccak256(innerHash);
}

/**
 * Verifies a Merkle proof for a specific claim.
 *
 * This replicates the on-chain verification logic to allow frontend validation
 * before submitting transactions, improving UX by catching invalid claims early.
 *
 * @param merkleRoot - The root hash of the Merkle tree (from contract)
 * @param proof - Array of sibling hashes for the Merkle proof path
 * @param index - The leaf index in the tree
 * @param address - The recipient's address to verify
 * @param amount - The claimed amount to verify
 * @returns True if the proof is valid, false otherwise
 *
 * @example
 * ```typescript
 * // Example: Verify before submitting transaction
 * const isValid = verifyProof(
 *   "0x1234...", // merkleRoot from contract
 *   ["0xabc...", "0xdef..."], // proof from tree
 *   0, // leaf index
 *   "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // recipient
 *   1000000000000000000n // amount
 * );
 *
 * if (!isValid) {
 *   console.error("Invalid proof - claim will fail");
 *   return;
 * }
 *
 * // Proceed with transaction
 * await claimContract.claim(proof, index, amount);
 * ```
 *
 * @example
 * ```typescript
 * // Example: Validate user input against stored tree
 * function validateClaim(userAddress: Address, claimAmount: bigint) {
 *   const eligibility = getEligibilityForAddress(userAddress, tree);
 *
 *   if (!eligibility) {
 *     throw new Error("Address not eligible");
 *   }
 *
 *   if (claimAmount !== eligibility.amount) {
 *     throw new Error("Amount mismatch");
 *   }
 *
 *   const isValid = verifyProof(
 *     tree.root,
 *     eligibility.proof,
 *     eligibility.index,
 *     userAddress,
 *     claimAmount
 *   );
 *
 *   return isValid;
 * }
 * ```
 *
 * CUSTOMIZE: Add debugging for failed proofs:
 * ```typescript
 * if (!isValid) {
 *   console.error("Proof verification failed:", {
 *     computedRoot,
 *     expectedRoot: merkleRoot,
 *     leaf: computedHash,
 *     proof,
 *   });
 * }
 * ```
 */
export function verifyProof(
  merkleRoot: Hash | string,
  proof: (Hash | string)[],
  index: number,
  address: Address | string,
  amount: bigint,
): boolean {
  // Recreate the leaf hash using the same logic as the contract
  let computedHash = getLeafHash(index, address, amount);

  // Process the proof to compute the root
  // This follows the OpenZeppelin MerkleProof.verify implementation
  for (const proofElement of proof) {
    if (computedHash < (proofElement as Hash)) {
      // Hash(current + sibling)
      computedHash = keccak256(
        encodeAbiParameters(
          [{ type: "bytes32" }, { type: "bytes32" }],
          [computedHash, proofElement as Hash],
        ),
      );
    } else {
      // Hash(sibling + current)
      computedHash = keccak256(
        encodeAbiParameters(
          [{ type: "bytes32" }, { type: "bytes32" }],
          [proofElement as Hash, computedHash],
        ),
      );
    }
  }

  // Check if the computed root matches the expected root
  return computedHash === (merkleRoot as Hash);
}

/**
 * Batch verifies multiple proofs efficiently.
 *
 * Useful for validating a set of claims or for testing.
 *
 * @param merkleRoot - The root hash of the Merkle tree
 * @param claims - Array of claims to verify
 * @returns Array of booleans indicating validity of each claim
 *
 * @example
 * ```typescript
 * const results = batchVerifyProofs(tree.root, [
 *   { proof: proof1, index: 0, address: addr1, amount: amt1 },
 *   { proof: proof2, index: 1, address: addr2, amount: amt2 },
 * ]);
 *
 * const allValid = results.every(r => r);
 * console.log(`${results.filter(r => r).length}/${results.length} proofs valid`);
 * ```
 */
export function batchVerifyProofs(
  merkleRoot: Hash | string,
  claims: Array<{
    proof: (Hash | string)[];
    index: number;
    address: Address | string;
    amount: bigint;
  }>,
): boolean[] {
  return claims.map((claim) =>
    verifyProof(merkleRoot, claim.proof, claim.index, claim.address, claim.amount),
  );
}
