# Merkle Tree Utilities for Sablier Airdrops

Type-safe, production-ready Merkle tree implementation for token airdrops with cryptographic proof verification.

## Overview

This module provides comprehensive utilities for:

- **Tree Generation**: Create Merkle trees from recipient lists using OpenZeppelin's `StandardMerkleTree`
- **Proof Verification**: Verify claims on the frontend before submitting transactions
- **Eligibility Checks**: Query which addresses are eligible and their allocations
- **Data Persistence**: Export/import trees to/from JSON
- **Statistics**: Analyze distribution metrics

## Quick Start

```typescript
import { generateMerkleTree, getEligibilityForAddress, verifyProof, MOCK_RECIPIENTS } from "@/lib/merkle";

// 1. Generate tree
const tree = generateMerkleTree(MOCK_RECIPIENTS);
const root = tree.root; // Deploy this to your smart contract

// 2. Check user eligibility
const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const eligibility = getEligibilityForAddress(userAddress, tree);

if (eligibility) {
  // 3. Verify proof before claiming
  const isValid = verifyProof(root, eligibility.proof, eligibility.index, userAddress, eligibility.amount);

  if (isValid) {
    // Proceed with claim transaction
    await claimContract.write.claim([eligibility.proof, eligibility.index, eligibility.amount]);
  }
}
```

## Files

### `tree.ts` - Tree Generation & Management

Core functions for creating and persisting Merkle trees.

**Key Functions:**

- `generateMerkleTree(recipients)` - Creates tree from recipient array
- `exportTreeData(tree)` - Serializes tree to JSON
- `loadTreeData(json)` - Deserializes tree from JSON

**Types:**

- `MerkleRecipient` - Single recipient (address + amount)
- `MerkleTreeData` - Serialized tree format

### `verify.ts` - Proof Verification

Client-side verification matching Solidity's OpenZeppelin `MerkleProof.verify()`.

**Key Functions:**

- `verifyProof(root, proof, index, address, amount)` - Verify single proof
- `getLeafHash(index, address, amount)` - Compute leaf hash
- `batchVerifyProofs(root, claims)` - Verify multiple proofs

### `data.ts` - Eligibility & Statistics

Query helpers and mock data for development.

**Key Functions:**

- `getEligibilityForAddress(address, tree)` - Check single address
- `getBatchEligibility(addresses, tree)` - Check multiple addresses
- `getAllEligible(tree)` - Get all recipients
- `getRecipientStats(tree)` - Distribution statistics

**Mock Data:**

- `MOCK_RECIPIENTS` - 10 sample addresses for testing

### `example.ts` - Usage Examples

Seven complete examples demonstrating common workflows:

1. Generate tree and get root
2. Save and load tree data
3. Check eligibility
4. Verify proof
5. Get statistics
6. Get all eligible recipients
7. Complete claim workflow

## Architecture

### Encoding Format

The implementation uses `["address", "uint256"]` encoding, matching Sablier's contracts:

```solidity
// Solidity (in your contract)
bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(address, amount))));
require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
```

```typescript
// TypeScript (this implementation)
const leafHash = getLeafHash(index, address, amount);
// Uses: keccak256(keccak256(abi.encode(address, amount)))
```

### Type Safety

All functions use strict TypeScript with:

- `Address` for Ethereum addresses (viem's `0x${string}`)
- `bigint` for token amounts (no floating point)
- `Hash` for bytes32 values
- Full inference from OpenZeppelin's library

### Compatibility

Compatible with OpenZeppelin's Solidity implementation:

- `@openzeppelin/contracts/utils/cryptography/MerkleProof.sol`
- Double-hashing for preimage attack resistance
- Sorted sibling ordering for consistent proofs

## Customization

All files include extensive `// CUSTOMIZE:` comments marking extension points:

### Adding Fields to Recipients

If your contract requires additional parameters (e.g., vesting duration):

1. Update `MERKLE_ENCODING` in `tree.ts`:

   ```typescript
   const MERKLE_ENCODING = ["address", "uint256", "uint256"];
   ```

2. Update `MerkleRecipient` interface:

   ```typescript
   export interface MerkleRecipient {
     address: Address;
     amount: bigint;
     duration: bigint; // Add new field
   }
   ```

3. Update `generateMerkleTree` mapping:

   ```typescript
   return [checksummedAddress, recipient.amount, recipient.duration];
   ```

4. Update `getLeafHash` in `verify.ts`:
   ```typescript
   const encoded = encodeAbiParameters(
     [{ type: "address" }, { type: "uint256" }, { type: "uint256" }],
     [address, amount, duration],
   );
   ```

### Loading Real Data

Replace `MOCK_RECIPIENTS` in `data.ts`:

**From JSON:**

```typescript
import recipients from "./recipients.json";
export const RECIPIENTS = recipients as MerkleRecipient[];
```

**From API:**

```typescript
export async function loadRecipients(): Promise<MerkleRecipient[]> {
  const response = await fetch("/api/recipients");
  const data = await response.json();
  return data.map((r) => ({
    address: getAddress(r.address),
    amount: BigInt(r.amount),
  }));
}
```

**From Blockchain Events:**

```typescript
const logs = await publicClient.getContractEvents({
  address: tokenAddress,
  abi: erc20Abi,
  eventName: "Transfer",
  fromBlock: snapshotBlock,
  toBlock: snapshotBlock,
});

const recipients = logs.map((log) => ({
  address: log.args.to,
  amount: log.args.value,
}));
```

## Testing

```bash
# Run TypeScript validation
just tsc-check

# Format and validate
just full-check

# Test examples (uncomment runAllExamples() in example.ts)
bun run app/lib/merkle/example.ts
```

## Security Considerations

1. **Always verify proofs on-chain** - Frontend verification prevents wasted gas but isn't a security boundary
2. **Checksum addresses** - All addresses are checksummed via `getAddress()` to prevent case-sensitivity issues
3. **Validate amounts** - The implementation checks for positive amounts but add domain-specific validation
4. **Protect tree data** - If storing trees, ensure integrity (checksums, signatures, or trusted storage)

## Performance

- **Tree generation**: O(n log n) - Sub-second for 10,000 recipients
- **Eligibility lookup**: O(n) - Use `getBatchEligibility()` for multiple checks
- **Proof verification**: O(log n) - Constant time regardless of tree size
- **Proof size**: ~32 bytes × log₂(n) - 320 bytes for 1M recipients

## Dependencies

- `@openzeppelin/merkle-tree` - Trusted tree implementation
- `viem` - Type-safe Ethereum utilities (keccak256, encodeAbiParameters, getAddress)

## License

MIT (same as parent project)
