import type { Address, PublicClient, WalletClient } from "viem";
import { SablierMerkleInstantContract } from "./instant";
import { SablierMerkleLLContract } from "./lockup-linear";
import { SablierMerkleLTContract } from "./lockup-tranched";
import type { ContractType, SablierContractInstance } from "./types";

/**
 * Create a contract instance based on type
 */
export function createContract(
  type: ContractType,
  address: Address,
  publicClient: PublicClient,
  walletClient?: WalletClient,
): SablierContractInstance {
  switch (type) {
    case "instant":
      return new SablierMerkleInstantContract(address, publicClient, walletClient);
    case "lockup-linear":
      return new SablierMerkleLLContract(address, publicClient, walletClient);
    case "lockup-tranched":
      return new SablierMerkleLTContract(address, publicClient, walletClient);
    default:
      throw new Error(`Unsupported contract type: ${type}`);
  }
}

/**
 * Auto-detect contract type by examining the contract
 */
export async function detectContractType(
  address: Address,
  publicClient: PublicClient,
): Promise<ContractType> {
  try {
    // Try to call type-specific methods to determine contract type

    // Check for lockup-specific methods first
    try {
      await publicClient.readContract({
        abi: [
          {
            inputs: [],
            name: "LOCKUP",
            outputs: [{ type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        address,
        functionName: "LOCKUP",
      });

      // Has lockup, now check for linear vs tranched
      try {
        await publicClient.readContract({
          abi: [
            {
              inputs: [],
              name: "getSchedule",
              outputs: [{ type: "tuple" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          address,
          functionName: "getSchedule",
        });
        return "lockup-linear";
      } catch {
        // Must be tranched if it has lockup but no getSchedule
        return "lockup-tranched";
      }
    } catch {
      // No lockup method, must be instant
      return "instant";
    }
  } catch (error) {
    throw new Error(`Failed to detect contract type for ${address}: ${error}`);
  }
}

/**
 * Create contract instance with auto-detection
 */
export async function createContractAuto(
  address: Address,
  publicClient: PublicClient,
  walletClient?: WalletClient,
): Promise<SablierContractInstance> {
  const type = await detectContractType(address, publicClient);
  return createContract(type, address, publicClient, walletClient);
}
