import { useCallback, useState } from "react";
import type { Address, Hash } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { ClaimParams, ClaimResult, SablierContractInstance } from "../lib/contracts";
import { createContract, createContractAuto } from "../lib/contracts";
import type { SablierContractError } from "../lib/contracts/types";

type UseSablierClaimParams = {
  contractAddress: Address;
  contractType?: "instant" | "lockup-linear" | "lockup-tranched";
  onSuccess?: (result: ClaimResult) => void;
  onError?: (error: SablierContractError) => void;
};

type ClaimState = {
  isLoading: boolean;
  error: SablierContractError | null;
  txHash: Hash | null;
  streamId: bigint | null;
  gasEstimate: {
    gasLimit: bigint;
    gasPrice: bigint;
    totalCost: bigint;
  } | null;
};

type UseSablierClaimReturn = {
  claim: (params: {
    index: bigint;
    amount: bigint;
    proof: Hash[];
    recipient?: Address;
  }) => Promise<ClaimResult>;
  estimateGas: (params: {
    index: bigint;
    amount: bigint;
    proof: Hash[];
    recipient?: Address;
  }) => Promise<void>;
  reset: () => void;
  state: ClaimState;
};

/**
 * Hook to handle Sablier airdrop claiming
 */
export function useSablierClaim({
  contractAddress,
  contractType,
  onSuccess,
  onError,
}: UseSablierClaimParams): UseSablierClaimReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<ClaimState>({
    error: null,
    gasEstimate: null,
    isLoading: false,
    streamId: null,
    txHash: null,
  });

  const createContractInstance = useCallback(async (): Promise<SablierContractInstance> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    if (contractType) {
      return createContract(contractType, contractAddress, publicClient, walletClient);
    } else {
      return createContractAuto(contractAddress, publicClient, walletClient);
    }
  }, [publicClient, walletClient, contractType, contractAddress]);

  const estimateGas = useCallback(
    async (params: { index: bigint; amount: bigint; proof: Hash[]; recipient?: Address }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setState((prev) => ({ ...prev, error: null, isLoading: true }));

      try {
        const contract = await createContractInstance();

        const claimParams: ClaimParams = {
          amount: params.amount,
          index: params.index,
          merkleProof: params.proof,
          recipient: params.recipient || address,
        };

        // Get contract fee
        const baseInfo = await contract.getBaseInfo();
        const fee = baseInfo.fee;

        // Estimate gas
        const gasEstimate = await contract.estimateClaimGas(claimParams, fee);

        setState((prev) => ({
          ...prev,
          gasEstimate: {
            gasLimit: gasEstimate.gasLimit,
            gasPrice: gasEstimate.gasPrice || 0n,
            totalCost: gasEstimate.gasLimit * (gasEstimate.gasPrice || 0n) + fee,
          },
        }));
      } catch (err) {
        const error =
          err instanceof Error
            ? { code: "ESTIMATION_FAILED", message: err.message, type: "UNKNOWN" as const }
            : { code: "UNKNOWN_ERROR", message: "Gas estimation failed", type: "UNKNOWN" as const };

        setState((prev) => ({ ...prev, error }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [address, createContractInstance],
  );

  const claim = useCallback(
    async (params: {
      index: bigint;
      amount: bigint;
      proof: Hash[];
      recipient?: Address;
    }): Promise<ClaimResult> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setState((prev) => ({
        ...prev,
        error: null,
        isLoading: true,
        streamId: null,
        txHash: null,
      }));

      try {
        const contract = await createContractInstance();

        const claimParams: ClaimParams = {
          amount: params.amount,
          index: params.index,
          merkleProof: params.proof,
          recipient: params.recipient || address,
        };

        // Get contract fee for the transaction
        const baseInfo = await contract.getBaseInfo();
        const fee = baseInfo.fee;

        // Execute claim
        const result = await contract.claim(claimParams, fee);

        setState((prev) => ({
          ...prev,
          streamId: result.streamId || null,
          txHash: result.hash,
        }));

        onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        // Parse contract-specific errors
        const error: SablierContractError =
          err && typeof err === "object" && "code" in err
            ? (err as SablierContractError)
            : {
                code: "CLAIM_FAILED",
                message: err instanceof Error ? err.message : "Claim transaction failed",
                type: "UNKNOWN",
              };

        setState((prev) => ({ ...prev, error }));
        onError?.(error);
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [address, createContractInstance, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({
      error: null,
      gasEstimate: null,
      isLoading: false,
      streamId: null,
      txHash: null,
    });
  }, []);

  return {
    claim,
    estimateGas,
    reset,
    state,
  };
}

/**
 * Hook for batch claiming across multiple contracts
 */
export function useBatchSablierClaim({
  contracts,
  onSuccess,
  onError,
}: {
  contracts: Array<{
    address: Address;
    type?: "instant" | "lockup-linear" | "lockup-tranched";
  }>;
  onSuccess?: (results: Array<{ contractAddress: Address; result: ClaimResult }>) => void;
  onError?: (errors: Array<{ contractAddress: Address; error: SablierContractError }>) => void;
}) {
  const [state, setState] = useState<{
    isLoading: boolean;
    progress: number;
    results: Array<{ contractAddress: Address; result: ClaimResult }>;
    errors: Array<{ contractAddress: Address; error: SablierContractError }>;
  }>({
    errors: [],
    isLoading: false,
    progress: 0,
    results: [],
  });

  const batchClaim = useCallback(
    async (
      claimData: Array<{
        contractAddress: Address;
        index: bigint;
        amount: bigint;
        proof: Hash[];
        recipient?: Address;
      }>,
    ) => {
      setState((prev) => ({
        ...prev,
        errors: [],
        isLoading: true,
        progress: 0,
        results: [],
      }));

      const results: Array<{ contractAddress: Address; result: ClaimResult }> = [];
      const errors: Array<{ contractAddress: Address; error: SablierContractError }> = [];

      for (let i = 0; i < claimData.length; i++) {
        const data = claimData[i];
        const contractConfig = contracts.find((c) => c.address === data.contractAddress);

        if (!contractConfig) {
          errors.push({
            contractAddress: data.contractAddress,
            error: {
              code: "CONTRACT_NOT_FOUND",
              message: `Contract configuration not found: ${data.contractAddress}`,
              type: "UNKNOWN",
            },
          });
          continue;
        }

        try {
          // This would use individual claim hooks for each contract
          // For now, this is a simplified implementation
          const result: ClaimResult = {
            hash: "0x" as Hash, // Placeholder
            streamId: undefined,
          };

          results.push({
            contractAddress: data.contractAddress,
            result,
          });
        } catch (err: unknown) {
          errors.push({
            contractAddress: data.contractAddress,
            error:
              err && typeof err === "object" && "code" in err
                ? (err as SablierContractError)
                : {
                    code: "BATCH_CLAIM_FAILED",
                    message: err instanceof Error ? err.message : "Batch claim failed",
                    type: "UNKNOWN",
                  },
          });
        }

        // Update progress
        setState((prev) => ({
          ...prev,
          errors: [...errors],
          progress: ((i + 1) / claimData.length) * 100,
          results: [...results],
        }));
      }

      setState((prev) => ({ ...prev, isLoading: false }));

      if (results.length > 0) {
        onSuccess?.(results);
      }
      if (errors.length > 0) {
        onError?.(errors);
      }

      return { errors, results };
    },
    [contracts, onSuccess, onError],
  );

  return {
    batchClaim,
    reset: () =>
      setState({
        errors: [],
        isLoading: false,
        progress: 0,
        results: [],
      }),
    state,
  };
}
