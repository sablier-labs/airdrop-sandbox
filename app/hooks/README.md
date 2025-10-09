# Campaign Data Hooks

Type-safe React hooks for reading Sablier Merkle airdrop campaign data.

## Hooks

### `useCampaignInfo`

Aggregates campaign information from contract state with batched reads for optimal performance.

```tsx
import { useCampaignInfo } from "@/app/hooks";

function CampaignHeader() {
  const { tokenAddress, merkleRoot, claimFee, hasExpired, campaignName, isLoading } = useCampaignInfo();

  if (isLoading) return <Spinner />;
  if (hasExpired) return <ExpiredBadge />;

  return (
    <div>
      <h1>{campaignName}</h1>
      <p>Token: {tokenAddress}</p>
      <p>Fee: {formatEther(claimFee || 0n)} ETH</p>
    </div>
  );
}
```

**Features:**

- Batched contract reads using `useReadContracts`
- Auto-refresh every 30 seconds (configurable)
- Combines on-chain data with campaign config
- Type-safe return values

**Data returned:**

- `tokenAddress` - ERC20 token being distributed
- `merkleRoot` - Merkle root for claim verification
- `claimFee` - Native token fee required to claim
- `hasExpired` - Whether campaign has expired
- `campaignName`, `distributionType`, `expiresAt` - From config

### `useTokenInfo`

Reads ERC20 token metadata (name, symbol, decimals).

```tsx
import { useTokenInfo } from "@/app/hooks";

function TokenDisplay({ address }: { address: Address }) {
  const { name, symbol, decimals, isLoading } = useTokenInfo(address);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>
        {name} ({symbol})
      </h2>
      <p>Decimals: {decimals}</p>
    </div>
  );
}
```

**Features:**

- Batched reads for name, symbol, decimals
- Cached indefinitely (token metadata is immutable)
- No polling by default
- Works with any ERC20-compliant token

## Usage

```tsx
import { useCampaignInfo, useTokenInfo } from "@/app/hooks";

function CampaignDashboard() {
  const { tokenAddress, claimFee, hasExpired } = useCampaignInfo();
  const { name, symbol } = useTokenInfo(tokenAddress);

  return (
    <div>
      <h1>Claiming {symbol}</h1>
      {hasExpired && <p>Campaign has ended</p>}
      <p>Fee: {formatEther(claimFee || 0n)} ETH</p>
    </div>
  );
}
```

## Configuration

Both hooks accept optional configuration:

```tsx
// Custom polling interval
const campaignInfo = useCampaignInfo(undefined, {
  pollingInterval: 60_000, // Poll every minute
  staleTime: 120_000, // Consider fresh for 2 minutes
  refetchOnWindowFocus: false, // Disable refetch on focus
});

// Override contract address
const campaignInfo = useCampaignInfo("0x1234...");
```

## Architecture

- **Type Safety**: Full TypeScript support with viem types
- **Batching**: Multiple reads in single RPC call
- **Caching**: React Query integration via wagmi
- **Error Handling**: Graceful degradation with error states
- **SSR Compatible**: Works with Next.js 15 App Router

## Related Hooks

The project also includes:

- `useEligibility` - Check claim eligibility
- `useClaim` - Execute claim transactions
- `useClaimStatus` - Check claim status for an index

See individual hook files for detailed documentation.
