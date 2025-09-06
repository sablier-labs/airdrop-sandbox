import type { AirdropConfig } from "../types";

/**
 * Example configuration for an instant airdrop campaign
 * Tokens are transferred immediately when claimed
 */
export const instantAirdropConfig: AirdropConfig = {
  branding: {
    logo: {
      alt: "Example Project",
      dark: "/logos/instant-dark.svg",
      height: 36,
      light: "/logos/instant-light.svg",
      width: 160,
    },
    typography: {
      bodyFont: "Inter, system-ui, sans-serif",
      fontFamily: "Inter, system-ui, sans-serif",
      headingFont: "Inter, system-ui, sans-serif",
    },
  },

  campaign: {
    endDate: "2024-06-15T12:00:00Z",
    name: "Community Rewards Instant Drop",
    startDate: "2024-03-15T12:00:00Z",
    timeZone: "UTC",
  },

  content: {
    aboutProject:
      "This instant airdrop rewards early adopters and active community members with immediate token distribution upon claiming.",
    description:
      "We're distributing 500,000 tokens to our loyal community members. Connect your wallet to check eligibility and claim your tokens instantly.",
    privacyPolicy: "https://example-project.com/privacy",
    socialLinks: {
      discord: "https://discord.gg/exampleproject",
      telegram: "https://t.me/exampleproject",
      twitter: "https://twitter.com/exampleproject",
      website: "https://example-project.com",
    },
    supportEmail: "support@example-project.com",
    tagline: "Thank you for being part of our community!",
    termsOfService: "https://example-project.com/terms",
    title: "Claim Your Instant Rewards",
  },
  contract: {
    address: "0x1234567890123456789012345678901234567890",
    chainId: 1, // Ethereum Mainnet
    type: "instant",
  },

  merkle: {
    ipfsCID: "QmInstantAirdropMerkleTree",
    root: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    totalRecipients: 25000,
    totalTokens: "500000",
  },

  ui: {
    components: {
      button: "default",
      card: "default",
      input: "default",
    },
    layout: {
      compactMode: false,
      headerPosition: "center",
      showCampaignStats: true,
      showEligibilityChecker: true,
      showSocialLinks: true,
      showTransactionHistory: true,
    },
    showPoweredBy: true,
    theme: "system",
  },

  version: "1.0.0",
};

export default instantAirdropConfig;
