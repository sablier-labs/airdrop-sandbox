# Sablier Airdrops v2.0 Contract Architecture

## Overview

Sablier Airdrops is a Merkle tree-based airdrop distribution system that enables efficient token distribution to up to
1M+ recipients. The system uses on-chain Merkle root verification while storing full recipient data on IPFS, minimizing
gas costs.

## Contract Architecture

### Core Contracts

#### 1. SablierMerkleFactory

The factory contract for deploying airdrop campaigns.

**Purpose**: Deploy and manage Merkle-based airdrop campaigns

**Key Methods**:

- `createMerkleInstant()` - Deploy instant airdrop campaigns
- `createMerkleLL()` - Deploy Lockup Linear (vesting) campaigns
- `createMerkleLT()` - Deploy Lockup Tranched (staged vesting) campaigns

**Deployment Addresses** (v1.3):

**Mainnets**:

- Ethereum: `0x71DD3Ca88E7564416E5C2E350090C12Bf8F6144a`
- Arbitrum: `0x7efd170e3e32Dc1b4c17eb4cFFf92c81FF43a6cb`
- Polygon: `0xf0d61b42311C810dfdE191D58427d81E87c5d5F6`
- Base: `0xD9e108f26fe104CE1058D48070438deDB3aD826A`
- Optimism: Similar pattern on other chains

**Testnets**:

- Sepolia: `0xf642751d1271c88bBb8786067de808B32a016Fd4`
- Arbitrum Sepolia: `0x465E9218C1A8d36169e0c40C01b856A83CE44153`
- Base Sepolia: `0x6a3466398A66c7Ce801989B45C390cdC8717102D`

> Full deployment addresses: https://docs.sablier.com/guides/airdrops/deployments

#### 2. SablierMerkleInstant

Enables instant token distribution without vesting.

**Inherits**: `SablierMerkleBase`

**Key Features**:

- Single-transaction claims
- Immediate token transfer to recipient wallet
- No vesting or time locks

**Events**:

```solidity
event Claim(uint256 index, address recipient, uint128 amount);
```

**Claim Function**:

```solidity
function claim(
    uint256 index,
    address recipient,
    uint128 amount,
    bytes32[] calldata merkleProof
) external returns (uint256);
```

#### 3. SablierMerkleLL (Lockup Linear)

Enables airdrops with linear vesting schedules.

**Inherits**: `SablierMerkleBase`, `ISablierV2LockupLinear`

**Key Features**:

- Linear vesting over configurable duration
- Cliff period support
- Start time flexibility (absolute or relative)
- Stream-based distribution

**Claim Function**:

```solidity
function claim(
    uint256 index,
    address recipient,
    uint128 amount,
    bytes32[] calldata merkleProof
) external returns (uint256 streamId);
```

**Schedule Configuration**:

```solidity
struct Schedule {
    uint40 startTime;        // Unix timestamp or 0 for relative
    UD2x18 startPercentage;  // % unlocked at start (e.g., 0.01e18 = 1%)
    uint40 cliffDuration;    // Cliff period in seconds
    UD2x18 cliffPercentage;  // % unlocked after cliff
    uint40 totalDuration;    // Total vesting duration
}
```

#### 4. SablierMerkleLT (Lockup Tranched)

Enables airdrops with staged/milestone-based vesting.

**Inherits**: `SablierMerkleBase`, `ISablierV2LockupTranched`

**Key Features**:

- Multiple discrete unlock tranches
- Flexible unlock percentages per tranche
- Milestone-based distribution

**Claim Function**: Same signature as MerkleLL

**Tranche Calculation**:

- Calculates stream tranches based on predefined unlock percentages
- Supports multiple tranches with different amounts and durations

### Base Contract: SablierMerkleBase

All Merkle airdrop contracts inherit from this base.

**Public/External Functions**:

```solidity
// Core claiming
function claim(
    uint256 index,
    address recipient,
    uint128 amount,
    bytes32[] calldata merkleProof
) external;

// Eligibility checking
function hasClaimed(uint256 index) external view returns (bool);
function hasExpired() external view returns (bool);

// Campaign metadata
function campaignName() external view returns (string memory);
function getFirstClaimTime() external view returns (uint40);
function shape() external view returns (string memory);

// Admin functions
function clawback(address to, uint128 amount) external;
function collectFees(address factoryAdmin) external;
```

**State Variables**:

```solidity
bytes32 public immutable MERKLE_ROOT;      // Root of Merkle tree
IERC20 public immutable TOKEN;             // ERC20 token for airdrop
uint40 public immutable EXPIRATION;        // Campaign expiration timestamp
uint256 public immutable FEE;              // Required fee for claiming (native token)
string public ipfsCID;                     // IPFS content identifier for full data
```

**Events**:

```solidity
event Claim(uint256 index, address recipient, uint128 amount);
event Clawback(address admin, address to, uint256 amount);
```

## Merkle Tree Structure

### Data Storage

**On-Chain**:

- Merkle root (32 bytes)
- Campaign metadata
- Claim status bitmap

**Off-Chain (IPFS)**:

- Complete recipient list with addresses and amounts
- Referenced via `ipfsCID`

### Merkle Proof Verification

**Leaf Generation**:

```solidity
bytes32 leaf = keccak256(abi.encodePacked(index, recipient, amount));
```

**Verification Process**:

1. Generate leaf hash from `(index, recipient, amount)`
2. Verify Merkle proof against stored `MERKLE_ROOT`
3. Check index hasn't been claimed (bitmap check)
4. Verify campaign hasn't expired
5. Verify sufficient fee payment (if required)

**Claim Status Tracking**:

- Uses bitmap to efficiently track claimed indices
- Prevents double-claiming
- Gas-efficient for large recipient lists

## Claiming Flow

### 1. Check Eligibility (Frontend)

**Required Data**:

- Campaign contract address
- User's wallet address

**Steps**:

```typescript
// 1. Get campaign details
const merkleRoot = await campaignContract.MERKLE_ROOT();
const hasExpired = await campaignContract.hasExpired();
const token = await campaignContract.TOKEN();

// 2. Fetch eligibility from Merkle API or IPFS
const eligibility = await fetch(`${MERKLE_API_URL}/eligibility`, {
  method: "POST",
  body: JSON.stringify({
    campaignAddress: campaignContract.address,
    userAddress: walletAddress,
    chainId: chainId,
  }),
});

// Response format (expected):
// {
//   eligible: boolean,
//   index: number,
//   amount: string,
//   proof: string[]  // Array of hex strings
// }

// 3. Check if already claimed
const hasClaimed = await campaignContract.hasClaimed(eligibility.index);
```

### 2. Claim Airdrop (Transaction)

**Required Parameters**:

- `index`: Position in Merkle tree (from eligibility check)
- `recipient`: Destination address for tokens
- `amount`: Token amount (from eligibility check)
- `merkleProof`: Array of proof hashes (from eligibility check)

**Transaction Example**:

```typescript
// Prepare transaction
const tx = await campaignContract.claim(
  eligibility.index, // uint256
  recipientAddress, // address
  eligibility.amount, // uint128
  eligibility.proof, // bytes32[]
  {
    value: fee, // Pay claim fee if required
  },
);

// Wait for confirmation
const receipt = await tx.wait();

// Extract streamId from events (for vesting campaigns)
const claimEvent = receipt.events?.find((e) => e.event === "Claim");
const streamId = claimEvent?.args?.streamId; // Only for LL/LT campaigns
```

### 3. Post-Claim (Vesting Only)

For `MerkleLL` and `MerkleLT` campaigns, claiming creates a stream:

```typescript
// Get stream details from Lockup contract
const lockupContract = await campaignContract.LOCKUP_LINEAR(); // or LOCKUP_TRANCHED
const stream = await lockupContract.getStream(streamId);

// Stream properties:
// - sender: Campaign contract
// - recipient: User's address
// - depositAmount: Total vested amount
// - startTime: Vesting start
// - endTime: Vesting end
// - wasCanceled: Cancellation status

// Withdraw available tokens
const withdrawable = await lockupContract.withdrawableAmountOf(streamId);
await lockupContract.withdraw(streamId, recipientAddress, withdrawable);
```

## Campaign Creation

### Required Parameters

**Base Parameters** (all campaign types):

```solidity
struct ConstructorParams {
    address asset;              // ERC20 token address
    bytes32 merkleRoot;         // Merkle tree root
    uint40 expiration;          // Expiration timestamp
    address initialAdmin;       // Admin address
    string campaignName;        // Human-readable name
    string ipfsCID;            // IPFS content identifier
}
```

**Additional for MerkleLL**:

```solidity
struct CreateMerkleLL {
    ConstructorParams baseParams;
    ISablierV2LockupLinear lockup;    // Lockup Linear contract
    bool cancelable;                   // Can admin cancel streams
    bool transferable;                 // Can recipients transfer streams
    Schedule schedule;                 // Vesting schedule
    uint256 aggregateAmount;           // Total token amount
    uint256 recipientCount;            // Number of recipients
}
```

**Additional for MerkleLT**:

```solidity
struct CreateMerkleLT {
    ConstructorParams baseParams;
    ISablierV2LockupTranched lockup;  // Lockup Tranched contract
    bool cancelable;
    bool transferable;
    LockupTranched.TrancheWithPercentage[] tranchesWithPercentages;
    uint256 aggregateAmount;
    uint256 recipientCount;
}
```

### Factory Usage Example

```solidity
// Deploy instant airdrop
ISablierMerkleInstant campaign = factory.createMerkleInstant({
    baseParams: baseParams,
    aggregateAmount: 1000000e18,
    recipientCount: 10000
});

// Deploy linear vesting airdrop
ISablierMerkleLL campaign = factory.createMerkleLL({
    baseParams: baseParams,
    lockup: lockupLinear,
    cancelable: false,
    transferable: true,
    schedule: Schedule({
        startTime: 0,                        // Relative start
        startPercentage: ud2x18(0.01e18),   // 1% at start
        cliffDuration: 30 days,
        cliffPercentage: ud2x18(0.01e18),   // 1% after cliff
        totalDuration: 90 days
    }),
    aggregateAmount: 1000000e18,
    recipientCount: 10000
});
```

## Merkle API Integration

### Overview

The Sablier Merkle API is a Rust-based REST API for:

- Generating Merkle trees from CSV data
- Checking address eligibility
- Retrieving Merkle proofs for claiming
- Managing campaign data on IPFS

**Repository**: https://github.com/sablier-labs/merkle-api

### Deployment Options

1. **Self-hosted**: Fork and deploy on your infrastructure
2. **Vercel**: Deploy as serverless functions
3. **Request from Sablier**: Contact team for hosted backend access

### API Endpoints

**Note**: Specific endpoint documentation is referenced but not fully detailed in public docs. Expected routes based on
source code:

1. **Health Check**: `GET /health`
2. **Eligibility Check**: `POST /eligibility`
3. **Create Campaign**: `POST /create`
4. **Validity Check**: `GET /validity`

**Expected Eligibility Request**:

```typescript
POST /eligibility
Content-Type: application/json

{
  "campaignAddress": "0x...",
  "userAddress": "0x...",
  "chainId": 1
}
```

**Expected Eligibility Response**:

```typescript
{
  "eligible": true,
  "index": 42,
  "amount": "1000000000000000000",  // Wei format
  "proof": [
    "0xabcd...",
    "0xef12...",
    // ... more proof hashes
  ]
}
```

### CSV Format for Campaign Creation

Required columns for recipient data:

- `address`: Recipient wallet address
- `amount`: Token amount (in token units)

**Example CSV**:

```csv
address,amount
0x1234567890123456789012345678901234567890,1000
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,500
```

**CSV Generator**: https://gist.github.com/gavriliumircea/2a9797f207a2a2f3832ddaa376337e8c

## ABIs and TypeScript Integration

### Package Installation

```bash
npm install @sablier/airdrops
# or
bun add @sablier/airdrops
```

### Contract ABIs

ABIs are available in the installed package under:

- `@sablier/airdrops/artifacts/` - JSON build artifacts
- `@sablier/airdrops/src/interfaces/` - Solidity interfaces (GPL-3.0)
- `@sablier/airdrops/src/types/` - TypeScript type definitions (GPL-3.0)

### TypeScript Example

```typescript
import { SablierMerkleInstant__factory } from "@sablier/airdrops";
import { ethers } from "ethers";

// Connect to campaign contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const campaignAddress = "0x..."; // Deployed campaign address
const campaign = SablierMerkleInstant__factory.connect(campaignAddress, signer);

// Check eligibility (fetch from your API)
const eligibility = await fetchEligibility(campaignAddress, await signer.getAddress());

if (!eligibility.eligible) {
  throw new Error("Not eligible for airdrop");
}

// Check if already claimed
const claimed = await campaign.hasClaimed(eligibility.index);
if (claimed) {
  throw new Error("Already claimed");
}

// Get required fee
const fee = await campaign.FEE();

// Claim airdrop
const tx = await campaign.claim(eligibility.index, await signer.getAddress(), eligibility.amount, eligibility.proof, {
  value: fee,
});

await tx.wait();
console.log("Airdrop claimed successfully!");
```

## Important Considerations

### Gas Optimization

- **Merkle tree depth**: Affects proof size and verification gas cost
- **Batch claims**: Not supported - one claim per transaction
- **Claim fees**: Since Feb 3, 2025, small UI fee charged on claims
- **Bitmap efficiency**: Claimed status stored in bitmap for gas savings

### Security

- **Proof verification**: All claims verified against on-chain Merkle root
- **Double-claim prevention**: Bitmap ensures each index claimed once
- **Expiration**: Campaigns have expiration timestamp
- **Clawback**: Admin can recover unclaimed tokens after expiration
- **Immutability**: Contracts are non-upgradeable (v1.3)
- **Audits**: Source code verified on block explorers

### Campaign Lifecycle

1. **Creation**: Deploy via factory, store Merkle root + IPFS CID
2. **Active**: Users claim with Merkle proofs
3. **Expiration**: After expiration timestamp, no new claims
4. **Clawback**: Admin can recover unclaimed tokens

### Fees

**As of February 3, 2025**:

- **Campaign creation**: Free
- **Airdrop claims**: Small UI fee (native token)
- **Stream withdrawals**: Small UI fee (for vesting campaigns)

**Fee checking**:

```solidity
uint256 fee = campaignContract.FEE();
// Pay fee with claim transaction: { value: fee }
```

### Vesting Stream Management

For `MerkleLL` and `MerkleLT` campaigns:

**Stream Creation**: Claiming creates a Lockup stream **Withdrawals**: Recipients withdraw from Lockup contract, not
Merkle contract **Cancellation**: Depends on `cancelable` flag set at creation **Transferability**: Depends on
`transferable` flag set at creation

**Lockup Contract Addresses**:

- Varies by chain
- Retrieve from campaign: `await campaign.LOCKUP_LINEAR()` or `LOCKUP_TRANCHED()`
- See: https://docs.sablier.com/guides/lockup/deployments

### GraphQL Indexing

Sablier provides GraphQL APIs for querying airdrop data:

**Indexers**:

- Envio (recommended)
- The Graph

**Queryable Data**:

- Campaign details
- Claim history
- User eligibility
- Transaction history
- Stream details (vesting)

**Documentation**: https://docs.sablier.com/api/overview

## Resources

### Documentation

- **Main Docs**: https://docs.sablier.com
- **Airdrops Guide**: https://docs.sablier.com/apps/features/airdrops
- **API Docs**: https://docs.sablier.com/api/overview
- **Deployment Addresses**: https://docs.sablier.com/guides/airdrops/deployments

### Code Repositories

- **Airdrops Contracts**: https://github.com/sablier-labs/airdrops
- **Merkle API**: https://github.com/sablier-labs/merkle-api
- **Lockup Contracts**: https://github.com/sablier-labs/lockup
- **Deployments**: https://github.com/sablier-labs/deployments

### NPM Packages

- **Airdrops**: `@sablier/airdrops` (v1.3.0)
- **Lockup Core**: `@sablier/v2-core`
- **Periphery**: `@sablier/v2-periphery`

### Tools

- **CSV Generator**: https://gist.github.com/gavriliumircea/2a9797f207a2a2f3832ddaa376337e8c
- **Web App**: https://app.sablier.com/airdrops

## Summary

### For Frontend Developers

**Minimum Required**:

1. Campaign contract address
2. Access to Merkle API for eligibility/proofs
3. Contract ABIs from `@sablier/airdrops`
4. User's wallet connection

**Claiming Flow**:

1. Check eligibility via Merkle API → get `index`, `amount`, `proof`
2. Check `hasClaimed(index)` on contract
3. Get required `FEE()` from contract
4. Call `claim(index, recipient, amount, proof)` with fee value
5. For vesting: Track streamId from event, allow withdrawals from Lockup contract

**Key Methods**:

- `claim()` - Submit claim with proof
- `hasClaimed()` - Check claim status
- `hasExpired()` - Check campaign validity
- `FEE()` - Get required claim fee
- `TOKEN()` - Get airdrop token address

**Gotchas**:

- Fee required since Feb 2025 (native token, not airdrop token)
- Proofs must come from trusted source (API or IPFS)
- Index must match exactly (from API)
- Vesting campaigns return streamId, not tokens directly
- Contracts non-upgradeable - verify addresses carefully
