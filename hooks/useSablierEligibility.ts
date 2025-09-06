import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import type { SablierContractInstance } from "../lib/contracts";
import { createContract, createContractAuto } from "../lib/contracts";
import type { EligibilityResult } from "../lib/merkle";
import { MerkleVerification } from "../lib/merkle";

type UseSablierEligibilityParams = {
  contractAddress: Address;
  contractType?: "instant" | "lockup-linear" | "lockup-tranched";
  merkleTreeData?: {
    root: string;
    leaves: Array<{
      index: string;
      recipient: string;
      amount: string;
    }>;
  };
  ipfsHash?: string;
  enabled?: boolean;
};

type UseSablierEligibilityReturn = {
  amount: bigint | null;
  error: Error | null;
  hasClaimed: boolean | null;
  index: bigint | null;
  isEligible: boolean;
  isLoading: boolean;
  proof: string[] | null;
  refetch: () => Promise<void>;
  contract: SablierContractInstance | null;
};

/**
 * Hook to check user eligibility for Sablier airdrop claim
 */
export function useSablierEligibility({
  contractAddress,
  contractType,
  merkleTreeData,
  ipfsHash,
  enabled = true,
}: UseSablierEligibilityParams): UseSablierEligibilityReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [eligibilityData, setEligibilityData] = useState<EligibilityResult>({
    isEligible: false,
    leaf: null,
    proof: null,
  });
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
  const [contract, setContract] = useState<SablierContractInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMerkleData = useCallback(async (): Promise<MerkleVerification | null> => {
    if (merkleTreeData) {
      return MerkleVerification.fromTreeData({
        leaves: merkleTreeData.leaves,
        root: merkleTreeData.root as `0x${string}`,
      });
    }

    if (ipfsHash) {
      const { loadTreeFromIPFS } = await import("../lib/merkle/utils");
      return await loadTreeFromIPFS(ipfsHash);
    }

    return null;
  }, [merkleTreeData, ipfsHash]);

  const createContractInstance = useCallback(async (): Promise<SablierContractInstance | null> => {
    if (!publicClient) return null;

    if (contractType) {
      return createContract(contractType, contractAddress, publicClient);
    } else {
      // Auto-detect contract type
      return createContractAuto(contractAddress, publicClient);
    }
  }, [publicClient, contractType, contractAddress]);

  const checkEligibilityAndClaims = useCallback(async () => {
    if (!enabled || !address || !publicClient) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Load merkle data and create contract in parallel
      const [merkleVerification, contractInstance] = await Promise.all([
        loadMerkleData(),
        createContractInstance(),
      ]);

      setContract(contractInstance);

      if (!merkleVerification) {
        throw new Error("No merkle tree data available");
      }

      if (!contractInstance) {
        throw new Error("Failed to create contract instance");
      }

      // Check eligibility
      const eligibility = merkleVerification.checkEligibility(address);
      setEligibilityData(eligibility);

      // Check if already claimed (only if eligible)
      if (eligibility.isEligible && eligibility.leaf) {
        const claimed = await contractInstance.hasClaimed(eligibility.leaf.index);
        setHasClaimed(claimed);
      } else {
        setHasClaimed(false);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setEligibilityData({
        error: error.message,
        isEligible: false,
        leaf: null,
        proof: null,
      });
      setHasClaimed(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, address, publicClient, loadMerkleData, createContractInstance]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    void checkEligibilityAndClaims();
  }, [checkEligibilityAndClaims]);

  return {
    amount: eligibilityData.leaf?.amount || null,
    contract,
    error,
    hasClaimed,
    index: eligibilityData.leaf?.index || null,
    isEligible: eligibilityData.isEligible,
    isLoading,
    proof: eligibilityData.proof,
    refetch: checkEligibilityAndClaims,
  };
}

/**
 * Hook to check eligibility for multiple contracts
 */
export function useMultipleSablierEligibility(
  contracts: Array<{
    address: Address;
    type?: "instant" | "lockup-linear" | "lockup-tranched";
    merkleTreeData?: UseSablierEligibilityParams["merkleTreeData"];
    ipfsHash?: string;
  }>,
  enabled: boolean = true,
) {
  const [results, setResults] = useState<Record<string, UseSablierEligibilityReturn>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkAllContracts = useCallback(async () => {
    if (!enabled || contracts.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const contractResults: Record<string, UseSablierEligibilityReturn> = {};

      // Process each contract
      for (const contractConfig of contracts) {
        // This would need to be implemented to use the individual hook logic
        // For now, we'll set a placeholder
        contractResults[contractConfig.address] = {
          amount: null,
          contract: null,
          error: null,
          hasClaimed: null,
          index: null,
          isEligible: false,
          isLoading: false,
          proof: null,
          refetch: async () => {},
        };
      }

      setResults(contractResults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [contracts, enabled]);

  useEffect(() => {
    void checkAllContracts();
  }, [checkAllContracts]);

  return {
    eligibleContracts: Object.entries(results).filter(
      ([, result]) => result.isEligible && !result.hasClaimed,
    ),
    error,
    isLoading,
    refetch: checkAllContracts,
    results,
    totalEligibleAmount: Object.values(results).reduce(
      (sum, result) => sum + (result.amount || 0n),
      0n,
    ),
  };
}
