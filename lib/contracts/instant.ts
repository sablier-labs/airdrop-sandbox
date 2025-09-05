import { sablierMerkleInstantAbi } from "sablier/dist/releases/airdrops/v1.3/abi/SablierMerkleInstant";
import type { Address, Hash } from "viem";
import { SablierMerkleBaseContract } from "./base";
import type { SablierMerkleInstantInfo } from "./types";

/**
 * Wrapper for SablierMerkleInstant contract
 * Handles instant token distributions via merkle proofs
 */
export class SablierMerkleInstantContract extends SablierMerkleBaseContract<
  typeof sablierMerkleInstantAbi
> {
  /**
   * Get complete contract information including instant-specific details
   */
  async getContractInfo(): Promise<SablierMerkleInstantInfo> {
    const baseInfo = await this.getBaseInfo();
    const firstClaimTime = await this.getFirstClaimTime();

    return {
      ...baseInfo,
      firstClaimTime: firstClaimTime || undefined,
      type: "instant" as const,
    };
  }

  /**
   * Get the contract ABI
   */
  protected getABI() {
    return sablierMerkleInstantAbi;
  }

  /**
   * Get the Claim event signature for instant contracts
   */
  protected getClaimEventSignature(): Hash {
    // keccak256("Claim(uint256,address,uint128)")
    return "0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4" as Hash;
  }

  /**
   * Check if campaign allows instant claiming
   */
  async isClaimingActive(): Promise<boolean> {
    const hasExpired = (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "hasExpired",
    })) as boolean;

    return !hasExpired;
  }

  /**
   * Get total claimed amount (helper for analytics)
   */
  async getClaimedAmount(indices: bigint[]): Promise<bigint> {
    const results = await this.publicClient.multicall({
      contracts: indices.map((index) => ({
        abi: this.getABI(),
        address: this.address,
        args: [index] as const,
        functionName: "hasClaimed",
      })),
    });

    return BigInt(results.filter((r) => r.result === true).length);
  }

  /**
   * Estimate total cost including fee for claiming
   */
  async estimateClaimCost(
    claimParams: { index: bigint; recipient: Address; amount: bigint; merkleProof: Hash[] },
    includeGasPrice: boolean = true,
  ): Promise<{ gas: bigint; fee: bigint; total: bigint }> {
    // Get contract fee
    const fee = (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "FEE",
    })) as bigint;

    if (!includeGasPrice || !this.walletClient) {
      return {
        fee,
        gas: 0n,
        total: fee,
      };
    }

    // Estimate gas
    const gasEstimate = await this.estimateClaimGas(claimParams, fee);
    const gasCost = gasEstimate.gasLimit * (gasEstimate.gasPrice || 0n);

    return {
      fee,
      gas: gasCost,
      total: gasCost + fee,
    };
  }
}
