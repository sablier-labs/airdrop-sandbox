import type { Address, Hash } from "viem";
import type { ContractType } from "../lib/contracts";

// Base configuration interfaces
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
}

export interface ContractConfig {
  address: Address;
  chainId: number;
  type: ContractType;
}

export interface MerkleConfig {
  root: Hash;
  ipfsCID?: string;
  totalTokens: string;
  totalRecipients: number;
}

// Branding and theming interfaces
export interface LogoConfig {
  light: string;
  dark?: string;
  alt: string;
  height?: number;
  width?: number;
}

export interface ColorScheme {
  primary: string;
  primaryForeground: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  background?: string;
  foreground?: string;
  border?: string;
  ring?: string;
}

export interface TypographyConfig {
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
  fontSize?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
    "3xl"?: string;
    "4xl"?: string;
  };
}

export interface BrandingConfig {
  logo: LogoConfig;
  typography?: TypographyConfig;
}

// Content customization interfaces
export interface SocialLinks {
  discord?: string;
  github?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
}

export interface ContentConfig {
  tagline?: string;
  title: string;
  description: string;
  aboutProject?: string;
  socialLinks?: SocialLinks;
  supportEmail?: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

// Campaign information
export interface CampaignConfig {
  endDate?: string;
  name: string;
  startDate?: string;
  timeZone?: string;
}

// Layout and component customization
export interface LayoutConfig {
  showCampaignStats?: boolean;
  showEligibilityChecker?: boolean;
  showSocialLinks?: boolean;
  showTransactionHistory?: boolean;
  compactMode?: boolean;
  headerPosition?: "top" | "center";
}

export interface ComponentVariants {
  button?: "default" | "outline" | "ghost" | "link";
  card?: "default" | "elevated" | "outline" | "subtle";
  input?: "default" | "ghost" | "underline";
}

export interface UIConfig {
  components?: ComponentVariants;
  layout?: LayoutConfig;
  showPoweredBy?: boolean;
  theme?: "light" | "dark" | "system";
}

// Main configuration interface
export interface AirdropConfig {
  branding: BrandingConfig;
  campaign: CampaignConfig;
  content: ContentConfig;
  contract: ContractConfig;
  merkle: MerkleConfig;
  ui?: UIConfig;
  version?: string;
}

// Configuration presets for different types
export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<AirdropConfig>;
}

// Runtime configuration state
export interface ConfigState {
  config: AirdropConfig;
  isLoaded: boolean;
  error?: string;
}
