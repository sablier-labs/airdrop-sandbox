# Development Instructions

AI agents working on this Next.js project should follow these guidelines.

## Most Important Thing

After generating new code, run `just full-write` to format it, then `just full-check` to validate. If issues remain,
identify and resolve the root cause.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Package Manager**: bun
- **Task Runner**: just (casey/just)
- **Linter and Formatter for TypeScript and JSON**: Biome (not Prettier)
- **Formatter for Markdown and YAML**: Prettier
- **Date Handling**: dayjs (not native Date)
- **Web3**: wagmi, viem, RainbowKit, @sablier/airdrops

## Commands

### Dependency Management

```bash
bun install             # Install all dependencies
bun add package-name    # Add runtime dependency
bun add -d package-name # Add dev dependency
bun remove package-name # Remove dependency
bunx package-name       # Execute package
```

### Development Workflow

```bash
just dev        # Start dev server
just build      # Production build
just full-check # Lint, format check, type check
just full-write # Auto-fix all issues
just tsc-check  # TypeScript validation only
```

## Code Standards

### File Structure

- Components in `app/components/`
- API routes in `app/api/`
- Shared utilities in `app/lib/`
- Types in `app/types/`
- Keep components small and focused (single responsibility)

### TypeScript

- Always use strict mode
- Prefer `interface` over `type` for object shapes
- Use `satisfies` operator for type-safe constants
- Avoid `any`; use `unknown` if type is truly unknown
- Export types from dedicated `.types.ts` files

### React/Next.js Patterns

- Use Server Components by default
- Add `"use client"` only when needed (interactivity, hooks, browser APIs)
- Prefer `async/await` in Server Components over `useEffect`
- Use `loading.tsx` and `error.tsx` for route-level states
- Implement proper error boundaries
- Use Next.js Image component for all images
- Leverage ISR/SSG where appropriate

### State Management

- Server state: Server Components + fetch
- Client state: useState/useReducer for local state
- Complex client state: Consider Zustand or Jotai

### Styling

- Use Tailwind's design tokens (no arbitrary values unless necessary)
- Component variants with `tv` (tailwind-variants)
- Dark mode support via `dark:` modifier
- Consistent spacing scale
- Always apply `cursor-pointer` to buttons and any clickable HTML elements

### Performance

- Lazy load heavy components with `dynamic()`
- Use `next/font` for font optimization
- Implement proper loading states
- Optimize images (WebP, proper sizes)
- Code split at route boundaries
- Minimize client-side JavaScript

## Web3 Integration

### Core Principles

- **Always use checksummed addresses** via `getAddress()` from viem
- **Simulate transactions before execution** using `simulateContract`
- **Handle wallet connection states** properly (disconnected, connecting, connected)
- **Look for `// CUSTOMIZE:` comments** in the codebase for customization points

### Contract Reads with viem

```typescript
import { createPublicClient, http, getAddress } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Read contract data
const data = await publicClient.readContract({
  address: getAddress("0x..."), // Always checksum
  abi: airdropAbi,
  functionName: "hasClaimed",
  args: [getAddress(recipient)],
});
```

### Contract Writes with wagmi

```typescript
"use client";

import { useWriteContract, useSimulateContract } from "wagmi";
import { getAddress } from "viem";

function ClaimButton() {
  // Simulate first
  const { data: simulateData } = useSimulateContract({
    address: getAddress(airdropAddress),
    abi: airdropAbi,
    functionName: "claim",
    args: [index, recipient, amount, merkleProof],
  });

  // Execute write
  const { writeContract, isPending } = useWriteContract();

  const handleClaim = () => {
    if (!simulateData?.request) return;
    writeContract(simulateData.request);
  };

  return (
    <button onClick={handleClaim} disabled={isPending} className="cursor-pointer">
      {isPending ? "Claiming..." : "Claim Airdrop"}
    </button>
  );
}
```

### Merkle Proof Verification

```typescript
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { getAddress } from "viem";

// Generate tree from recipients
const tree = StandardMerkleTree.of(
  recipients.map((r) => [getAddress(r.address), r.amount]),
  ["address", "uint256"],
);

// Get proof for specific recipient
function getProof(address: string) {
  const checksummed = getAddress(address);
  for (const [i, v] of tree.entries()) {
    if (v[0] === checksummed) {
      return {
        index: i,
        proof: tree.getProof(i),
        amount: v[1],
      };
    }
  }
  return null;
}
```

### Wallet Connection State Handling

```typescript
"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function ClaimInterface() {
  const { address, isConnecting, isDisconnected } = useAccount();

  if (isDisconnected) {
    return (
      <div>
        <p>Connect your wallet to claim</p>
        <ConnectButton />
      </div>
    );
  }

  if (isConnecting) {
    return <div>Connecting...</div>;
  }

  return <ClaimButton userAddress={address} />;
}
```

### Common Patterns

#### Component Variants with Tailwind Variants

```typescript
import { tv } from "tailwind-variants";

const button = tv({
  base: "font-medium rounded-lg transition-colors cursor-pointer",
  variants: {
    variant: {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    },
    size: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

#### Data Fetching (Server Component)

```typescript
async function Page() {
  const data = await fetch("...", {
    next: { revalidate: 3600 },
  });
  return <div>{/* render */}</div>;
}
```

#### Client Component with Server Data

```typescript
// page.tsx (Server Component)
async function Page() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

// ClientComponent.tsx
"use client"

function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  // ...
}
```

## Troubleshooting

### Common Issues

1. **Hydration mismatch**: Check for browser-only code in SSR
2. **Module not found**: Clear `.next` and reinstall with `bun install`
3. **Type errors**: Run `just tsc-check` for detailed output
4. **Build failures**: Check `next build` output and env vars

### Debug Tips

- Use Playwright MCP
- Use `console.dir(obj, { depth: null })` for deep inspection
- Add `debugger` statements for breakpoints
- Check Network tab for API failures
- Use React DevTools for component state
