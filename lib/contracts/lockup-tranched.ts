import { sablierMerkleLTAbi } from "sablier/dist/releases/airdrops/v1.3/abi/SablierMerkleLT";
import type { Address, Hash } from "viem";
import { SablierMerkleBaseContract } from "./base";
import type { SablierMerkleLTInfo, TrancheWithPercentage } from "./types";

/**
 * Wrapper for SablierMerkleLT (Lockup Tranched) contract
 * Handles tranched/milestone-based token distributions via merkle proofs
 */
export class SablierMerkleLTContract extends SablierMerkleBaseContract<typeof sablierMerkleLTAbi> {
  /**
   * Get complete contract information including tranched lockup specific details
   */
  async getContractInfo(): Promise<SablierMerkleLTInfo> {
    const baseInfo = await this.getBaseInfo();

    const [
      lockup,
      cancelable,
      transferable,
      streamStartTime,
      totalPercentage,
      tranchesWithPercentages,
      firstClaimTime,
    ] = await Promise.all([
      this.getLockupContract(),
      this.isStreamCancelable(),
      this.isStreamTransferable(),
      this.getStreamStartTime(),
      this.getTotalPercentage(),
      this.getTranchesWithPercentages(),
      this.getFirstClaimTime(),
    ]);

    return {
      ...baseInfo,
      cancelable,
      firstClaimTime: firstClaimTime || undefined,
      lockup,
      streamStartTime,
      totalPercentage,
      tranchesWithPercentages,
      transferable,
      type: "lockup-tranched" as const,
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
   * Get the stream start time
   */
  async getStreamStartTime(): Promise<number> {
    return Number(
      await this.publicClient.readContract({
        abi: this.getABI(),
        address: this.address,
        args: [] as const,
        functionName: "STREAM_START_TIME",
      }),
    );
  }

  /**
   * Get the total percentage (should be 100%)
   */
  async getTotalPercentage(): Promise<bigint> {
    return (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "TOTAL_PERCENTAGE",
    })) as bigint;
  }

  /**
   * Get all tranches with their unlock percentages and durations
   */
  async getTranchesWithPercentages(): Promise<TrancheWithPercentage[]> {
    const tranches = (await this.publicClient.readContract({
      abi: this.getABI(),
      address: this.address,
      args: [] as const,
      functionName: "getTranchesWithPercentages",
    })) as Array<{
      duration: number;
      unlockPercentage: bigint;
    }>;

    return tranches.map((tranche) => ({
      duration: Number(tranche.duration),
      unlockPercentage: tranche.unlockPercentage,
    })) as TrancheWithPercentage[];
  }

  /**
   * Get the contract ABI
   */
  protected getABI() {
    return sablierMerkleLTAbi;
  }

  /**
   * Get the Claim event signature for tranched lockup contracts
   */
  protected getClaimEventSignature(): Hash {
    // keccak256("Claim(uint256,address,uint128,uint256)")
    return "0x5d1ad6d87b6b2c76b2c062d3977b0d5c0c8d20b1c0a4a8c2d3c1b9f0e7e5a3b2" as Hash;
  }

  /**
   * Calculate tranched vesting information
   */
  calculateTranchedVesting(
    amount: bigint,
    _currentTimestamp: number,
  ): {
    totalTranches: number;
    completedTranches: number;
    currentTrancheIndex: number;
    nextUnlockTime: number | null;
    totalUnlocked: bigint;
    remainingAmount: bigint;
    trancheBreakdown: Array<{
      index: number;
      percentage: bigint;
      amount: bigint;
      unlockTime: number;
      isUnlocked: boolean;
    }>;
  } {
    // This would implement the tranched vesting calculation
    // For now, returning a basic structure
    return {
      completedTranches: 0,
      currentTrancheIndex: 0,
      nextUnlockTime: null,
      remainingAmount: amount,
      totalTranches: 0,
      totalUnlocked: 0n,
      trancheBreakdown: [],
    };
  }

  /**
   * Get detailed tranche timeline
   */
  async getTrancheTimeline(streamStartTime?: number): Promise<
    Array<{
      index: number;
      unlockTime: number;
      unlockPercentage: bigint;
      cumulativePercentage: bigint;
      isActive: boolean;
    }>
  > {
    const tranches = await this.getTranchesWithPercentages();
    const startTime = streamStartTime || (await this.getStreamStartTime());
    const currentTime = Math.floor(Date.now() / 1000);

    let cumulativeTime = startTime;
    let cumulativePercentage = 0n;

    return tranches.map((tranche, index) => {
      cumulativeTime += tranche.duration;
      cumulativePercentage += tranche.unlockPercentage;

      return {
        cumulativePercentage,
        index,
        isActive: currentTime >= cumulativeTime,
        unlockPercentage: tranche.unlockPercentage,
        unlockTime: cumulativeTime,
      };
    });
  }

  /**
   * Estimate total cost including fee for claiming (creates a tranched stream)
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

    // Estimate gas (highest for tranched stream creation due to complexity)
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
    currentTranche: number;
    nextTrancheTime: number | null;
  }> {
    // This would require integration with the actual Sablier Lockup contract
    // For now, returning a placeholder
    return {
      currentTranche: 0,
      nextTrancheTime: null,
      refundedAmount: 0n,
      status: "pending",
      streamedAmount: 0n,
    };
  }

  /**
   * Calculate amount unlocked at specific time
   */
  calculateUnlockedAmount(
    _totalAmount: bigint,
    _targetTime: number,
    _tranches?: TrancheWithPercentage[],
    _startTime?: number,
  ): bigint {
    // Implementation would calculate based on tranches
    return 0n;
  }
}
