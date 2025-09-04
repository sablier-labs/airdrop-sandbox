# Template Components Guide

This document explains how to use the reusable components included in this airdrop template.

## UI Components

### DemoBanner

A banner component for showing demo mode notifications or important announcements.

**Location**: `components/ui/DemoBanner.tsx`

**Usage**:

```tsx
import { DemoBanner } from "@/components/ui/DemoBanner";

<DemoBanner
  message="Demo mode is active - transactions are simulated"
  details="10,450 addresses eligible for 5.08M SAPIEN"
  type="info" // or "warning"
  onDismiss={() => console.log("Banner dismissed")}
/>;
```

**Props**:

- `message` (string): Main message to display
- `details?` (string): Additional details text
- `type?` ("info" | "warning"): Banner style, defaults to "info"
- `onDismiss?` (function): Optional callback when user dismisses banner

**When to use**:

- Demo/test mode notifications
- Important announcements
- System status messages
- Maintenance notices

### LoadingState

A versatile loading component with multiple variants for different UI contexts.

**Location**: `components/ui/LoadingState.tsx`

**Usage**:

```tsx
import { LoadingState, SkeletonLoader, CardSkeleton } from "@/components/ui/LoadingState";

// Inline loading (for buttons, small areas)
<LoadingState variant="inline" size="sm" text="Checking eligibility..." />

// Card loading (for content areas)
<LoadingState variant="card" size="md" text="Loading campaign data..." />

// Overlay loading (modal-like)
<LoadingState variant="default" overlay={true} text="Processing..." />

// Skeleton loaders for placeholders
<SkeletonLoader lines={3} />
<CardSkeleton />
```

**Variants**:

- `inline`: Horizontal layout with spinner and text
- `card`: Vertical layout with enhanced animations
- `default`: Centered layout with ping animation
- `overlay`: Full-screen overlay with backdrop

**Sizes**: `sm`, `md`, `lg`

**When to use**:

- Async operations (eligibility checking, transactions)
- Data fetching states
- Form submissions
- Page transitions

## Utility Functions

### Toast Notifications

Styled toast notifications for user feedback.

**Location**: `lib/utils/toast.ts`

**Usage**:

```tsx
import { showToast, walletToasts, claimToasts } from "@/lib/utils/toast";

// Basic toasts
showToast.success("Operation successful!");
showToast.error("Something went wrong");
showToast.info("Information message");

// Wallet-specific toasts
walletToasts.connected(address);
walletToasts.connectionError("Failed to connect");

// Claim-specific toasts
claimToasts.eligible("1000", "SAPIEN");
claimToasts.claiming();
claimToasts.claimed(txHash);
```

**Toast Types**:

- `success`: Green, 4s duration
- `error`: Red, 5s duration
- `info`: Blue, 4s duration
- `loading`: Purple, persistent until dismissed

### Demo Mode

Demo mode utilities for testing without real blockchain interactions.

**Location**: `lib/utils/demo-mode.ts`, `lib/utils/demo-data.ts`

**Setup**:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

**Usage**:

```tsx
import { isDemoMode, checkDemoEligibility, mockClaim } from "@/lib/utils/demo-mode";

if (isDemoMode()) {
  // Use demo functions
  const result = await checkDemoEligibility(address);
  const claimResult = await mockClaim(proof);
}
```

**Features**:

- Simulated eligibility checking
- Mock claim transactions with 95% success rate
- Pre-defined test addresses with different allocation tiers
- Realistic transaction delays and error simulation

**Demo Data**:

- 20 pre-configured addresses
- 5 allocation tiers (100-50,000 tokens)
- Well-known Ethereum addresses for testing
- Generated Merkle tree and proofs

## Integration Examples

### Adding Loading States to New Components

```tsx
import { LoadingState } from "@/components/ui/LoadingState";

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  return <div>{isLoading ? <LoadingState variant="card" text="Loading data..." /> : <div>Your content here</div>}</div>;
}
```

### Using Demo Mode in Custom Logic

```tsx
import { isDemoMode, getDemoModeInfo } from "@/lib/utils/demo-mode";

export function useCustomEligibility() {
  const checkEligibility = async (address: string) => {
    if (isDemoMode()) {
      return await checkDemoEligibility(address);
    }

    // Your real eligibility logic here
    return await realEligibilityCheck(address);
  };

  return { checkEligibility };
}
```

### Custom Toast Messages

```tsx
import { showToast } from "@/lib/utils/toast";

export const customToasts = {
  streamCreated: (streamId: bigint) => showToast.success(`Stream #${streamId} created successfully!`),

  networkSwitchRequired: (network: string) => showToast.info(`Please switch to ${network} to continue`),
};
```

## Customization

### Styling Components

All components use Tailwind CSS classes and can be customized by:

1. **CSS Variables**: Modify theme colors in `globals.css`
2. **Component Props**: Pass custom `className` props
3. **Tailwind Config**: Extend theme in `tailwind.config.js`

### Adding New Demo Addresses

Edit `lib/utils/demo-data.ts`:

```tsx
const DEMO_ADDRESSES: Address[] = [
  // Add your test addresses here
  "0xYourTestAddress1",
  "0xYourTestAddress2",
  // ...
];
```

### Configuring Toast Appearance

Modify `lib/utils/toast.ts` to change styles:

```tsx
const customStyle = {
  background: "rgba(26, 26, 26, 0.95)",
  border: "1px solid rgba(124, 58, 237, 0.3)",
  borderRadius: "12px",
  color: "#ededed",
};
```

## Best Practices

1. **Use appropriate LoadingState variants**:
   - `inline` for buttons and small areas
   - `card` for content sections
   - `overlay` for modal-like loading

2. **Provide meaningful loading text**:
   - "Checking eligibility..." instead of "Loading..."
   - "Processing transaction..." instead of "Please wait..."

3. **Handle demo mode gracefully**:
   - Always check `isDemoMode()` before real blockchain calls
   - Provide clear demo mode indicators to users

4. **Use toast notifications consistently**:
   - Success: Confirmations and completions
   - Error: Failures and validation issues
   - Info: Status updates and neutral information

5. **Test with demo mode**:
   - Enable demo mode during development
   - Test all user flows with simulated data
   - Verify error scenarios work correctly
