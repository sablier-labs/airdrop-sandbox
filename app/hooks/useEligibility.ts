"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import { isAddress } from "viem";
import { getEligibilityForAddress, MOCK_RECIPIENTS } from "../lib/merkle/data";
import { generateMerkleTree } from "../lib/merkle/tree";
import type { EligibilityData } from "../types/claim.types";

/**
 * Hook to check wallet eligibility for the airdrop campaign.
 *
 * This hook loads the Merkle tree, checks if the provided address is eligible,
 * and returns all necessary claim data (index, amount, proof).
 *
 * @param address - The wallet address to check eligibility for
 * @returns Eligibility data with loading/error states
 *
 * @example
 * ```tsx
 * function ClaimCard() {
 *   const { address } = useAccount();
 *   const eligibility = useEligibility(address);
 *
 *   if (eligibility.isLoading) return <Spinner />;
 *   if (eligibility.error) return <Error message={eligibility.error} />;
 *   if (!eligibility.data?.eligible) return <NotEligible />;
 *
 *   return <ClaimButton eligibility={eligibility.data} />;
 * }
 * ```
 *
 * CUSTOMIZE: Replace MOCK_RECIPIENTS with API call or database query:
 * ```ts
 * const { data: recipients } = useQuery({
 *   queryKey: ["recipients"],
 *   queryFn: async () => {
 *     const response = await fetch("/api/recipients");
 *     return response.json();
 *   },
 * });
 * ```
 */
export function useEligibility(address?: Address): {
  data: EligibilityData | null;
  isLoading: boolean;
  error: string | null;
} {
  const result = useMemo(() => {
    // Handle no address provided
    if (!address) {
      return {
        data: null,
        error: null,
        isLoading: false,
      };
    }

    // Validate address format
    if (!isAddress(address)) {
      return {
        data: {
          amount: null,
          eligible: false,
          error: "Invalid address format",
          index: null,
          proof: null,
        } as EligibilityData,
        error: "Invalid address format",
        isLoading: false,
      };
    }

    try {
      // CUSTOMIZE: Replace with async data loading
      // For now, we use the mock data synchronously
      const tree = generateMerkleTree(MOCK_RECIPIENTS);
      const eligibility = getEligibilityForAddress(address, tree);

      if (!eligibility) {
        return {
          data: {
            amount: null,
            eligible: false,
            index: null,
            proof: null,
          } as EligibilityData,
          error: null,
          isLoading: false,
        };
      }

      return {
        data: {
          amount: eligibility.amount,
          eligible: true,
          index: eligibility.index,
          proof: eligibility.proof,
        } as EligibilityData,
        error: null,
        isLoading: false,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check eligibility";

      return {
        data: {
          amount: null,
          eligible: false,
          error: errorMessage,
          index: null,
          proof: null,
        } as EligibilityData,
        error: errorMessage,
        isLoading: false,
      };
    }
  }, [address]);

  return result;
}

/**
 * CUSTOMIZE: Async version with API integration
 *
 * Example implementation using React Query:
 *
 * ```typescript
 * import { useQuery } from "@tanstack/react-query";
 *
 * export function useEligibilityAsync(address?: Address) {
 *   return useQuery({
 *     queryKey: ["eligibility", address],
 *     queryFn: async () => {
 *       if (!address || !isAddress(address)) {
 *         return null;
 *       }
 *
 *       // Fetch from API
 *       const response = await fetch(`/api/eligibility/${address}`);
 *       if (!response.ok) {
 *         throw new Error("Failed to check eligibility");
 *       }
 *
 *       const data = await response.json();
 *       return data as EligibilityData;
 *     },
 *     enabled: !!address && isAddress(address),
 *     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
 *     retry: 3,
 *   });
 * }
 * ```
 *
 * Example implementation with database:
 *
 * ```typescript
 * import { useQuery } from "@tanstack/react-query";
 * import { db } from "@/lib/db";
 *
 * async function fetchEligibility(address: Address): Promise<EligibilityData | null> {
 *   const result = await db.query(
 *     `SELECT index, amount, proof FROM eligibility WHERE address = $1`,
 *     [getAddress(address)]
 *   );
 *
 *   if (result.rows.length === 0) {
 *     return {
 *       eligible: false,
 *       index: null,
 *       amount: null,
 *       proof: null,
 *     };
 *   }
 *
 *   const row = result.rows[0];
 *   return {
 *     eligible: true,
 *     index: row.index,
 *     amount: BigInt(row.amount),
 *     proof: JSON.parse(row.proof),
 *   };
 * }
 *
 * export function useEligibilityDb(address?: Address) {
 *   return useQuery({
 *     queryKey: ["eligibility", address],
 *     queryFn: () => fetchEligibility(address!),
 *     enabled: !!address && isAddress(address),
 *     staleTime: 10 * 60 * 1000, // Cache for 10 minutes
 *   });
 * }
 * ```
 */
