import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import type { ChainId } from "@/lib/config/airdrop";
import { getDistributorContract, sapienAirdropCampaign } from "@/lib/config/airdrop";
import { sablierMerkleAbi } from "@/lib/contracts/abi";

/**
 * Campaign details retrieved from contract and configuration
 */
export type CampaignDetails = {
  /** Contract addresses for current chain */
  contracts: {
    distributor: Address;
    lockupLinear: Address;
    token: Address;
  };
  /** Campaign metadata from config */
  metadata: {
    description: string;
    id: string;
    name: string;
    websiteUrl?: string;
  };
  /** Contract state information */
  state: {
    admin: Address;
    cancelable: boolean;
    claimsCount: bigint;
    isActive: boolean;
    isPaused: boolean;
    merkleRoot: `0x${string}`;
    transferable: boolean;
  };
  /** Token and distribution information */
  tokenInfo: {
    address: Address;
    decimals: number;
    logoUrl?: string;
    name: string;
    symbol: string;
  };
};

/**
 * Hook return type with loading states and error handling
 */
export type UseAirdropReturn = {
  /** Campaign details if successfully loaded */
  campaign?: CampaignDetails;
  /** Error object if any operation failed */
  error: Error | null;
  /** Whether any data is currently loading */
  isLoading: boolean;
  /** Whether data has been successfully loaded */
  isSuccess: boolean;
  /** Function to manually refetch data */
  refetch: () => void;
};

/**
 * Main airdrop contract interaction hook
 *
 * Fetches comprehensive campaign details including:
 * - Contract state (claims count, pause status, admin info)
 * - Campaign metadata and configuration
 * - Token information and distribution details
 * - Contract addresses for the current chain
 *
 * @returns Campaign details, loading states, and error information
 *
 * @example
 * ```tsx
 * function AirdropInfo() {
 *   const { campaign, isLoading, error } = useAirdrop();
 *
 *   if (isLoading) return <div>Loading campaign...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!campaign) return <div>Campaign not available</div>;
 *
 *   return (
 *     <div>
 *       <h1>{campaign.metadata.name}</h1>
 *       <p>Claims: {campaign.state.claimsCount.toString()}</p>
 *       <p>Status: {campaign.state.isPaused ? 'Paused' : 'Active'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAirdrop(): UseAirdropReturn {
  const chainId = useChainId();
  const distributorAddress = getDistributorContract(chainId as ChainId);

  // Read multiple contract values in parallel
  const adminQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "admin",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const cancelableQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "cancelable",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const claimsCountQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "claimsCount",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const lockupLinearQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "LOCKUP_LINEAR",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const merkleRootQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "MERKLE_ROOT",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const pausedQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "paused",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const tokenQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "TOKEN",
    query: {
      enabled: !!distributorAddress,
    },
  });

  const transferableQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "transferable",
    query: {
      enabled: !!distributorAddress,
    },
  });

  // Combine all contract data using React Query
  const campaignQuery = useQuery({
    enabled:
      !!distributorAddress &&
      adminQuery.isSuccess &&
      cancelableQuery.isSuccess &&
      claimsCountQuery.isSuccess &&
      lockupLinearQuery.isSuccess &&
      merkleRootQuery.isSuccess &&
      pausedQuery.isSuccess &&
      tokenQuery.isSuccess &&
      transferableQuery.isSuccess,
    queryFn: (): CampaignDetails => {
      if (!distributorAddress) throw new Error("No distributor contract for current chain");
      if (!adminQuery.data) throw new Error("Failed to fetch admin");
      if (!lockupLinearQuery.data) throw new Error("Failed to fetch lockup linear address");
      if (!merkleRootQuery.data) throw new Error("Failed to fetch merkle root");
      if (!tokenQuery.data) throw new Error("Failed to fetch token address");
      if (cancelableQuery.data === undefined) throw new Error("Failed to fetch cancelable status");
      if (transferableQuery.data === undefined)
        throw new Error("Failed to fetch transferable status");
      if (pausedQuery.data === undefined) throw new Error("Failed to fetch paused status");
      if (!claimsCountQuery.data) throw new Error("Failed to fetch claims count");

      const chainContracts = sapienAirdropCampaign.contracts[chainId as ChainId];
      if (!chainContracts) throw new Error(`Unsupported chain: ${chainId}`);

      return {
        contracts: {
          distributor: distributorAddress,
          lockupLinear: lockupLinearQuery.data,
          token: tokenQuery.data,
        },
        metadata: {
          description: sapienAirdropCampaign.description,
          id: sapienAirdropCampaign.id,
          name: sapienAirdropCampaign.name,
          websiteUrl: sapienAirdropCampaign.websiteUrl,
        },
        state: {
          admin: adminQuery.data,
          cancelable: cancelableQuery.data,
          claimsCount: claimsCountQuery.data,
          isActive: sapienAirdropCampaign.isActive,
          isPaused: pausedQuery.data,
          merkleRoot: merkleRootQuery.data,
          transferable: transferableQuery.data,
        },
        tokenInfo: {
          address: tokenQuery.data,
          decimals: sapienAirdropCampaign.token.decimals,
          logoUrl: sapienAirdropCampaign.token.logoUrl,
          name: sapienAirdropCampaign.token.name,
          symbol: sapienAirdropCampaign.token.symbol,
        },
      };
    },
    queryKey: ["airdrop", "campaign", chainId, distributorAddress],
    staleTime: 30_000, // 30 seconds
  });

  // Determine loading state
  const isLoading =
    adminQuery.isLoading ||
    cancelableQuery.isLoading ||
    claimsCountQuery.isLoading ||
    lockupLinearQuery.isLoading ||
    merkleRootQuery.isLoading ||
    pausedQuery.isLoading ||
    tokenQuery.isLoading ||
    transferableQuery.isLoading ||
    campaignQuery.isLoading;

  // Collect any errors
  const error =
    adminQuery.error ||
    cancelableQuery.error ||
    claimsCountQuery.error ||
    lockupLinearQuery.error ||
    merkleRootQuery.error ||
    pausedQuery.error ||
    tokenQuery.error ||
    transferableQuery.error ||
    campaignQuery.error ||
    (!distributorAddress ? new Error(`Chain ${chainId} not supported`) : null);

  // Refetch function
  const refetch = () => {
    adminQuery.refetch();
    cancelableQuery.refetch();
    claimsCountQuery.refetch();
    lockupLinearQuery.refetch();
    merkleRootQuery.refetch();
    pausedQuery.refetch();
    tokenQuery.refetch();
    transferableQuery.refetch();
    campaignQuery.refetch();
  };

  return {
    campaign: campaignQuery.data,
    error,
    isLoading,
    isSuccess: campaignQuery.isSuccess && !!campaignQuery.data,
    refetch,
  };
}
