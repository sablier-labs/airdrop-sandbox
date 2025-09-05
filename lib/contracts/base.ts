import { sablierMerkleBaseAbi } from "sablier/dist/releases/airdrops/v1.3/abi/SablierMerkleBase";
import type { Abi, Address, Hash, Log, PublicClient, WalletClient } from "viem";
import { decodeErrorResult } from "viem";
import type {
  BaseContractInfo,
  ClaimParams,
  ClaimResult,
  ClawbackParams,
  ClawbackResult,
  CollectFeesParams,
  FeeCollectionResult,
  GasEstimate,
  SablierContractError,
  SablierMerkleContractInfo,
  TransferAdminParams,
} from "./types";

/**
 * Base class for all Sablier Merkle contract wrappers
 * Provides common functionality shared across Instant, LL, and LT contracts
 */
export abstract class SablierMerkleBaseContract<TAbi extends Abi> {
  protected address: Address;
  protected publicClient: PublicClient;
  protected walletClient?: WalletClient;

  constructor(address: Address, publicClient: PublicClient, walletClient?: WalletClient) {
    this.address = address;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  /**
   * Get contract information - abstract method implemented by subclasses
   */
  abstract getContractInfo(): Promise<SablierMerkleContractInfo>;

  /**
   * Get basic contract information
   */
  async getBaseInfo(): Promise<BaseContractInfo> {
    // Use the base ABI directly for type-safe base contract operations
    const [
      admin,
      campaignName,
      expiration,
      factory,
      fee,
      ipfsCID,
      merkleRoot,
      shape,
      token,
      hasExpired,
    ] = await Promise.all([
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "admin",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "campaignName",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "EXPIRATION",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "FACTORY",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "FEE",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "ipfsCID",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "MERKLE_ROOT",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "shape",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "TOKEN",
      }),
      this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "hasExpired",
      }),
    ]);

    return {
      address: this.address,
      admin,
      campaignName,
      expiration: Number(expiration),
      factory,
      fee,
      hasExpired,
      ipfsCID,
      merkleRoot,
      shape,
      token,
    };
  }

  /**
   * Check if a specific index has been claimed
   */
  async hasClaimed(index: bigint): Promise<boolean> {
    return await this.publicClient.readContract({
      abi: sablierMerkleBaseAbi,
      address: this.address,
      args: [index],
      functionName: "hasClaimed",
    });
  }

  /**
   * Get the first claim time (when first claim was made)
   */
  async getFirstClaimTime(): Promise<number | null> {
    try {
      const result = await this.publicClient.readContract({
        abi: sablierMerkleBaseAbi,
        address: this.address,
        args: [],
        functionName: "getFirstClaimTime",
      });

      return (result as unknown as bigint) === 0n ? null : Number(result as unknown as bigint);
    } catch {
      return null;
    }
  }

  /**
   * Estimate gas for claiming
   */
  async estimateClaimGas(params: ClaimParams, value?: bigint): Promise<GasEstimate> {
    if (!this.walletClient) {
      throw new Error("Wallet client required for gas estimation");
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Wallet client account not connected");
    }

    const gasLimit = await this.publicClient.estimateContractGas({
      abi: sablierMerkleBaseAbi,
      account: account.address,
      address: this.address,
      args: [params.index, params.recipient, params.amount, params.merkleProof],
      functionName: "claim",
      value: value || 0n,
    });

    // Add 20% buffer to gas limit
    const bufferedGasLimit = (gasLimit * 120n) / 100n;

    // Get current gas price
    const gasPrice = await this.publicClient.getGasPrice();

    return {
      gasLimit: bufferedGasLimit,
      gasPrice,
    };
  }

  /**
   * Execute claim transaction
   */
  async claim(params: ClaimParams, feeAmount?: bigint): Promise<ClaimResult> {
    if (!this.walletClient) {
      throw new Error("Wallet client required for claiming");
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Wallet client account not connected");
    }

    try {
      const hash = await this.walletClient.writeContract({
        abi: sablierMerkleBaseAbi,
        account,
        address: this.address,
        args: [params.index, params.recipient, params.amount, params.merkleProof],
        chain: null,
        functionName: "claim",
        value: feeAmount || 0n,
      });

      // For streaming contracts, we need to get the stream ID from logs
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      const streamId = this.extractStreamIdFromLogs(receipt.logs);

      return {
        hash,
        streamId,
      };
    } catch (error) {
      throw this.parseContractError(error);
    }
  }

  /**
   * Execute clawback (admin only)
   */
  async clawback(params: ClawbackParams): Promise<ClawbackResult> {
    if (!this.walletClient) {
      throw new Error("Wallet client required for clawback");
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Wallet client account not connected");
    }

    try {
      const hash = await this.walletClient.writeContract({
        abi: sablierMerkleBaseAbi,
        account,
        address: this.address,
        args: [params.to, params.amount],
        chain: null,
        functionName: "clawback",
      });

      return { hash };
    } catch (error) {
      throw this.parseContractError(error);
    }
  }

  /**
   * Transfer admin role
   */
  async transferAdmin(params: TransferAdminParams): Promise<Hash> {
    if (!this.walletClient) {
      throw new Error("Wallet client required for admin transfer");
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Wallet client account not connected");
    }

    try {
      return await this.walletClient.writeContract({
        abi: sablierMerkleBaseAbi,
        account,
        address: this.address,
        args: [params.newAdmin],
        chain: null,
        functionName: "transferAdmin",
      });
    } catch (error) {
      throw this.parseContractError(error);
    }
  }

  /**
   * Collect fees (factory admin only)
   */
  async collectFees(params: CollectFeesParams): Promise<FeeCollectionResult> {
    if (!this.walletClient) {
      throw new Error("Wallet client required for fee collection");
    }

    const account = this.walletClient.account;
    if (!account) {
      throw new Error("Wallet client account not connected");
    }

    try {
      const hash = await this.walletClient.writeContract({
        abi: sablierMerkleBaseAbi,
        account,
        address: this.address,
        args: [params.factoryAdmin],
        chain: null,
        functionName: "collectFees",
      });

      const _receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      // Extract fee amount from transaction (this would need specific implementation)
      const feeAmount = 0n; // TODO: Extract from logs or return value

      return {
        feeAmount,
        hash,
      };
    } catch (error) {
      throw this.parseContractError(error);
    }
  }

  /**
   * Parse contract errors into user-friendly format
   */
  protected parseContractError(error: unknown): SablierContractError {
    if (typeof error === "object" && error !== null && "data" in error) {
      try {
        const decoded = decodeErrorResult({
          abi: sablierMerkleBaseAbi,
          data: error.data as `0x${string}`,
        });

        switch (decoded.errorName) {
          case "SablierMerkleBase_CampaignExpired":
            return {
              code: "CAMPAIGN_EXPIRED",
              message: "Campaign has expired and claims are no longer accepted",
              type: "CAMPAIGN_EXPIRED",
            };
          case "SablierMerkleBase_StreamClaimed":
            return {
              code: "ALREADY_CLAIMED",
              message: "This allocation has already been claimed",
              type: "ALREADY_CLAIMED",
            };
          case "SablierMerkleBase_InvalidProof":
            return {
              code: "INVALID_PROOF",
              message: "Invalid merkle proof provided",
              type: "INVALID_PROOF",
            };
          case "SablierMerkleBase_InsufficientFeePayment":
            return {
              code: "INSUFFICIENT_FEE",
              message: "Insufficient fee payment",
              type: "INSUFFICIENT_FEE",
            };
          case "CallerNotAdmin":
            return {
              code: "ACCESS_DENIED",
              message: "Access denied: admin privileges required",
              type: "ACCESS_DENIED",
            };
          default:
            return {
              code: "UNKNOWN_CONTRACT_ERROR",
              message: `Contract error: ${decoded.errorName}`,
              type: "UNKNOWN",
            };
        }
      } catch {
        // Fall through to generic error handling
      }
    }

    return {
      code: "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      type: "UNKNOWN",
    };
  }

  /**
   * Extract stream ID from transaction logs (for LL and LT contracts)
   */
  protected extractStreamIdFromLogs(logs: Log[]): bigint | undefined {
    // This would be implemented to parse the Claim event logs
    // and extract the streamId field if present
    for (const log of logs) {
      if (log.topics?.[0] === this.getClaimEventSignature()) {
        // Parse the log data to extract streamId
        // This is a simplified implementation
        return undefined; // TODO: Implement log parsing
      }
    }
    return undefined;
  }

  /**
   * Get the contract ABI - must be implemented by subclasses
   */
  protected abstract getABI(): TAbi;

  /**
   * Get the Claim event signature for log parsing
   */
  protected abstract getClaimEventSignature(): Hash;
}
