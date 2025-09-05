import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import type {
  ContractType,
  SablierContractInstance,
  SablierMerkleContractInfo,
} from "../lib/contracts";
import { SablierContractFactory } from "../lib/contracts";

interface UseSablierContractParams {
  contractAddress: Address;
  contractType?: ContractType;
  enabled?: boolean;
}

interface UseSablierContractReturn {
  contract: SablierContractInstance | null;
  contractInfo: SablierMerkleContractInfo | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage Sablier contract instances and information
 */
export function useSablierContract({
  contractAddress,
  contractType,
  enabled = true,
}: UseSablierContractParams): UseSablierContractReturn {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [contract, setContract] = useState<SablierContractInstance | null>(null);
  const [contractInfo, setContractInfo] = useState<SablierMerkleContractInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadContract = useCallback(async () => {
    if (!enabled || !publicClient) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const factory = new SablierContractFactory(publicClient, walletClient);

      const contractInstance = contractType
        ? factory.createContract(contractType, contractAddress)
        : await factory.createContractAuto(contractAddress);

      setContract(contractInstance);

      // Get contract information based on type - all contract instances have getContractInfo
      const info = await contractInstance.getContractInfo();

      setContractInfo(info);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load contract");
      setError(error);
      setContract(null);
      setContractInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, publicClient, walletClient, contractAddress, contractType]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  return {
    contract,
    contractInfo,
    error,
    isLoading,
    refetch: loadContract,
  };
}

/**
 * Hook to manage multiple Sablier contracts
 */
export function useMultipleSablierContracts(
  contracts: Array<{
    address: Address;
    type?: ContractType;
  }>,
  enabled: boolean = true,
) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [contractsData, setContractsData] = useState<
    Record<
      string,
      {
        contract: SablierContractInstance;
        info: SablierMerkleContractInfo;
      }
    >
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const loadAllContracts = useCallback(async () => {
    if (!enabled || !publicClient || contracts.length === 0) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    const factory = new SablierContractFactory(publicClient, walletClient);
    const newContractsData: typeof contractsData = {};
    const newErrors: typeof errors = {};

    await Promise.allSettled(
      contracts.map(async ({ address, type }) => {
        try {
          const contractInstance = type
            ? factory.createContract(type, address)
            : await factory.createContractAuto(address);

          // Get contract info - all contract instances have getContractInfo
          const info = await contractInstance.getContractInfo();

          newContractsData[address] = {
            contract: contractInstance,
            info,
          };
        } catch (err) {
          newErrors[address] = err instanceof Error ? err : new Error("Failed to load contract");
        }
      }),
    );

    setContractsData(newContractsData);
    setErrors(newErrors);
    setIsLoading(false);
  }, [enabled, publicClient, walletClient, contracts]);

  useEffect(() => {
    void loadAllContracts();
  }, [loadAllContracts]);

  return {
    contracts: contractsData,
    errors,
    failedContracts: Object.keys(errors).length,
    isLoading,
    loadedContracts: Object.keys(contractsData).length,
    refetch: loadAllContracts,
    totalContracts: contracts.length,
  };
}

/**
 * Hook for contract admin operations
 */
export function useSablierAdmin(contractAddress: Address, contractType?: ContractType) {
  const { contract, contractInfo } = useSablierContract({
    contractAddress,
    contractType,
    enabled: true,
  });

  const [operationState, setOperationState] = useState<{
    isLoading: boolean;
    error: Error | null;
    txHash: string | null;
  }>({
    error: null,
    isLoading: false,
    txHash: null,
  });

  const clawback = useCallback(
    async (to: Address, amount: bigint) => {
      if (!contract) {
        throw new Error("Contract not loaded");
      }

      setOperationState({ error: null, isLoading: true, txHash: null });

      try {
        const result = await contract.clawback({ amount, to });
        setOperationState({ error: null, isLoading: false, txHash: result.hash });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Clawback failed");
        setOperationState({ error, isLoading: false, txHash: null });
        throw error;
      }
    },
    [contract],
  );

  const transferAdmin = useCallback(
    async (newAdmin: Address) => {
      if (!contract) {
        throw new Error("Contract not loaded");
      }

      setOperationState({ error: null, isLoading: true, txHash: null });

      try {
        const txHash = await contract.transferAdmin({ newAdmin });
        setOperationState({ error: null, isLoading: false, txHash });
        return txHash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Admin transfer failed");
        setOperationState({ error, isLoading: false, txHash: null });
        throw error;
      }
    },
    [contract],
  );

  const collectFees = useCallback(
    async (factoryAdmin: Address) => {
      if (!contract) {
        throw new Error("Contract not loaded");
      }

      setOperationState({ error: null, isLoading: true, txHash: null });

      try {
        const result = await contract.collectFees({ factoryAdmin });
        setOperationState({ error: null, isLoading: false, txHash: result.hash });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Fee collection failed");
        setOperationState({ error, isLoading: false, txHash: null });
        throw error;
      }
    },
    [contract],
  );

  return {
    clawback,
    collectFees,
    contract,
    contractInfo,
    operationState,
    reset: () => setOperationState({ error: null, isLoading: false, txHash: null }),
    transferAdmin,
  };
}
