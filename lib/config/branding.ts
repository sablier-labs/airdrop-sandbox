/**
 * Color configuration for theming and branding
 */
export interface ColorConfig {
  /** Primary brand color (main CTAs, highlights) */
  primary: string;
  /** Primary color hover state */
  primaryHover: string;
  /** Secondary brand color (supporting elements) */
  secondary: string;
  /** Secondary color hover state */
  secondaryHover: string;
  /** Accent color for special highlights */
  accent: string;
  /** Background colors */
  background: {
    /** Main background color */
    primary: string;
    /** Secondary background color (cards, sections) */
    secondary: string;
    /** Muted background color (disabled states) */
    muted: string;
  };
  /** Text colors */
  text: {
    /** Primary text color */
    primary: string;
    /** Secondary text color (descriptions, captions) */
    secondary: string;
    /** Muted text color (placeholder, disabled) */
    muted: string;
    /** Text on colored backgrounds */
    inverse: string;
  };
  /** Border colors */
  border: {
    /** Default border color */
    default: string;
    /** Muted border color */
    muted: string;
    /** Focus/active border color */
    focus: string;
  };
  /** Status colors */
  status: {
    /** Success color */
    success: string;
    /** Warning color */
    warning: string;
    /** Error color */
    error: string;
    /** Info color */
    info: string;
  };
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  /** Font families */
  fonts: {
    /** Primary font family for headings */
    heading: string;
    /** Body font family */
    body: string;
    /** Monospace font family */
    mono: string;
  };
  /** Font weights */
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

/**
 * Logo and image asset configuration
 */
export interface AssetConfig {
  /** Main application logo */
  logo: {
    /** Primary logo (light backgrounds) */
    light: string;
    /** Dark logo (dark backgrounds) */
    dark: string;
    /** Logo width in pixels */
    width?: number;
    /** Logo height in pixels */
    height?: number;
  };
  /** Token logo/icon */
  tokenLogo: string;
  /** Favicon configurations */
  favicon: {
    /** ICO favicon */
    ico: string;
    /** SVG favicon */
    svg?: string;
    /** Apple touch icon */
    appleTouchIcon?: string;
  };
  /** Background images or patterns */
  background?: {
    /** Hero section background */
    hero?: string;
    /** General page background pattern */
    pattern?: string;
  };
}

/**
 * Text content configuration for easy customization
 */
export interface TextConfig {
  /** Page title and metadata */
  meta: {
    /** Site title */
    title: string;
    /** Meta description */
    description: string;
    /** Keywords for SEO */
    keywords: string;
  };
  /** Main page content */
  content: {
    /** Hero section */
    hero: {
      /** Main heading */
      title: string;
      /** Subtitle or description */
      subtitle: string;
      /** Call-to-action text */
      ctaText: string;
    };
    /** Claim section */
    claim: {
      /** Section heading */
      title: string;
      /** Instructions text */
      instructions: string;
      /** Connect wallet button text */
      connectWallet: string;
      /** Check eligibility button text */
      checkEligibility: string;
      /** Claim tokens button text */
      claimTokens: string;
    };
    /** Status messages */
    status: {
      /** Loading message */
      loading: string;
      /** Success message */
      success: string;
      /** Error message */
      error: string;
      /** Not eligible message */
      notEligible: string;
      /** Already claimed message */
      alreadyClaimed: string;
      /** Campaign ended message */
      campaignEnded: string;
    };
    /** Footer content */
    footer: {
      /** Copyright text */
      copyright: string;
      /** Privacy policy link text */
      privacyPolicy?: string;
      /** Terms of service link text */
      termsOfService?: string;
    };
  };
  /** Labels and form elements */
  labels: {
    /** Address input label */
    addressInput: string;
    /** Amount label */
    amount: string;
    /** Recipients label */
    recipients: string;
    /** Chain label */
    chain: string;
    /** Contract label */
    contract: string;
    /** Manager label */
    manager: string;
    /** Token label */
    token: string;
    /** Deadline label */
    deadline: string;
  };
}

/**
 * Social media and external link configuration
 */
export interface SocialConfig {
  /** Discord invite link */
  discord?: string;
  /** Telegram channel/group link */
  telegram?: string;
  /** Twitter/X profile link */
  twitter?: string;
  /** GitHub repository link */
  github?: string;
  /** Medium blog link */
  medium?: string;
  /** LinkedIn profile link */
  linkedin?: string;
  /** Project website */
  website?: string;
  /** Documentation site */
  docs?: string;
}

/**
 * Complete branding configuration
 */
export interface BrandingConfig {
  /** Color scheme configuration */
  colors: ColorConfig;
  /** Typography configuration */
  typography: TypographyConfig;
  /** Asset and logo configuration */
  assets: AssetConfig;
  /** Text content configuration */
  text: TextConfig;
  /** Social media links */
  social: SocialConfig;
}

/**
 * Default Sapien airdrop branding configuration
 * Customizable for different campaigns and brands
 */
export const sapienBrandingConfig: BrandingConfig = {
  assets: {
    background: {
      hero: "/images/backgrounds/hero-gradient.svg",
      pattern: "/images/backgrounds/grid-pattern.svg",
    },
    favicon: {
      appleTouchIcon: "/apple-touch-icon.png",
      ico: "/favicon.ico",
      svg: "/favicon.svg",
    },
    logo: {
      dark: "/images/logos/sapien-logo-dark.svg",
      height: 40,
      light: "/images/logos/sapien-logo-light.svg",
      width: 160,
    },
    tokenLogo: "/images/tokens/sapien.png",
  },
  colors: {
    accent: "#F59E0B", // Amber-500
    background: {
      muted: "#F3F4F6", // Gray-100
      primary: "#FFFFFF", // White
      secondary: "#F9FAFB", // Gray-50
    },
    border: {
      default: "#E5E7EB", // Gray-200
      focus: "#3B82F6", // Blue-500
      muted: "#F3F4F6", // Gray-100
    },
    primary: "#3B82F6", // Blue-500
    primaryHover: "#2563EB", // Blue-600
    secondary: "#6366F1", // Indigo-500
    secondaryHover: "#4F46E5", // Indigo-600
    status: {
      error: "#EF4444", // Red-500
      info: "#3B82F6", // Blue-500
      success: "#10B981", // Emerald-500
      warning: "#F59E0B", // Amber-500
    },
    text: {
      inverse: "#FFFFFF", // White
      muted: "#9CA3AF", // Gray-400
      primary: "#111827", // Gray-900
      secondary: "#6B7280", // Gray-500
    },
  },

  social: {
    discord: "https://discord.gg/sapien",
    docs: "https://docs.sapien.network",
    github: "https://github.com/sapiennetwork",
    telegram: "https://t.me/sapiennetwork",
    twitter: "https://twitter.com/sapiennetwork",
    website: "https://sapien.network",
  },

  text: {
    content: {
      claim: {
        checkEligibility: "Check Eligibility",
        claimTokens: "Claim Tokens",
        connectWallet: "Connect Wallet",
        instructions:
          "Connect your wallet and check if you're eligible to claim SAPIEN tokens from this airdrop campaign.",
        title: "Claim Your Tokens",
      },
      footer: {
        copyright: "© 2024 Sapien Network. All rights reserved.",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
      },
      hero: {
        ctaText: "Check Your Eligibility",
        subtitle:
          "Claim your SAPIEN tokens and join our growing ecosystem of builders and innovators.",
        title: "Friends of Sapien Airdrop",
      },
      status: {
        alreadyClaimed: "You have already claimed your tokens for this airdrop.",
        campaignEnded: "This airdrop campaign has ended.",
        error: "Something went wrong. Please try again.",
        loading: "Checking eligibility...",
        notEligible: "Your wallet is not eligible for this airdrop.",
        success: "Congratulations! Your tokens have been claimed successfully.",
      },
    },
    labels: {
      addressInput: "Wallet Address",
      amount: "Amount",
      chain: "Network",
      contract: "Contract",
      deadline: "Claim Deadline",
      manager: "Manager",
      recipients: "Recipients",
      token: "Token",
    },
    meta: {
      description:
        "Claim your SAPIEN tokens from the Friends of Sapien airdrop campaign. Rewarding early supporters and contributors to the Sapien ecosystem.",
      keywords: "sapien, airdrop, crypto, tokens, claim, blockchain, web3",
      title: "Friends of Sapien | Claim Your Airdrop",
    },
  },

  typography: {
    fonts: {
      body: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      heading: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "JetBrains Mono, Consolas, Monaco, monospace",
    },
    weights: {
      bold: 700,
      medium: 500,
      normal: 400,
      semibold: 600,
    },
  },
};

/**
 * Get theme colors for CSS custom properties
 */
export const getThemeColors = (config: BrandingConfig = sapienBrandingConfig) => {
  return {
    "--color-accent": config.colors.accent,
    "--color-background": config.colors.background.primary,
    "--color-background-muted": config.colors.background.muted,
    "--color-background-secondary": config.colors.background.secondary,
    "--color-border": config.colors.border.default,
    "--color-border-focus": config.colors.border.focus,
    "--color-border-muted": config.colors.border.muted,
    "--color-error": config.colors.status.error,
    "--color-info": config.colors.status.info,
    "--color-primary": config.colors.primary,
    "--color-primary-hover": config.colors.primaryHover,
    "--color-secondary": config.colors.secondary,
    "--color-secondary-hover": config.colors.secondaryHover,
    "--color-success": config.colors.status.success,
    "--color-text": config.colors.text.primary,
    "--color-text-inverse": config.colors.text.inverse,
    "--color-text-muted": config.colors.text.muted,
    "--color-text-secondary": config.colors.text.secondary,
    "--color-warning": config.colors.status.warning,
  } as const;
};

/**
 * Get font family CSS custom properties
 */
export const getThemeFonts = (config: BrandingConfig = sapienBrandingConfig) => {
  return {
    "--font-body": config.typography.fonts.body,
    "--font-heading": config.typography.fonts.heading,
    "--font-mono": config.typography.fonts.mono,
  } as const;
};

/**
 * Create a custom branding configuration by merging with defaults
 */
export const createBrandingConfig = (overrides: Partial<BrandingConfig>): BrandingConfig => {
  return {
    ...sapienBrandingConfig,
    ...overrides,
    assets: {
      ...sapienBrandingConfig.assets,
      ...overrides.assets,
    },
    colors: {
      ...sapienBrandingConfig.colors,
      ...overrides.colors,
    },
    social: {
      ...sapienBrandingConfig.social,
      ...overrides.social,
    },
    text: {
      ...sapienBrandingConfig.text,
      ...overrides.text,
    },
    typography: {
      ...sapienBrandingConfig.typography,
      ...overrides.typography,
    },
  };
};
