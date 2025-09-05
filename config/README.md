# Sablier Airdrop Customization System

A comprehensive configuration system for customizing Sablier airdrop campaigns with flexible theming, branding, and
contract support.

## Quick Start

1. **Import the configuration hook**:

```typescript
import { useAirdropConfig } from "../hooks";
```

2. **Use in your component**:

```typescript
function MyComponent() {
  const { config, isLoaded, currentTheme } = useAirdropConfig();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <h1>{config.content.title}</h1>
      <p>{config.content.description}</p>
    </div>
  );
}
```

## Configuration Structure

### Main Config File

- `config/airdrop.config.ts` - Main configuration file
- Update this file to customize your airdrop campaign

### Key Sections

#### Contract Settings

```typescript
contract: {
  address: "0x...",           // Your contract address
  chainId: 1,                 // Network chain ID
  type: "instant",            // instant | lockup-linear | lockup-tranched
}
```

#### Branding

```typescript
branding: {
  logo: {
    light: "/logo-light.svg",  // Light theme logo
    dark: "/logo-dark.svg",    // Dark theme logo (optional)
    alt: "Your Project",
  },
  colors: {
    light: { /* light theme colors */ },
    dark: { /* dark theme colors */ },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    headingFont: "Inter, sans-serif",
  },
}
```

#### Content Customization

```typescript
content: {
  title: "Your Airdrop Title",
  description: "Campaign description",
  socialLinks: {
    website: "https://...",
    twitter: "https://...",
    discord: "https://...",
  },
}
```

## Available Hooks

### `useAirdropConfig(customConfig?)`

Main configuration hook with theme management.

```typescript
const {
  config, // Full configuration object
  isLoaded, // Loading state
  error, // Error state
  theme, // Current theme setting
  currentTheme, // Resolved theme (light/dark)
  isDarkMode, // Boolean for dark mode
  reload, // Reload configuration
  setTheme, // Change theme
} = useAirdropConfig();
```

### `useContractConfig()`

Contract-specific configuration.

```typescript
const { address, chainId, type, isInstant, isLockupLinear, isLockupTranched } = useContractConfig();
```

### `useBrandingConfig()`

Branding with theme-aware colors.

```typescript
const {
  logo,
  currentColors, // Theme-aware color scheme
  typography,
  currentTheme,
} = useBrandingConfig();
```

### `useCampaignConfig()`

Campaign timing and status.

```typescript
const {
  name,
  isActive, // Campaign is currently active
  hasStarted, // Campaign has started
  hasEnded, // Campaign has ended
  timeUntilStart, // Milliseconds until start
  timeUntilEnd, // Milliseconds until end
} = useCampaignConfig();
```

## Example Configurations

Ready-to-use examples in `config/examples/`:

### Contract Types

- **`instant-airdrop.ts`** - Instant token distribution
- **`lockup-linear.ts`** - Linear vesting configuration
- **`lockup-tranched.ts`** - Milestone-based unlocks

### Business Themes

- **`gaming-dao.ts`** - Gaming/DAO theme with vibrant colors
- **`eco-finance.ts`** - Sustainable finance with earth tones
- **`fintech-startup.ts`** - Professional fintech styling

### Usage

```typescript
import { gamingDAOConfig } from "../config/examples";

// Use directly
const { config } = useAirdropConfig(gamingDAOConfig);

// Or merge with custom overrides
const customConfig = {
  ...gamingDAOConfig,
  content: {
    ...gamingDAOConfig.content,
    title: "My Custom Title",
  },
};
```

## Configuration Presets

Use predefined presets with `config/presets.ts`:

```typescript
import { getPresetById, getPresetsByCategory } from "../config/presets";

// Get specific preset
const gamingPreset = getPresetById("gaming-dao");

// Get presets by category
const contractPresets = getPresetsByCategory("contract");
const minimalPresets = getPresetsByCategory("minimal");
```

## Theming System

### CSS Variables

The system automatically applies CSS custom properties:

- Color scheme variables (`--primary`, `--background`, etc.)
- Typography variables (`--font-family`, `--font-heading`)
- Font size variables (`--font-size-lg`, etc.)

### Component Variants

Customize component appearances:

```typescript
ui: {
  components: {
    button: "default" | "outline" | "ghost" | "link",
    card: "default" | "elevated" | "outline" | "subtle",
    input: "default" | "ghost" | "underline",
  },
}
```

### Theme Management

```typescript
const { setTheme, currentTheme } = useAirdropConfig();

// Set theme
setTheme("light"); // Force light theme
setTheme("dark"); // Force dark theme
setTheme("system"); // Follow system preference
```

## Color Customization

Colors use HSL values without `hsl()` wrapper:

```typescript
colors: {
  light: {
    primary: "217 91% 60%",        // hsl(217, 91%, 60%)
    primaryForeground: "0 0% 100%", // hsl(0, 0%, 100%)
  },
}
```

### Color Palette Guidelines

- **Primary**: Main brand color for buttons, links
- **Secondary**: Supporting elements, subtle backgrounds
- **Accent**: Highlight color for important elements
- **Background/Foreground**: Page background and text
- **Border/Ring**: UI borders and focus indicators

## Layout Configuration

```typescript
ui: {
  layout: {
    headerPosition: "top" | "center",
    showCampaignStats: boolean,
    showEligibilityChecker: boolean,
    showSocialLinks: boolean,
    showTransactionHistory: boolean,
    compactMode: boolean,
  },
}
```

## Validation

The configuration system includes automatic validation:

- Required fields checking
- Contract address format validation
- Date format and logic validation
- Chain ID validation

Validation errors are returned in the `error` field of `useAirdropConfig()`.

## Best Practices

1. **Start with Examples**: Use existing examples as templates
2. **Test Themes**: Check both light and dark themes
3. **Validate Addresses**: Ensure contract addresses are correct
4. **Optimize Images**: Use optimized SVG logos
5. **Accessible Colors**: Ensure sufficient contrast ratios
6. **Mobile Testing**: Test compact mode for mobile devices

## Advanced Usage

### Custom Theme Application

```typescript
import { applyBrandingConfig } from "../lib/utils/theme";

// Manually apply branding
applyBrandingConfig(customBrandingConfig, "dark");
```

### Component Variants

```typescript
import { getComponentVariants } from "../lib/utils/variants";

// Get theme-aware component props
const buttonProps = getComponentVariants("button", config.ui?.components?.button);
```

### Dynamic Configuration Loading

```typescript
// Load configuration from API or external source
const { reload } = useAirdropConfig();

const loadExternalConfig = async () => {
  const externalConfig = await fetchConfigFromAPI();
  // Merge and reload
  reload();
};
```
