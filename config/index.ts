// Main configuration
export { airdropConfig as default, airdropConfig } from "./airdrop.config";
// Examples
export * from "./examples";
// Presets
export * from "./presets";
// Types
export type * from "./types";

// Re-export key types for convenience
export type {
  AirdropConfig,
  BrandingConfig,
  CampaignConfig,
  ColorScheme,
  ConfigPreset,
  ConfigState,
  ContentConfig,
  ContractConfig,
  UIConfig,
} from "./types";
