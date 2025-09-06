import { instantAirdropConfig, lockupLinearConfig, lockupTranchedConfig } from "./examples";
import type { ConfigPreset } from "./types";

/**
 * Configuration presets for different use cases and industries
 */
export const configPresets: ConfigPreset[] = [
  // Contract Type Presets
  {
    config: instantAirdropConfig,
    description: "Simple instant token distribution for community rewards",
    id: "instant-basic",
    name: "Instant Airdrop",
  },
  {
    config: lockupLinearConfig,
    description: "Linear token vesting for team members and contributors",
    id: "lockup-linear-basic",
    name: "Linear Vesting",
  },
  {
    config: lockupTranchedConfig,
    description: "Tranched token unlocks based on milestones",
    id: "lockup-tranched-basic",
    name: "Milestone Unlocks",
  },

  // Simplified Presets
  {
    config: {
      ...instantAirdropConfig,
      branding: {
        ...instantAirdropConfig.branding,
        typography: {
          fontFamily: "system-ui, sans-serif",
        },
      },
      ui: {
        ...instantAirdropConfig.ui,
        components: {
          button: "ghost",
          card: "outline",
          input: "underline",
        },
        layout: {
          ...instantAirdropConfig.ui?.layout,
          compactMode: true,
          showSocialLinks: false,
        },
        theme: "light",
      },
    },
    description: "Clean, minimal design with light theme",
    id: "minimal-light",
    name: "Minimal Light",
  },
  {
    config: {
      ...instantAirdropConfig,
      branding: {
        ...instantAirdropConfig.branding,
        typography: {
          fontFamily: "system-ui, sans-serif",
        },
      },
      ui: {
        ...instantAirdropConfig.ui,
        components: {
          button: "outline",
          card: "subtle",
          input: "ghost",
        },
        layout: {
          ...instantAirdropConfig.ui?.layout,
          compactMode: true,
          showSocialLinks: false,
        },
        theme: "dark",
      },
    },
    description: "Clean, minimal design with dark theme",
    id: "minimal-dark",
    name: "Minimal Dark",
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ConfigPreset | undefined {
  return configPresets.find((preset) => preset.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: "contract" | "minimal"): ConfigPreset[] {
  switch (category) {
    case "contract":
      return configPresets.filter((preset) =>
        ["instant-basic", "lockup-linear-basic", "lockup-tranched-basic"].includes(preset.id),
      );
    case "minimal":
      return configPresets.filter((preset) =>
        ["minimal-light", "minimal-dark"].includes(preset.id),
      );
    default:
      return [];
  }
}

/**
 * Get all preset categories
 */
export function getPresetCategories() {
  return [
    {
      description: "Configurations optimized for different Sablier contract types",
      id: "contract",
      name: "Contract Types",
      presets: getPresetsByCategory("contract"),
    },
    {
      description: "Clean, distraction-free configurations",
      id: "minimal",
      name: "Minimal Themes",
      presets: getPresetsByCategory("minimal"),
    },
  ];
}
