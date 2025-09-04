import type { Address } from "viem";
import type { MerkleProof } from "@/app/lib/contracts/merkle";
import { createDemoAirdropData, DEMO_CONFIG, getDemoAllocation, isDemoEligible } from "./demo-data";

/**
 * Demo mode configuration and utilities
 */

/**
 * Checks if demo mode is enabled
 * @returns True if demo mode is active
 */
export async function isDemoMode(): Promise<boolean> {
  // Import here to avoid circular dependencies
  const { isDemoMode: configIsDemoMode } = await import("@/app/lib/config/loader");
  return configIsDemoMode();
}

/**
 * Gets the appropriate configuration based on demo mode
 * @returns Configuration object
 */
export async function getConfig() {
  const demoModeEnabled = await isDemoMode();

  if (demoModeEnabled) {
    return {
      ...DEMO_CONFIG,
      merkleRoot: getDemoMerkleRoot(),
    };
  }

  // Import here to avoid circular dependencies
  const { getConfiguration } = await import("@/app/lib/config/loader");
  const config = await getConfiguration();

  // Return production config from JSON configuration
  return {
    campaignName: config.campaign.name,
    chainId: config.networks.chainId,
    claimEndDate: config.distribution.claimEndDate,
    claimStartDate: config.distribution.claimStartDate,
    contractAddress: config.contracts.airdropAddress,
    description: config.campaign.description,
    merkleRoot: config.contracts.merkleRoot,
    tokenAddress: config.contracts.tokenAddress,
    tokenDecimals: config.token.decimals,
    tokenSymbol: config.token.symbol,
  };
}

/**
 * Demo airdrop data cache
 */
let demoAirdropDataCache: ReturnType<typeof createDemoAirdropData> | null = null;

/**
 * Gets demo airdrop data (cached)
 * @returns Demo airdrop data
 */
function getDemoAirdropData() {
  if (!demoAirdropDataCache) {
    demoAirdropDataCache = createDemoAirdropData();
  }
  return demoAirdropDataCache;
}

/**
 * Gets the Merkle root for demo mode
 * @returns Demo Merkle root
 */
function getDemoMerkleRoot(): `0x${string}` {
  return getDemoAirdropData().root;
}

/**
 * Demo eligibility check
 * @param address Address to check
 * @returns Eligibility result
 */
export async function checkDemoEligibility(address: Address): Promise<{
  status: "eligible" | "not-eligible" | "error";
  amount?: string;
  proof?: MerkleProof;
  tokenSymbol?: string;
}> {
  try {
    if (!isDemoEligible(address)) {
      return { status: "not-eligible" };
    }

    const allocation = getDemoAllocation(address);
    if (!allocation) {
      return { status: "not-eligible" };
    }

    const airdropData = getDemoAirdropData();
    const proof = airdropData.proofs[address.toLowerCase() as Address];

    if (!proof) {
      return { status: "error" };
    }

    return {
      amount: (allocation.amount / BigInt(10 ** 18)).toString(), // Convert to token units
      proof,
      status: "eligible",
      tokenSymbol: DEMO_CONFIG.tokenSymbol,
    };
  } catch (error) {
    console.error("Demo eligibility check error:", error);
    return { status: "error" };
  }
}

/**
 * Mock claim function for demo mode
 * @param proof Merkle proof data
 * @returns Mock transaction result
 */
export async function mockClaim(_proof: MerkleProof): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate 95% success rate
  if (Math.random() > 0.05) {
    // Generate a realistic-looking transaction hash
    const mockTxHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")}`;

    return {
      success: true,
      txHash: mockTxHash as `0x${string}`,
    };
  }

  // Simulate failure
  const errorMessages = [
    "Insufficient gas",
    "Transaction reverted",
    "Network congestion",
    "Slippage tolerance exceeded",
  ];

  return {
    error: errorMessages[Math.floor(Math.random() * errorMessages.length)],
    success: false,
  };
}

/**
 * Gets demo mode status and info for UI display
 * @returns Demo mode info
 */
export async function getDemoModeInfo() {
  const isDemo = await isDemoMode();

  if (!isDemo) {
    return { enabled: false };
  }

  const demoData = getDemoAirdropData();

  return {
    enabled: true,
    notice: "Demo mode is active - transactions are simulated",
    tokenSymbol: DEMO_CONFIG.tokenSymbol,
    totalAmount: (demoData.totalAmount / BigInt(10 ** 18)).toString(),
    totalRecipients: demoData.totalRecipients,
  };
}

/**
 * Validates demo mode configuration
 * @returns Validation result with any issues
 */
export async function validateDemoMode(): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  const demoModeEnabled = await isDemoMode();
  if (!demoModeEnabled) {
    return { issues, valid: true };
  }

  try {
    const airdropData = getDemoAirdropData();

    if (airdropData.totalRecipients === 0) {
      issues.push("No demo recipients configured");
    }

    if (airdropData.totalAmount === 0n) {
      issues.push("Total demo amount is zero");
    }

    if (!airdropData.root || airdropData.root === "0x") {
      issues.push("Invalid demo Merkle root");
    }

    // Validate that proofs exist for all recipients
    const missingProofs = airdropData.recipients.filter(
      (recipient) => !airdropData.proofs[recipient.address.toLowerCase() as Address],
    );

    if (missingProofs.length > 0) {
      issues.push(`Missing proofs for ${missingProofs.length} recipients`);
    }
  } catch (error) {
    issues.push(
      `Demo data generation error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return {
    issues,
    valid: issues.length === 0,
  };
}

/**
 * Demo mode banner component props
 */
export async function getDemoBannerProps() {
  const demoInfo = await getDemoModeInfo();

  if (!demoInfo.enabled) {
    return null;
  }

  return {
    details: `${demoInfo.totalRecipients} addresses eligible for ${demoInfo.totalAmount} ${demoInfo.tokenSymbol}`,
    message: demoInfo.notice || "Demo mode active",
    type: "info" as const,
  };
}
