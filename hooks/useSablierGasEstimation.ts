import { useCallback, useEffect, useState } from "react";
import type { Address, Hash } from "viem";
import { formatUnits, parseGwei } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { ClaimParams, SablierContractInstance } from "../lib/contracts";
import { SablierContractFactory } from "../lib/contracts";

interface GasEstimationData {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  contractFee: bigint;
  totalGasCost: bigint;
  totalCost: bigint; // Gas + contract fee
  totalCostFormatted: string; // In ETH
}

interface UseSablierGasEstimationParams {
  contractAddress: Address;
  contractType?: "instant" | "lockup-linear" | "lockup-tranched";
  autoUpdate?: boolean;
  updateInterval?: number; // seconds
}

interface UseSablierGasEstimationReturn {
  estimate: (params: {
    index: bigint;
    amount: bigint;
    proof: Hash[];
    recipient?: Address;
  }) => Promise<GasEstimationData>;
  gasData: GasEstimationData | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for comprehensive gas estimation for Sablier claims
 */
export function useSablierGasEstimation({
  contractAddress,
  contractType,
  autoUpdate = false,
  updateInterval = 30,
}: UseSablierGasEstimationParams): UseSablierGasEstimationReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [gasData, setGasData] = useState<GasEstimationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastParams, setLastParams] = useState<ClaimParams | null>(null);

  const createContract = useCallback(async (): Promise<SablierContractInstance> => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const factory = new SablierContractFactory(publicClient, walletClient);

    return contractType
      ? factory.createContract(contractType, contractAddress)
      : factory.createContractAuto(contractAddress);
  }, [publicClient, walletClient, contractType, contractAddress]);

  const estimate = useCallback(
    async (params: {
      index: bigint;
      amount: bigint;
      proof: Hash[];
      recipient?: Address;
    }): Promise<GasEstimationData> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const contract = await createContract();

        const claimParams: ClaimParams = {
          amount: params.amount,
          index: params.index,
          merkleProof: params.proof,
          recipient: params.recipient || address,
        };

        setLastParams(claimParams);

        // Get contract fee
        const baseInfo = await contract.getBaseInfo();
        const contractFee = baseInfo.fee;

        // Get current gas prices
        let [gasPrice, feeData] = await Promise.all([
          publicClient?.getGasPrice(),
          publicClient?.estimateFeesPerGas().catch(() => null),
        ]);
        gasPrice = gasPrice ?? parseGwei("1");

        // Estimate gas for claim transaction
        const gasEstimate = await contract.estimateClaimGas(claimParams, contractFee);
        const totalGasCost = gasEstimate.gasLimit * gasPrice;
        const totalCost = totalGasCost + contractFee;

        const estimationData: GasEstimationData = {
          contractFee,
          gasLimit: gasEstimate.gasLimit,
          gasPrice,
          maxFeePerGas: feeData?.maxFeePerGas,
          maxPriorityFeePerGas: feeData?.maxPriorityFeePerGas,
          totalCost,
          totalCostFormatted: formatUnits(totalCost, 18),
          totalGasCost,
        };

        setGasData(estimationData);
        setLastUpdated(new Date());

        return estimationData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Gas estimation failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [address, createContract, publicClient],
  );

  const refresh = useCallback(async () => {
    if (!lastParams) {
      return;
    }

    await estimate({
      amount: lastParams.amount,
      index: lastParams.index,
      proof: lastParams.merkleProof,
      recipient: lastParams.recipient,
    });
  }, [estimate, lastParams]);

  // Auto-update functionality
  useEffect(() => {
    if (!autoUpdate || !lastParams) {
      return;
    }

    const interval = setInterval(refresh, updateInterval * 1000);
    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, refresh, lastParams]);

  return {
    error,
    estimate,
    gasData,
    isLoading,
    lastUpdated,
    refresh,
  };
}

/**
 * Hook for batch gas estimation across multiple contracts
 */
export function useBatchGasEstimation(
  contracts: Array<{
    address: Address;
    type?: "instant" | "lockup-linear" | "lockup-tranched";
  }>,
  claimData: Array<{
    contractAddress: Address;
    index: bigint;
    amount: bigint;
    proof: Hash[];
  }>,
) {
  const [estimations, setEstimations] = useState<Record<string, GasEstimationData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const estimateAll = useCallback(async () => {
    if (contracts.length === 0 || claimData.length === 0) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    const newEstimations: Record<string, GasEstimationData> = {};
    const newErrors: Record<string, Error> = {};

    for (const contractConfig of contracts) {
      const data = claimData.find((d) => d.contractAddress === contractConfig.address);
      if (!data) continue;

      try {
        // This would use the individual gas estimation hook
        // Simplified for now
        const mockEstimation: GasEstimationData = {
          contractFee: 1000000000000000n, // 0.001 ETH
          gasLimit: 200000n,
          gasPrice: 20000000000n, // 20 gwei
          totalCost: 5000000000000000n, // ~0.005 ETH
          totalCostFormatted: "0.005",
          totalGasCost: 4000000000000000n, // ~0.004 ETH
        };

        newEstimations[contractConfig.address] = mockEstimation;
      } catch (err) {
        newErrors[contractConfig.address] =
          err instanceof Error ? err : new Error("Estimation failed");
      }
    }

    setEstimations(newEstimations);
    setErrors(newErrors);
    setIsLoading(false);
  }, [contracts, claimData]);

  const getTotalCost = useCallback(() => {
    return Object.values(estimations).reduce((total, est) => total + est.totalCost, 0n);
  }, [estimations]);

  const getTotalGas = useCallback(() => {
    return Object.values(estimations).reduce((total, est) => total + est.gasLimit, 0n);
  }, [estimations]);

  return {
    errors,
    estimateAll,
    estimations,
    isLoading,
    totalCost: getTotalCost(),
    totalCostFormatted: formatUnits(getTotalCost(), 18),
    totalGas: getTotalGas(),
  };
}
