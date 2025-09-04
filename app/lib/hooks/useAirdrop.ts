import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import { getAirdropConfig } from "@/app/lib/config/airdrop";
import { sablierMerkleAbi } from "@/app/lib/contracts/abi";

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

  // Get distributor address from config
  const configQuery = useQuery({
    queryFn: async () => {
      const config = await getAirdropConfig();
      return {
        campaignDescription: config.campaign.description,
        campaignName: config.campaign.name,
        distributorAddress: config.contracts.airdropAddress,
        merkleRoot: config.contracts.merkleRoot,
        tokenAddress: config.contracts.tokenAddress,
        tokenDecimals: config.token.decimals,
        tokenSymbol: config.token.symbol,
      };
    },
    queryKey: ["airdrop", "config"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const distributorAddress = configQuery.data?.distributorAddress;

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
    functionName: "STREAM_CANCELABLE",
    query: {
      enabled: !!distributorAddress,
    },
  });

  // Note: claimsCount function doesn't exist in new ABI
  // We'll use a default value of 0 for now

  const lockupQuery = useReadContract({
    abi: sablierMerkleAbi,
    address: distributorAddress,
    functionName: "LOCKUP",
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

  // Note: paused() function doesn't exist in new ABI
  // Campaign status is determined by expiration date only

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
    functionName: "STREAM_TRANSFERABLE",
    query: {
      enabled: !!distributorAddress,
    },
  });

  // Combine all contract data using React Query
  const campaignQuery = useQuery({
    enabled:
      !!configQuery.data &&
      !!distributorAddress &&
      adminQuery.isSuccess &&
      cancelableQuery.isSuccess &&
      lockupQuery.isSuccess &&
      merkleRootQuery.isSuccess &&
      tokenQuery.isSuccess &&
      transferableQuery.isSuccess,
    queryFn: (): CampaignDetails => {
      if (!configQuery.data) throw new Error("Configuration not loaded");
      if (!distributorAddress) throw new Error("No distributor contract for current chain");
      if (!adminQuery.data) throw new Error("Failed to fetch admin");
      if (!lockupQuery.data) throw new Error("Failed to fetch lockup address");
      if (!merkleRootQuery.data) throw new Error("Failed to fetch merkle root");
      if (!tokenQuery.data) throw new Error("Failed to fetch token address");
      if (cancelableQuery.data === undefined) throw new Error("Failed to fetch cancelable status");
      if (transferableQuery.data === undefined)
        throw new Error("Failed to fetch transferable status");
      // Note: paused status and claims count are not available in new contract

      const config = configQuery.data;

      return {
        contracts: {
          distributor: distributorAddress,
          lockupLinear: lockupQuery.data,
          token: tokenQuery.data,
        },
        metadata: {
          description: config.campaignDescription,
          id: "airdrop-campaign", // Simple static ID
          name: config.campaignName,
          websiteUrl: undefined, // Not in new config structure
        },
        state: {
          admin: adminQuery.data,
          cancelable: cancelableQuery.data,
          claimsCount: 0n, // Not available in new contract
          isActive: true, // Determined by timeline in new system
          isPaused: false, // Not available in new contract
          merkleRoot: merkleRootQuery.data,
          transferable: transferableQuery.data,
        },
        tokenInfo: {
          address: tokenQuery.data,
          decimals: config.tokenDecimals,
          logoUrl: undefined, // Not in new config structure
          name: config.tokenSymbol, // Use symbol as name for now
          symbol: config.tokenSymbol,
        },
      };
    },
    queryKey: ["airdrop", "campaign", chainId, distributorAddress],
    staleTime: 30_000, // 30 seconds
  });

  // Determine loading state
  const isLoading =
    configQuery.isLoading ||
    adminQuery.isLoading ||
    cancelableQuery.isLoading ||
    lockupQuery.isLoading ||
    merkleRootQuery.isLoading ||
    tokenQuery.isLoading ||
    transferableQuery.isLoading ||
    campaignQuery.isLoading;

  // Collect any errors
  const error =
    configQuery.error ||
    adminQuery.error ||
    cancelableQuery.error ||
    lockupQuery.error ||
    merkleRootQuery.error ||
    tokenQuery.error ||
    transferableQuery.error ||
    campaignQuery.error ||
    (!distributorAddress ? new Error(`Chain ${chainId} not supported`) : null);

  // Refetch function
  const refetch = () => {
    configQuery.refetch();
    adminQuery.refetch();
    cancelableQuery.refetch();
    lockupQuery.refetch();
    merkleRootQuery.refetch();
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
