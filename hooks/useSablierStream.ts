import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";
import type { LockupLinearSchedule, TrancheWithPercentage } from "../lib/contracts";
import { SablierMerkleLLContract, SablierMerkleLTContract } from "../lib/contracts";

type StreamStatus = {
  status: "pending" | "streaming" | "settled" | "canceled" | "depleted";
  streamedAmount: bigint;
  refundedAmount: bigint;
  withdrawableAmount: bigint;
  remainingAmount: bigint;
};

type LinearStreamData = StreamStatus & {
  schedule: LockupLinearSchedule;
  cliffReached: boolean;
  vestingEndTime: number;
  currentVestingPercentage: number;
};

type TranchedStreamData = StreamStatus & {
  tranches: TrancheWithPercentage[];
  currentTranche: number;
  nextUnlockTime: number | null;
  unlockedTranches: number;
  trancheTimeline: Array<{
    index: number;
    unlockTime: number;
    unlockPercentage: bigint;
    isUnlocked: boolean;
  }>;
};

type UseSablierStreamParams = {
  contractAddress: Address;
  streamId: bigint;
  contractType: "lockup-linear" | "lockup-tranched";
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
  enabled?: boolean;
};

type UseSablierStreamReturn = {
  streamData: LinearStreamData | TranchedStreamData | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  isLinear: boolean;
  isTranched: boolean;
};

/**
 * Hook to monitor Sablier stream status and data
 */
export function useSablierStream({
  contractAddress,
  streamId,
  contractType,
  autoRefresh = true,
  refreshInterval = 30,
  enabled = true,
}: UseSablierStreamParams): UseSablierStreamReturn {
  const publicClient = usePublicClient();

  const [streamData, setStreamData] = useState<LinearStreamData | TranchedStreamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isLinear = contractType === "lockup-linear";
  const isTranched = contractType === "lockup-tranched";

  const loadStreamData = useCallback(async () => {
    if (!enabled || !publicClient || streamId === 0n) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isLinear) {
        const contract = new SablierMerkleLLContract(contractAddress, publicClient);

        // Get basic stream status from lockup contract
        // This is a simplified implementation - would need actual Sablier Lockup integration
        const streamStatus = await contract.getStreamStatus(streamId);
        const schedule = await contract.getSchedule();

        const currentTime = Math.floor(Date.now() / 1000);
        const vestingStartTime = schedule.startTime;
        const vestingEndTime = vestingStartTime + schedule.totalDuration;
        const cliffTime = vestingStartTime + schedule.cliffDuration;

        const cliffReached = currentTime >= cliffTime;
        const isActive = currentTime >= vestingStartTime && currentTime < vestingEndTime;

        // Calculate current vesting percentage
        let currentVestingPercentage = 0;
        if (cliffReached && isActive) {
          const timeElapsed = currentTime - vestingStartTime;
          const totalDuration = schedule.totalDuration;
          currentVestingPercentage = Math.min((timeElapsed / totalDuration) * 100, 100);
        } else if (currentTime >= vestingEndTime) {
          currentVestingPercentage = 100;
        }

        const linearData: LinearStreamData = {
          ...streamStatus,
          cliffReached,
          currentVestingPercentage,
          remainingAmount: streamStatus.streamedAmount, // Placeholder
          schedule,
          vestingEndTime,
          withdrawableAmount: 0n,
        };

        setStreamData(linearData);
      } else if (isTranched) {
        const contract = new SablierMerkleLTContract(contractAddress, publicClient);

        const streamStatus = await contract.getStreamStatus(streamId);
        const tranches = await contract.getTranchesWithPercentages();
        const streamStartTime = await contract.getStreamStartTime();
        const trancheTimeline = await contract.getTrancheTimeline(streamStartTime);

        const _currentTime = Math.floor(Date.now() / 1000);
        const unlockedTranches = trancheTimeline.filter((t) => t.isActive).length;
        const currentTranche = Math.max(0, unlockedTranches - 1);
        const nextTranche = trancheTimeline.find((t) => !t.isActive);

        const tranchedData: TranchedStreamData = {
          ...streamStatus,
          currentTranche,
          nextUnlockTime: nextTranche?.unlockTime || null,
          remainingAmount: streamStatus.streamedAmount,
          tranches,
          trancheTimeline: trancheTimeline.map((t) => ({
            index: t.index,
            isUnlocked: t.isActive,
            unlockPercentage: t.unlockPercentage,
            unlockTime: t.unlockTime,
          })),
          unlockedTranches,
          withdrawableAmount: 0n,
        };

        setStreamData(tranchedData);
      }

      setLastUpdated(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load stream data");
      setError(error);
      setStreamData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, publicClient, streamId, contractAddress, isLinear, isTranched]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    // Initial load
    loadStreamData().catch((err) => console.error("Failed to load stream data:", err));

    // Set up interval
    const interval = setInterval(() => {
      loadStreamData().catch((err) => console.error("Failed to refresh stream data:", err));
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [loadStreamData, autoRefresh, refreshInterval]);

  // Manual load if not auto-refreshing
  useEffect(() => {
    if (!autoRefresh) {
      loadStreamData().catch((err) => console.error("Failed to load stream data:", err));
    }
  }, [loadStreamData, autoRefresh]);

  return {
    error,
    isLinear,
    isLoading,
    isTranched,
    lastUpdated,
    refresh: loadStreamData,
    streamData,
  };
}

/**
 * Hook to monitor multiple streams
 */
export function useMultipleSablierStreams(
  streams: Array<{
    contractAddress: Address;
    streamId: bigint;
    contractType: "lockup-linear" | "lockup-tranched";
  }>,
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enabled?: boolean;
  } = {},
) {
  const { autoRefresh = true, refreshInterval = 30, enabled = true } = options;

  const [streamsData, setStreamsData] = useState<
    Record<string, LinearStreamData | TranchedStreamData>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAllStreams = useCallback(async () => {
    if (!enabled || streams.length === 0) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    const newStreamsData: Record<string, LinearStreamData | TranchedStreamData> = {};
    const newErrors: Record<string, Error> = {};

    await Promise.allSettled(
      streams.map(async (stream) => {
        const key = `${stream.contractAddress}-${stream.streamId}`;

        try {
          // This would use the individual stream hook logic
          // Simplified for demonstration
          const mockData: LinearStreamData = {
            cliffReached: true,
            currentVestingPercentage: 50,
            refundedAmount: 0n,
            remainingAmount: 1000000000000000000n, // 1 token
            schedule: {
              cliffDuration: 0,
              cliffPercentage: 0n,
              startPercentage: 0n,
              startTime: Math.floor(Date.now() / 1000),
              totalDuration: 86400, // 1 day
            },
            status: "streaming",
            streamedAmount: 0n,
            vestingEndTime: Math.floor(Date.now() / 1000) + 86400,
            withdrawableAmount: 0n,
          };

          newStreamsData[key] = mockData;
        } catch (err) {
          newErrors[key] = err instanceof Error ? err : new Error("Failed to load stream");
        }
      }),
    );

    setStreamsData(newStreamsData);
    setErrors(newErrors);
    setLastUpdated(new Date());
    setIsLoading(false);
  }, [enabled, streams]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    loadAllStreams().catch((err) => console.error("Failed to load streams:", err));
    const interval = setInterval(() => {
      loadAllStreams().catch((err) => console.error("Failed to refresh streams:", err));
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [loadAllStreams, autoRefresh, refreshInterval]);

  useEffect(() => {
    if (!autoRefresh) {
      loadAllStreams().catch((err) => console.error("Failed to load streams:", err));
    }
  }, [loadAllStreams, autoRefresh]);

  const getTotalStreamed = useCallback(() => {
    return Object.values(streamsData).reduce((total, stream) => total + stream.streamedAmount, 0n);
  }, [streamsData]);

  const getActiveStreams = useCallback(() => {
    return Object.values(streamsData).filter(
      (stream) => stream.status === "streaming" || stream.status === "pending",
    );
  }, [streamsData]);

  return {
    activeStreams: getActiveStreams(),
    errors,
    failedStreams: Object.keys(errors).length,
    isLoading,
    lastUpdated,
    loadedStreams: Object.keys(streamsData).length,
    refresh: loadAllStreams,
    streamsData,
    totalStreamed: getTotalStreamed(),
    totalStreams: streams.length,
  };
}
