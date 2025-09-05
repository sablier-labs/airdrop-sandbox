import { sablierMerkleLLAbi } from "sablier/dist/releases/airdrops/v1.3/abi/SablierMerkleLL";
import type { Address, Hash } from "viem";
import { SablierMerkleBaseContract } from "./base";
import type { LockupLinearSchedule, SablierMerkleLLInfo } from "./types";

/**
 * Wrapper for SablierMerkleLL (Lockup Linear) contract
 * Handles linear vesting token distributions via merkle proofs
 */
export class SablierMerkleLLContract extends SablierMerkleBaseContract<typeof sablierMerkleLLAbi> {
  /**
   * Get complete contract information including linear lockup specific details
   */
  async getContractInfo(): Promise<SablierMerkleLLInfo> {
    const baseInfo = await this.getBaseInfo();

    const [lockup, cancelable, transferable, schedule, firstClaimTime] = await Promise.all([
      this.getLockupContract(),
      this.isStreamCancelable(),
      this.isStreamTransferable(),
      this.getSchedule(),
      this.getFirstClaimTime(),
    ]);

    return {
      ...baseInfo,
      cancelable,
      firstClaimTime: firstClaimTime || undefined,
      lockup,
      schedule,
      transferable,
      type: "lockup-linear" as const,
    };
  }

  /**
   * Get the lockup contract address
   */
  async getLockupContract(): Promise<Address> {
    return (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "LOCKUP",
    })) as Address;
  }

  /**
   * Check if streams are cancelable
   */
  async isStreamCancelable(): Promise<boolean> {
    return (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "STREAM_CANCELABLE",
    })) as boolean;
  }

  /**
   * Check if streams are transferable
   */
  async isStreamTransferable(): Promise<boolean> {
    return (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "STREAM_TRANSFERABLE",
    })) as boolean;
  }

  /**
   * Get the linear vesting schedule
   */
  async getSchedule(): Promise<LockupLinearSchedule> {
    const schedule = (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "getSchedule",
    })) as {
      cliffDuration: number;
      cliffPercentage: bigint;
      startPercentage: bigint;
      startTime: number;
      totalDuration: number;
    };

    return {
      cliffDuration: Number(schedule.cliffDuration),
      cliffPercentage: schedule.cliffPercentage,
      startPercentage: schedule.startPercentage,
      startTime: Number(schedule.startTime),
      totalDuration: Number(schedule.totalDuration),
    };
  }

  /**
   * Get the contract ABI
   */
  protected getABI() {
    return sablierMerkleLLAbi;
  }

  /**
   * Get the Claim event signature for linear lockup contracts
   */
  protected getClaimEventSignature(): Hash {
    // keccak256("Claim(uint256,address,uint128,uint256)")
    return "0x5d1ad6d87b6b2c76b2c062d3977b0d5c0c8d20b1c0a4a8c2d3c1b9f0e7e5a3b2" as Hash;
  }

  /**
   * Calculate vesting information for a given amount and current time
   */
  calculateVestingInfo(
    amount: bigint,
    currentTimestamp: number,
  ): {
    isVesting: boolean;
    totalAmount: bigint;
    vestedAmount: bigint;
    remainingAmount: bigint;
    cliffReached: boolean;
    vestingEndTime: number;
  } {
    // This would implement the linear vesting calculation
    // For now, returning a basic structure
    return {
      cliffReached: false,
      isVesting: true,
      remainingAmount: amount,
      totalAmount: amount,
      vestedAmount: 0n,
      vestingEndTime: currentTimestamp + 86400, // Placeholder
    };
  }

  /**
   * Estimate total cost including fee for claiming (creates a stream)
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

    // Estimate gas (higher for stream creation)
    const gasEstimate = await this.estimateClaimGas(claimParams, fee);
    const gasCost = gasEstimate.gasLimit * (gasEstimate.gasPrice || 0n);

    return {
      fee,
      gas: gasCost,
      total: gasCost + fee,
    };
  }

  /**
   * Get stream status from the lockup contract (requires additional setup)
   */
  async getStreamStatus(_streamId: bigint): Promise<{
    status: "pending" | "streaming" | "settled" | "canceled" | "depleted";
    streamedAmount: bigint;
    refundedAmount: bigint;
  }> {
    // This would require integration with the actual Sablier Lockup contract
    // For now, returning a placeholder
    return {
      refundedAmount: 0n,
      status: "pending",
      streamedAmount: 0n,
    };
  }
}
