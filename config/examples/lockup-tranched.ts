import type { AirdropConfig } from "../types";

/**
 * Example configuration for a lockup tranched airdrop campaign
 * Tokens unlock in discrete tranches at specific intervals
 */
export const lockupTranchedConfig: AirdropConfig = {
  branding: {
    logo: {
      alt: "DeFi Protocol",
      dark: "/logos/defi-dark.svg",
      height: 38,
      light: "/logos/defi-light.svg",
      width: 170,
    },
    typography: {
      bodyFont: "Manrope, system-ui, sans-serif",
      fontFamily: "Manrope, system-ui, sans-serif",
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
      headingFont: "Manrope, system-ui, sans-serif",
    },
  },

  campaign: {
    endDate: "2026-02-01T00:00:00Z",
    name: "Advisor & Partner Token Release",
    startDate: "2024-02-01T00:00:00Z",
    timeZone: "UTC",
  },

  content: {
    aboutProject:
      "This lockup tranched airdrop distributes tokens to strategic advisors and partners in predetermined tranches. Tokens unlock at specific milestones: 25% at launch, 25% at 6 months, 25% at 12 months, and 25% at 24 months.",
    description:
      "Strategic advisors and partners receive tokens through milestone-based tranched unlocks. Each tranche represents key project milestones achieved.",
    privacyPolicy: "https://defi-protocol.io/privacy",
    socialLinks: {
      github: "https://github.com/defi-protocol",
      telegram: "https://t.me/defiprotocol",
      twitter: "https://twitter.com/defiprotocol",
      website: "https://defi-protocol.io",
    },
    supportEmail: "partners@defi-protocol.io",
    tagline: "Milestone-based token distribution",
    termsOfService: "https://defi-protocol.io/partner-terms",
    title: "Strategic Partner Token Unlock",
  },
  contract: {
    address: "0x3456789012345678901234567890123456789012",
    chainId: 1, // Ethereum Mainnet
    type: "lockup-tranched",
  },

  merkle: {
    ipfsCID: "QmLockupTranchedMerkleTree",
    root: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456",
    totalRecipients: 3000,
    totalTokens: "1500000",
  },

  ui: {
    components: {
      button: "default",
      card: "outline",
      input: "underline",
    },
    layout: {
      compactMode: true,
      headerPosition: "center",
      showCampaignStats: true,
      showEligibilityChecker: true,
      showSocialLinks: false, // Minimal UI for partners
      showTransactionHistory: true,
    },
    showPoweredBy: false, // Partner branding only
    theme: "system",
  },

  version: "1.0.0",
};

export default lockupTranchedConfig;
