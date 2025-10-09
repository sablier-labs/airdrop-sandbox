import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { ClaimData, ProofApiResponse } from "@/types/airdrop.types";

/**
 * Fetches Merkle proof for a given address
 *
 * @param address - Ethereum address to check (optional, defaults to connected wallet)
 * @returns Proof data if eligible, null if not
 */
async function fetchProof(address: string): Promise<ClaimData | null> {
  const response = await fetch(`/api/airdrop/proof?address=${address}`);

  if (!response.ok) {
    // 404 means not eligible (expected case)
    if (response.status === 404) {
      return null;
    }

    // Other errors should throw
    const errorData: ProofApiResponse = await response.json();
    throw new Error(errorData.error || "Failed to fetch proof");
  }

  const data: ProofApiResponse = await response.json();

  if (!data.data) {
    throw new Error("Invalid API response");
  }

  return data.data;
}

/**
 * Hook to fetch Merkle proof for connected wallet
 * Automatically fetches when wallet connects
 *
 * @example
 * ```tsx
 * function ClaimCard() {
 *   const { proof, isEligible, isLoading, error } = useAirdropProof();
 *
 *   if (isLoading) return <div>Checking eligibility...</div>;
 *   if (!isEligible) return <div>Not eligible</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <ClaimButton proof={proof} />;
 * }
 * ```
 */
export function useAirdropProof() {
  const { address, isConnected } = useAccount();

  const {
    data: proof,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    enabled: isConnected && !!address,
    gcTime: 600_000, // 10 minutes
    queryFn: () => {
      if (!address) throw new Error("Address is required");
      return fetchProof(address);
    },
    queryKey: ["airdrop-proof", address],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 300_000, // 5 minutes - proof doesn't change
  });

  return {
    /** Connected wallet address */
    address,
    /** Error object */
    error,
    /** Whether wallet is connected */
    isConnected,
    /** Whether address is eligible */
    isEligible: proof !== null && proof !== undefined,
    /** Error state */
    isError,
    /** Loading state */
    isLoading,
    /** Proof data (index, amount, proof array) */
    proof,
    /** Manually refetch proof */
    refetch,
  };
}

/**
 * Hook to fetch proof for a specific address (not just connected wallet)
 *
 * @param targetAddress - Address to check eligibility for
 * @param enabled - Whether to enable the query (default: true)
 *
 * @example
 * ```tsx
 * function CheckEligibility({ address }: { address: string }) {
 *   const { isEligible, proof, isLoading } = useAirdropProofForAddress(address);
 *
 *   if (isLoading) return <div>Checking...</div>;
 *   return <div>{isEligible ? `Eligible: ${proof?.amount}` : 'Not eligible'}</div>;
 * }
 * ```
 */
export function useAirdropProofForAddress(targetAddress: string | undefined, enabled = true) {
  const {
    data: proof,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    enabled: enabled && !!targetAddress,
    gcTime: 600_000,
    queryFn: () => {
      if (!targetAddress) throw new Error("Address is required");
      return fetchProof(targetAddress);
    },
    queryKey: ["airdrop-proof", targetAddress],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 300_000,
  });

  return {
    /** Target address being checked */
    address: targetAddress,
    /** Error object */
    error,
    /** Whether address is eligible */
    isEligible: proof !== null && proof !== undefined,
    /** Error state */
    isError,
    /** Loading state */
    isLoading,
    /** Proof data */
    proof,
    /** Manually refetch proof */
    refetch,
  };
}
