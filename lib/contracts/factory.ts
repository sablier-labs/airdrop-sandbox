import type { Address, PublicClient, WalletClient } from "viem";
import { SablierMerkleInstantContract } from "./instant";
import { SablierMerkleLLContract } from "./lockup-linear";
import { SablierMerkleLTContract } from "./lockup-tranched";
import type { SablierMerkleContractInfo } from "./types";

export type ContractType = "instant" | "lockup-linear" | "lockup-tranched";

export type SablierContractInstance =
  | SablierMerkleInstantContract
  | SablierMerkleLLContract
  | SablierMerkleLTContract;

/**
 * Factory for creating Sablier contract instances
 */
export class SablierContractFactory {
  private publicClient: PublicClient;
  private walletClient?: WalletClient;

  constructor(publicClient: PublicClient, walletClient?: WalletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  /**
   * Create a contract instance based on type
   */
  createContract(type: ContractType, address: Address): SablierContractInstance {
    switch (type) {
      case "instant":
        return new SablierMerkleInstantContract(address, this.publicClient, this.walletClient);
      case "lockup-linear":
        return new SablierMerkleLLContract(address, this.publicClient, this.walletClient);
      case "lockup-tranched":
        return new SablierMerkleLTContract(address, this.publicClient, this.walletClient);
      default:
        throw new Error(`Unsupported contract type: ${type}`);
    }
  }

  /**
   * Auto-detect contract type by examining the contract
   */
  async detectContractType(address: Address): Promise<ContractType> {
    try {
      // Try to call type-specific methods to determine contract type

      // Check for lockup-specific methods first
      try {
        await this.publicClient.readContract({
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
          await this.publicClient.readContract({
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
  async createContractAuto(address: Address): Promise<SablierContractInstance> {
    const type = await this.detectContractType(address);
    return this.createContract(type, address);
  }

  /**
   * Create multiple contract instances
   */
  createContracts(
    contracts: Array<{ type: ContractType; address: Address }>,
  ): SablierContractInstance[] {
    return contracts.map(({ type, address }) => this.createContract(type, address));
  }

  /**
   * Get contract info for multiple contracts in parallel
   */
  async getMultipleContractInfo(addresses: Address[]): Promise<SablierMerkleContractInfo[]> {
    const contracts = await Promise.all(
      addresses.map((address) => this.createContractAuto(address)),
    );

    return Promise.all(
      contracts.map(async (contract) => {
        if (contract instanceof SablierMerkleInstantContract) {
          return contract.getContractInfo();
        } else if (contract instanceof SablierMerkleLLContract) {
          return contract.getContractInfo();
        } else if (contract instanceof SablierMerkleLTContract) {
          return contract.getContractInfo();
        }
        throw new Error("Unknown contract type");
      }),
    );
  }

  /**
   * Update wallet client for existing factory
   */
  setWalletClient(walletClient: WalletClient) {
    this.walletClient = walletClient;
  }

  /**
   * Remove wallet client (useful for read-only operations)
   */
  removeWalletClient() {
    this.walletClient = undefined;
  }
}
