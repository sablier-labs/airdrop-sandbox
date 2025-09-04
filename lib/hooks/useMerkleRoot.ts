import type { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import type { ChainId } from "@/lib/config/airdrop";
import { getDistributorContract } from "@/lib/config/airdrop";
import { sablierMerkleAbi } from "@/lib/contracts/abi";

/**
 * Hook return type for Merkle root data
 */
export type UseMerkleRootReturn = {
  /** The Merkle root hash from the contract, undefined if not loaded */
  data: `0x${string}` | undefined;
  /** Error object if the operation failed */
  error: Error | null;
  /** Whether the data is currently loading */
  isLoading: boolean;
  /** Whether the data has been successfully loaded */
  isSuccess: boolean;
  /** Function to manually refetch the Merkle root */
  refetch: () => void;
};

/**
 * Hook to fetch Merkle root from the Sablier airdrop contract
 *
 * Reads the MERKLE_ROOT() function from the contract and provides
 * caching with appropriate stale time. The Merkle root is used to
 * verify eligibility proofs for airdrop claims.
 *
 * @param contractAddress - Optional contract address override (defaults to current chain)
 * @returns Merkle root data with loading states and error handling
 *
 * @example
 * ```tsx
 * function MerkleRootDisplay() {
 *   const { data: merkleRoot, isLoading, error } = useMerkleRoot();
 *
 *   if (isLoading) return <div>Loading Merkle root...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!merkleRoot) return <div>No Merkle root available</div>;
 *
 *   return (
 *     <div>
 *       <p>Merkle Root: {merkleRoot}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom contract address
 * function CrossChainMerkleRoot() {
 *   const mainnetRoot = useMerkleRoot("0x123...");
 *   const baseRoot = useMerkleRoot("0x456...");
 *
 *   return (
 *     <div>
 *       <p>Mainnet: {mainnetRoot.data}</p>
 *       <p>Base: {baseRoot.data}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMerkleRoot(contractAddress?: Address): UseMerkleRootReturn {
  const chainId = useChainId();

  // Use provided contract address or get from current chain
  const distributorAddress = contractAddress || getDistributorContract(chainId as ChainId);

  const { data, error, isLoading, isSuccess, refetch } = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "MERKLE_ROOT",
    query: {
      enabled: !!distributorAddress,
      // Keep in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Cache for 5 minutes since Merkle root rarely changes
      staleTime: 5 * 60 * 1000,
    },
  });

  // Enhanced error handling
  const enhancedError = distributorAddress
    ? error
    : new Error(`No distributor contract found for chain ${chainId}`);

  return {
    data,
    error: enhancedError,
    isLoading,
    isSuccess,
    refetch,
  };
}

// Note: Multi-chain comparison should be implemented at the component level
// to avoid violating React hooks rules. Each chain should use a separate hook call.

/**
 * Utility hook to validate a Merkle root format
 *
 * @param merkleRoot - The Merkle root to validate
 * @returns Validation result with detailed error information
 *
 * @example
 * ```tsx
 * function MerkleRootValidator({ root }: { root: string }) {
 *   const validation = validateMerkleRoot(root);
 *
 *   return (
 *     <div>
 *       <p>Valid: {validation.isValid ? '✅' : '❌'}</p>
 *       {validation.error && <p>Error: {validation.error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function validateMerkleRoot(merkleRoot: string): {
  isValid: boolean;
  error?: string;
} {
  if (!merkleRoot) {
    return {
      error: "Merkle root is required",
      isValid: false,
    };
  }

  if (!merkleRoot.startsWith("0x")) {
    return {
      error: "Merkle root must start with '0x'",
      isValid: false,
    };
  }

  if (merkleRoot.length !== 66) {
    // 0x + 64 hex characters
    return {
      error: "Merkle root must be exactly 66 characters long (32 bytes)",
      isValid: false,
    };
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(merkleRoot)) {
    return {
      error: "Merkle root contains invalid hex characters",
      isValid: false,
    };
  }

  return {
    isValid: true,
  };
}
