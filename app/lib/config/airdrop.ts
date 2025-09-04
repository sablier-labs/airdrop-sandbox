import type { Address } from "viem";
import type { ProcessedConfig } from "@/app/lib/types/config";
import { getConfiguration } from "./loader";

/**
 * Get the current airdrop configuration
 */
export async function getAirdropConfig(): Promise<ProcessedConfig> {
  return getConfiguration();
}

/**
 * Get contract addresses for the current configuration
 */
export async function getContracts(): Promise<{
  airdropAddress: Address;
  tokenAddress: Address;
  merkleRoot: `0x${string}`;
}> {
  const config = await getConfiguration();
  return config.contracts;
}

/**
 * Get distribution information
 */
export async function getDistribution(): Promise<{
  totalAmount: string;
  totalRecipients: number;
  claimStartDate: Date;
  claimEndDate: Date;
}> {
  const config = await getConfiguration();
  return config.distribution;
}

/**
 * Get token information
 */
export async function getToken(): Promise<{
  symbol: string;
  decimals: number;
}> {
  const config = await getConfiguration();
  return config.token;
}

/**
 * Get campaign information
 */
export async function getCampaign(): Promise<{
  name: string;
  description: string;
}> {
  const config = await getConfiguration();
  return config.campaign;
}

/**
 * Check if the campaign is currently in the claim period
 */
export async function isCampaignActive(): Promise<boolean> {
  const config = await getConfiguration();
  const now = new Date();
  const { claimStartDate, claimEndDate } = config.distribution;
  return now >= claimStartDate && now <= claimEndDate;
}

/**
 * Get time remaining until claim deadline
 */
export async function getTimeUntilDeadline(): Promise<number> {
  const config = await getConfiguration();
  const now = Date.now();
  const { claimEndDate } = config.distribution;
  return claimEndDate.getTime() - now;
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === 0n) {
    return whole.toString();
  }

  const fractional = remainder.toString().padStart(decimals, "0");
  const trimmedFractional = fractional.replace(/0+$/, "");

  return trimmedFractional.length > 0
    ? `${whole.toString()}.${trimmedFractional}`
    : whole.toString();
}
