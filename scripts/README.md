# Merkle Tree Generator

Generate Merkle trees compatible with Sablier Airdrops v2.0 contracts.

## Usage

### 1. Prepare Recipients Data

Create a JSON file with recipient addresses and amounts:

```json
[
  {
    "address": "0x...",
    "amount": "1000000000000000000"
  }
]
```

**Important:** Amounts should be in the smallest token unit (e.g., wei for 18-decimal tokens).

See `data/recipients.example.json` for a complete example.

### 2. Generate Tree

```bash
bun run scripts/generate-merkle-tree.ts data/recipients.json data/merkle-tree.json
```

Or using the npm script:

```bash
bun run generate:merkle data/recipients.json data/merkle-tree.json
```

### 3. Output Files

- `data/merkle-tree.json` - Full tree data with metadata
- `data/merkle-tree.env.txt` - Minified format for environment variable

### 4. Upload to IPFS

Upload the generated `data/merkle-tree.json` to IPFS:

```bash
# Using IPFS CLI
ipfs add data/merkle-tree.json

# Or use a service like:
# - Pinata (https://pinata.cloud)
# - NFT.Storage (https://nft.storage)
# - Web3.Storage (https://web3.storage)
```

### 5. Configure Application

Add the Merkle root and IPFS URL to `.env.local`:

```bash
NEXT_PUBLIC_MERKLE_ROOT=0x...
NEXT_PUBLIC_MERKLE_TREE_IPFS_URL=https://ipfs.io/ipfs/YOUR_CID_HERE
```

### 6. Deploy Contract

Use the Merkle root from the output when deploying your Sablier airdrop contract.

## Validation

The script performs these checks:

- ✅ Valid Ethereum addresses
- ✅ No duplicate addresses
- ✅ Positive amounts
- ✅ Proper format

## Compatibility

Generated trees are compatible with:

- OpenZeppelin's Merkle Proof Solidity library
- Sablier Airdrops v2.0 contracts
- OpenZeppelin Merkle Tree JavaScript SDK
