import type { AirdropConfig } from "../types";

/**
 * Example configuration for a lockup linear airdrop campaign
 * Tokens vest linearly over time with optional cliff
 */
export const lockupLinearConfig: AirdropConfig = {
  branding: {
    colors: {
      dark: {
        accent: "142 76% 46%",
        accentForeground: "142 33% 20%",
        background: "142 33% 10%",
        border: "142 33% 18%",
        foreground: "0 0% 95%",
        primary: "142 76% 46%",
        primaryForeground: "142 33% 20%",
        ring: "142 76% 46%",
        secondary: "142 33% 18%",
        secondaryForeground: "142 76% 46%",
      },
      light: {
        accent: "142 76% 36%",
        accentForeground: "0 0% 100%",
        background: "0 0% 100%",
        border: "142 33% 89%",
        foreground: "142 33% 20%",
        primary: "142 76% 36%", // Forest green
        primaryForeground: "0 0% 100%",
        ring: "142 76% 36%",
        secondary: "142 33% 96%",
        secondaryForeground: "142 76% 36%",
      },
    },
    logo: {
      alt: "Builder DAO",
      dark: "/logos/builder-dark.svg",
      height: 42,
      light: "/logos/builder-light.svg",
      width: 180,
    },
    typography: {
      bodyFont: "Poppins, system-ui, sans-serif",
      fontFamily: "Poppins, system-ui, sans-serif",
      fontSize: {
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        base: "1rem",
        lg: "1.125rem",
        sm: "0.875rem",
        xl: "1.25rem",
        xs: "0.75rem",
      },
      headingFont: "Poppins, system-ui, sans-serif",
    },
  },

  campaign: {
    endDate: "2025-01-01T00:00:00Z",
    name: "Core Contributors Vesting Program",
    startDate: "2024-01-01T00:00:00Z",
    timeZone: "UTC",
  },

  content: {
    aboutProject:
      "This lockup linear airdrop creates vesting streams for core team members and contributors, ensuring long-term alignment with the project's success. Tokens vest linearly over 12 months with a 3-month cliff period.",
    description:
      "A special token distribution for core contributors with linear vesting over 12 months. Claim your vesting position and watch your tokens unlock over time.",
    privacyPolicy: "https://builder-dao.org/privacy",
    socialLinks: {
      discord: "https://discord.gg/builderdao",
      github: "https://github.com/builder-dao",
      twitter: "https://twitter.com/builderdao",
      website: "https://builder-dao.org",
    },
    supportEmail: "team@builder-dao.org",
    tagline: "Rewarding our dedicated builders",
    termsOfService: "https://builder-dao.org/vesting-terms",
    title: "Core Contributor Token Vesting",
  },
  contract: {
    address: "0x2345678901234567890123456789012345678901",
    chainId: 1, // Ethereum Mainnet
    type: "lockup-linear",
  },

  merkle: {
    ipfsCID: "QmLockupLinearMerkleTree",
    root: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    totalRecipients: 5000,
    totalTokens: "2000000",
  },

  ui: {
    components: {
      button: "outline",
      card: "elevated",
      input: "default",
    },
    layout: {
      compactMode: false,
      headerPosition: "top",
      showCampaignStats: true,
      showEligibilityChecker: true,
      showSocialLinks: true,
      showTransactionHistory: true,
    },
    showPoweredBy: true,
    theme: "dark",
  },

  version: "1.0.0",
};

export default lockupLinearConfig;
