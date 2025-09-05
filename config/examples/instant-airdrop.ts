import type { AirdropConfig } from "../types";

/**
 * Example configuration for an instant airdrop campaign
 * Tokens are transferred immediately when claimed
 */
export const instantAirdropConfig: AirdropConfig = {
  branding: {
    colors: {
      dark: {
        accent: "217 91% 70%",
        accentForeground: "217 32% 17%",
        background: "217 32% 9%",
        border: "217 32% 15%",
        foreground: "0 0% 95%",
        primary: "217 91% 70%",
        primaryForeground: "217 32% 17%",
        ring: "217 91% 70%",
        secondary: "217 32% 15%",
        secondaryForeground: "217 91% 70%",
      },
      light: {
        accent: "217 91% 60%",
        accentForeground: "0 0% 100%",
        background: "0 0% 100%",
        border: "217 32% 89%",
        foreground: "217 32% 17%",
        primary: "217 91% 60%", // Bright blue
        primaryForeground: "0 0% 100%",
        ring: "217 91% 60%",
        secondary: "217 32% 96%",
        secondaryForeground: "217 91% 60%",
      },
    },
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
