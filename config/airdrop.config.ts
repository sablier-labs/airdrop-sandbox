import type { AirdropConfig } from "./types";

/**
 * Main airdrop configuration
 *
 * This file contains all the customization settings for your Sablier airdrop campaign.
 * Update these values to match your project's branding, contract details, and campaign information.
 */
export const airdropConfig: AirdropConfig = {
  // Branding configuration
  branding: {
    colors: {
      // Dark theme colors (optional)
      dark: {
        accent: "265 72% 61%",
        accentForeground: "265 15% 15%",
        background: "265 15% 6%",
        border: "265 15% 20%",
        foreground: "0 0% 95%",
        primary: "265 72% 61%",
        primaryForeground: "265 15% 15%",
        ring: "265 72% 61%",
        secondary: "265 15% 20%",
        secondaryForeground: "265 72% 61%",
      },
      // Light theme colors
      light: {
        accent: "265 72% 51%",
        accentForeground: "0 0% 98%",
        background: "0 0% 100%",
        border: "265 10% 89%",
        foreground: "265 15% 15%",
        primary: "265 72% 51%", // Sablier purple
        primaryForeground: "0 0% 98%",
        ring: "265 72% 51%",
        secondary: "265 10% 96%",
        secondaryForeground: "265 72% 51%",
      },
    },
    logo: {
      alt: "Sablier Protocol",
      dark: "/logo-dark.svg",
      height: 40,
      light: "/logo-light.svg",
      width: 180,
    },
    typography: {
      bodyFont: "Inter, system-ui, sans-serif",
      fontFamily: "Inter, system-ui, sans-serif",
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
      headingFont: "Inter, system-ui, sans-serif",
    },
  },

  // Campaign information
  campaign: {
    endDate: "2024-12-31T23:59:59Z",
    name: "Sablier Protocol Airdrop",
    startDate: "2024-03-01T00:00:00Z",
    timeZone: "UTC",
  },

  // Content and messaging
  content: {
    aboutProject:
      "Sablier is a protocol for real-time finance on Ethereum. Stream tokens continuously, vest them linearly, or set up any custom streaming schedule.",
    description:
      "Welcome to the Sablier Protocol airdrop! Connect your wallet to check your eligibility and claim your tokens.",
    privacyPolicy: "https://sablier.com/privacy",
    socialLinks: {
      discord: "https://discord.gg/sablier",
      github: "https://github.com/sablier-labs",
      twitter: "https://twitter.com/sablier",
      website: "https://sablier.com",
    },
    supportEmail: "support@sablier.com",
    tagline: "The future of token streaming is here",
    termsOfService: "https://sablier.com/terms",
    title: "Claim Your Sablier Tokens",
  },
  // Contract configuration
  contract: {
    address: "0x1234567890123456789012345678901234567890", // Replace with your contract address
    chainId: 1, // Ethereum Mainnet
    type: "instant", // instant | lockup-linear | lockup-tranched
  },

  // Merkle tree configuration
  merkle: {
    ipfsCID: "QmYourIPFSHashHere", // Optional: IPFS CID for merkle tree data
    root: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890", // Replace with your merkle root
    totalRecipients: 10000, // Total number of recipients
    totalTokens: "1000000", // Total tokens in the airdrop
  },

  // UI configuration
  ui: {
    components: {
      button: "default", // default | outline | ghost | link
      card: "default", // default | elevated | outline | subtle
      input: "default", // default | ghost | underline
    },
    layout: {
      compactMode: false,
      headerPosition: "center", // top | center
      showCampaignStats: true,
      showEligibilityChecker: true,
      showSocialLinks: true,
      showTransactionHistory: true,
    },
    showPoweredBy: true,
    theme: "system", // light | dark | system
  },

  version: "1.0.0",
};

export default airdropConfig;
