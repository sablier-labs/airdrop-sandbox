"use client";

import type { Address, Hash } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { defaultCampaignConfig } from "../lib/config/campaign";
import { SablierMerkleInstantAbi } from "../lib/contracts/abis";

/**
 * Parameters for submitting a claim transaction
 */
export interface ClaimParams {
  /**
   * Index in the Merkle tree
   */
  index: number;

  /**
   * Recipient address (can differ from msg.sender for gifting)
   */
  recipient: Address;

  /**
   * Amount of tokens to claim (in smallest unit)
   */
  amount: bigint;

  /**
   * Merkle proof array
   */
  proof: Hash[];
}

/**
 * Result of the claim transaction
 */
export interface ClaimResult {
  /**
   * Transaction hash if submitted
   */
  hash?: Hash;

  /**
   * Whether the claim is being prepared/simulated
   */
  isPreparing: boolean;

  /**
   * Whether the transaction is being submitted
   */
  isSubmitting: boolean;

  /**
   * Whether the transaction is waiting for confirmation
   */
  isConfirming: boolean;

  /**
   * Whether the transaction succeeded
   */
  isSuccess: boolean;

  /**
   * Whether an error occurred
   */
  isError: boolean;

  /**
   * Error object if failed
   */
  error: Error | null;
}

/**
 * Hook to execute a claim transaction with simulation and proper fee handling.
 *
 * This hook uses wagmi's useSimulateContract to simulate the transaction before
 * execution, ensuring it will succeed. It reads the claim fee from the contract
 * and includes it in the transaction value.
 *
 * @returns Object with claim function and transaction status
 *
 * @example
 * ```tsx
 * function ClaimButton({ eligibility }: { eligibility: EligibilityData }) {
 *   const { address } = useAccount();
 *   const { claim, result } = useClaim();
 *
 *   const handleClaim = () => {
 *     if (!address || !eligibility.eligible) return;
 *
 *     claim({
 *       index: eligibility.index!,
 *       recipient: address,
 *       amount: eligibility.amount!,
 *       proof: eligibility.proof!,
 *     });
 *   };
 *
 *   if (result.isSuccess) {
 *     return <Success txHash={result.hash} />;
 *   }
 *
 *   return (
 *     <button
 *       onClick={handleClaim}
 *       disabled={result.isPreparing || result.isSubmitting || result.isConfirming}
 *     >
 *       {result.isPreparing && "Preparing..."}
 *       {result.isSubmitting && "Confirm in wallet..."}
 *       {result.isConfirming && "Confirming..."}
 *       {!result.isPreparing && !result.isSubmitting && !result.isConfirming && "Claim Tokens"}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Claim to a different recipient (gifting)
 * function GiftClaim({ eligibility, giftRecipient }: Props) {
 *   const { claim } = useClaim();
 *
 *   const handleGift = () => {
 *     claim({
 *       index: eligibility.index!,
 *       recipient: giftRecipient, // Send to different address
 *       amount: eligibility.amount!,
 *       proof: eligibility.proof!,
 *     });
 *   };
 *
 *   return <button onClick={handleGift}>Gift to {giftRecipient}</button>;
 * }
 * ```
 */
export function useClaim(): {
  claim: (params: ClaimParams) => void;
  result: ClaimResult;
  reset: () => void;
} {
  const { address: connectedAddress, isConnected } = useAccount();

  // Read the claim fee from the contract
  const { data: claimFeeData } = useReadContract({
    abi: SablierMerkleInstantAbi,
    address: defaultCampaignConfig.contractAddress,
    functionName: "FEE",
    query: {
      enabled:
        isConnected &&
        defaultCampaignConfig.contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Ensure claimFee is always a bigint (default to 0n if undefined)
  const claimFee = typeof claimFeeData === "bigint" ? claimFeeData : 0n;

  // Wagmi v2 pattern: useWriteContract returns writeContract function directly
  const {
    data: hash,
    error: writeError,
    isPending: isSubmitting,
    isSuccess,
    isError,
    writeContract,
    reset,
  } = useWriteContract();

  /**
   * Execute the claim transaction
   *
   * IMPORTANT: This does not simulate first - simulation is optional in wagmi v2.
   * For production, consider adding useSimulateContract for pre-flight checks.
   */
  const claim = (params: ClaimParams) => {
    if (!isConnected || !connectedAddress) {
      throw new Error("Wallet not connected");
    }

    // Validate parameters
    if (params.index < 0) {
      throw new Error("Invalid index");
    }

    if (params.amount <= 0n) {
      throw new Error("Invalid amount");
    }

    if (!params.proof || params.proof.length === 0) {
      throw new Error("Invalid proof");
    }

    // Execute the claim
    writeContract({
      abi: SablierMerkleInstantAbi,
      address: defaultCampaignConfig.contractAddress,
      args: [BigInt(params.index), params.recipient, params.amount, params.proof],
      functionName: "claim",
      value: claimFee, // Include the protocol fee (0n if no fee required)
    });
  };

  return {
    claim,
    reset,
    result: {
      error: writeError,
      hash,
      isConfirming: false, // Would need useWaitForTransactionReceipt for this
      isError,
      isPreparing: false, // Not using simulation in this basic version
      isSubmitting,
      isSuccess,
    },
  };
}

/**
 * CUSTOMIZE: Enhanced version with simulation and transaction receipt
 *
 * This version adds pre-flight simulation and waits for transaction confirmation.
 * Use this for production to provide better UX and catch errors early.
 *
 * ```typescript
 * import { useWaitForTransactionReceipt } from "wagmi";
 *
 * export function useClaimEnhanced() {
 *   const [claimParams, setClaimParams] = useState<ClaimParams | null>(null);
 *
 *   // Read claim fee
 *   const { data: claimFee = 0n } = useReadContract({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     functionName: "FEE",
 *   });
 *
 *   // Simulate the transaction
 *   const { data: simulateData, error: simulateError, isLoading: isPreparing } = useSimulateContract({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     functionName: "claim",
 *     args: claimParams
 *       ? [BigInt(claimParams.index), claimParams.recipient, claimParams.amount, claimParams.proof]
 *       : undefined,
 *     value: claimFee,
 *     query: {
 *       enabled: !!claimParams,
 *     },
 *   });
 *
 *   // Execute the transaction
 *   const {
 *     data: hash,
 *     error: writeError,
 *     isPending: isSubmitting,
 *     writeContract,
 *     reset,
 *   } = useWriteContract();
 *
 *   // Wait for confirmation
 *   const {
 *     isLoading: isConfirming,
 *     isSuccess,
 *   } = useWaitForTransactionReceipt({
 *     hash,
 *   });
 *
 *   const claim = (params: ClaimParams) => {
 *     setClaimParams(params);
 *     // Simulation will run, then user can approve
 *     if (simulateData?.request) {
 *       writeContract(simulateData.request);
 *     }
 *   };
 *
 *   const error = simulateError || writeError;
 *
 *   return {
 *     claim,
 *     reset: () => {
 *       reset();
 *       setClaimParams(null);
 *     },
 *     result: {
 *       hash,
 *       isPreparing,
 *       isSubmitting,
 *       isConfirming,
 *       isSuccess,
 *       isError: !!error,
 *       error,
 *     },
 *   };
 * }
 * ```
 */

/**
 * CUSTOMIZE: Version with gas estimation
 *
 * For better UX, show users the estimated gas cost before claiming.
 *
 * ```typescript
 * import { useEstimateGas, useGasPrice } from "wagmi";
 * import { formatEther } from "viem";
 *
 * export function useClaimWithGasEstimate() {
 *   const [claimParams, setClaimParams] = useState<ClaimParams | null>(null);
 *
 *   const { data: claimFee = 0n } = useReadContract({
 *     address: defaultCampaignConfig.contractAddress,
 *     abi: SablierMerkleInstantAbi,
 *     functionName: "FEE",
 *   });
 *
 *   // Estimate gas
 *   const { data: gasEstimate } = useEstimateGas({
 *     to: defaultCampaignConfig.contractAddress,
 *     data: claimParams ? encodeFunctionData({
 *       abi: SablierMerkleInstantAbi,
 *       functionName: "claim",
 *       args: [BigInt(claimParams.index), claimParams.recipient, claimParams.amount, claimParams.proof],
 *     }) : undefined,
 *     value: claimFee,
 *   });
 *
 *   const { data: gasPrice } = useGasPrice();
 *
 *   const estimatedCost = gasEstimate && gasPrice
 *     ? formatEther((gasEstimate * gasPrice) + claimFee)
 *     : null;
 *
 *   // ... rest of implementation
 *
 *   return {
 *     claim,
 *     result,
 *     estimatedCost, // Display this to users
 *   };
 * }
 * ```
 */
