import type { Address } from "viem";
import type { AirdropData } from "@/app/lib/contracts/merkle";
import { createMerkleTree } from "@/app/lib/contracts/merkle";

/**
 * Well-known addresses for demo purposes
 * These are publicly known addresses that can be used for testing
 */
const DEMO_ADDRESSES: Address[] = [
  // Vitalik Buterin
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  // Uniswap Protocol Treasury
  "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
  // OpenSea Shared Storefront
  "0x495f947276749Ce646f68AC8c248420045cb7b5e",
  // Compound Governance
  "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
  // MakerDAO Governance
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  // Aave Protocol
  "0x25F2226B597E8F9514B3F68F00f494cF4f286491",
  // Sushiswap Treasury
  "0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3",
  // ENS Registry
  "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  // USDC Treasury
  "0x5B76f5B8fc9D700624F78315c9B2F3174f84c823",
  // Polygon Bridge
  "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf",
  // Test addresses for development
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
  "0x6789012345678901234567890123456789012345",
  "0x7890123456789012345678901234567890123456",
  "0x8901234567890123456789012345678901234567",
  "0x9012345678901234567890123456789012345678",
  "0x0123456789012345678901234567890123456789",
];

/**
 * Token distribution tiers with different allocation amounts
 */
const ALLOCATION_TIERS = {
  large: BigInt("10000000000000000000000"), // 10,000 tokens
  medium: BigInt("5000000000000000000000"), // 5,000 tokens
  micro: BigInt("100000000000000000000"), // 100 tokens
  small: BigInt("500000000000000000000"), // 500 tokens
  standard: BigInt("1000000000000000000000"), // 1,000 tokens
  whale: BigInt("50000000000000000000000"), // 50,000 tokens
} as const;

/**
 * Predefined allocation scheme for demo addresses
 */
const DEMO_ALLOCATIONS: Array<{
  address: Address;
  amount: bigint;
  tier: keyof typeof ALLOCATION_TIERS;
}> = [
  { address: DEMO_ADDRESSES[0], amount: ALLOCATION_TIERS.whale, tier: "whale" },
  { address: DEMO_ADDRESSES[1], amount: ALLOCATION_TIERS.large, tier: "large" },
  { address: DEMO_ADDRESSES[2], amount: ALLOCATION_TIERS.large, tier: "large" },
  { address: DEMO_ADDRESSES[3], amount: ALLOCATION_TIERS.medium, tier: "medium" },
  { address: DEMO_ADDRESSES[4], amount: ALLOCATION_TIERS.medium, tier: "medium" },
  { address: DEMO_ADDRESSES[5], amount: ALLOCATION_TIERS.medium, tier: "medium" },
  { address: DEMO_ADDRESSES[6], amount: ALLOCATION_TIERS.standard, tier: "standard" },
  { address: DEMO_ADDRESSES[7], amount: ALLOCATION_TIERS.standard, tier: "standard" },
  { address: DEMO_ADDRESSES[8], amount: ALLOCATION_TIERS.standard, tier: "standard" },
  { address: DEMO_ADDRESSES[9], amount: ALLOCATION_TIERS.standard, tier: "standard" },
  { address: DEMO_ADDRESSES[10], amount: ALLOCATION_TIERS.small, tier: "small" },
  { address: DEMO_ADDRESSES[11], amount: ALLOCATION_TIERS.small, tier: "small" },
  { address: DEMO_ADDRESSES[12], amount: ALLOCATION_TIERS.small, tier: "small" },
  { address: DEMO_ADDRESSES[13], amount: ALLOCATION_TIERS.small, tier: "small" },
  { address: DEMO_ADDRESSES[14], amount: ALLOCATION_TIERS.small, tier: "small" },
  { address: DEMO_ADDRESSES[15], amount: ALLOCATION_TIERS.micro, tier: "micro" },
  { address: DEMO_ADDRESSES[16], amount: ALLOCATION_TIERS.micro, tier: "micro" },
  { address: DEMO_ADDRESSES[17], amount: ALLOCATION_TIERS.micro, tier: "micro" },
  { address: DEMO_ADDRESSES[18], amount: ALLOCATION_TIERS.micro, tier: "micro" },
  { address: DEMO_ADDRESSES[19], amount: ALLOCATION_TIERS.micro, tier: "micro" },
];

/**
 * Creates demo airdrop data with realistic addresses and distributions
 * @returns Complete airdrop data for demo purposes
 */
export function createDemoAirdropData(): AirdropData {
  const recipients = DEMO_ALLOCATIONS.map(({ address, amount }) => ({
    address,
    amount,
  }));

  return createMerkleTree(recipients);
}

/**
 * Generates additional random recipients for testing scalability
 * @param count Number of additional recipients to generate
 * @param baseAmount Base amount for generated addresses
 * @returns Array of recipient data
 */
export function generateAdditionalRecipients(
  count: number = 100,
  _baseAmount: bigint = ALLOCATION_TIERS.small,
): Array<{ address: Address; amount: bigint }> {
  const recipients: Array<{ address: Address; amount: bigint }> = [];

  for (let i = 0; i < count; i++) {
    // Generate deterministic but realistic-looking addresses
    const addressNum = (BigInt("0x1000000000000000000000000000000000000000") + BigInt(i + 100))
      .toString(16)
      .padStart(40, "0");
    const address = `0x${addressNum}` as Address;

    // Randomly assign tier amounts
    const tiers = Object.values(ALLOCATION_TIERS);
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];

    recipients.push({
      address,
      amount: randomTier,
    });
  }

  return recipients;
}

/**
 * Creates extended demo data with both known addresses and generated ones
 * @param additionalCount Number of additional addresses to generate
 * @returns Extended airdrop data
 */
export function createExtendedDemoData(additionalCount: number = 100): AirdropData {
  const demoRecipients = DEMO_ALLOCATIONS.map(({ address, amount }) => ({
    address,
    amount,
  }));

  const additionalRecipients = generateAdditionalRecipients(additionalCount);

  const allRecipients = [...demoRecipients, ...additionalRecipients];

  return createMerkleTree(allRecipients);
}

/**
 * Checks if an address is in the demo dataset
 * @param address Address to check
 * @returns True if address is eligible in demo mode
 */
export function isDemoEligible(address: Address): boolean {
  const normalizedAddress = address.toLowerCase();
  return DEMO_ADDRESSES.some((demoAddr) => demoAddr.toLowerCase() === normalizedAddress);
}

/**
 * Gets the demo allocation for a specific address
 * @param address Address to check
 * @returns Allocation data or null if not eligible
 */
export function getDemoAllocation(
  address: Address,
): { amount: bigint; tier: keyof typeof ALLOCATION_TIERS } | null {
  const normalizedAddress = address.toLowerCase();
  const allocation = DEMO_ALLOCATIONS.find(
    (alloc) => alloc.address.toLowerCase() === normalizedAddress,
  );

  return allocation ? { amount: allocation.amount, tier: allocation.tier } : null;
}

/**
 * Formats allocation amount for display
 * @param amount Amount in wei
 * @param decimals Token decimals (default 18)
 * @returns Formatted string with token units
 */
export function formatDemoAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === 0n) {
    return wholePart.toLocaleString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const trimmed = fractionalStr.replace(/0+$/, "");

  return `${wholePart.toLocaleString()}${trimmed ? "." + trimmed : ""}`;
}

/**
 * Gets statistics about the demo airdrop distribution
 * @returns Distribution statistics
 */
export function getDemoStatistics() {
  const totalAmount = DEMO_ALLOCATIONS.reduce((sum, alloc) => sum + alloc.amount, 0n);
  const totalRecipients = DEMO_ALLOCATIONS.length;

  const tierCounts = Object.keys(ALLOCATION_TIERS).reduce(
    (counts, tier) => {
      counts[tier as keyof typeof ALLOCATION_TIERS] = DEMO_ALLOCATIONS.filter(
        (alloc) => alloc.tier === tier,
      ).length;
      return counts;
    },
    {} as Record<keyof typeof ALLOCATION_TIERS, number>,
  );

  const avgAmount = totalAmount / BigInt(totalRecipients);

  return {
    avgAmount,
    formattedAvgAmount: formatDemoAmount(avgAmount),
    formattedTotalAmount: formatDemoAmount(totalAmount),
    tierCounts,
    totalAmount,
    totalRecipients,
  };
}

/**
 * Sample configuration for demo mode
 */
export const DEMO_CONFIG = {
  campaignName: "Sapien Community Airdrop",
  chainId: 1, // Ethereum mainnet
  claimEndDate: new Date("2024-12-31T23:59:59Z"),
  claimStartDate: new Date("2024-01-01T00:00:00Z"),
  // Mock contract addresses for demo
  contractAddress: "0x1234567890123456789012345678901234567890" as Address,
  description: "Rewarding early supporters, contributors, and community members",
  tokenAddress: "0x0987654321098765432109876543210987654321" as Address,
  tokenDecimals: 18,
  tokenSymbol: "SAPIEN",
} as const;
