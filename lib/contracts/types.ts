import type { Address, Hash } from "viem";

// Base contract types shared across all Sablier Merkle contracts
export interface BaseContractInfo {
  address: Address;
  admin: Address;
  campaignName: string;
  expiration: number;
  factory: Address;
  fee: bigint;
  hasExpired: boolean;
  ipfsCID: string;
  merkleRoot: Hash;
  shape: string;
  token: Address;
}

// Claim parameters for all contract types
export interface ClaimParams {
  amount: bigint;
  index: bigint;
  merkleProof: Hash[];
  recipient: Address;
}

// Instant contract specific types
export interface SablierMerkleInstantInfo extends BaseContractInfo {
  type: "instant";
  firstClaimTime?: number;
}

// Lockup Linear contract specific types
export interface LockupLinearSchedule {
  cliffDuration: number;
  cliffPercentage: bigint;
  startPercentage: bigint;
  startTime: number;
  totalDuration: number;
}

export interface SablierMerkleLLInfo extends BaseContractInfo {
  cancelable: boolean;
  firstClaimTime?: number;
  lockup: Address;
  schedule: LockupLinearSchedule;
  transferable: boolean;
  type: "lockup-linear";
}

// Lockup Tranched contract specific types
export interface TrancheWithPercentage {
  duration: number;
  unlockPercentage: bigint;
}

export interface SablierMerkleLTInfo extends BaseContractInfo {
  cancelable: boolean;
  firstClaimTime?: number;
  lockup: Address;
  streamStartTime: number;
  totalPercentage: bigint;
  tranchesWithPercentages: TrancheWithPercentage[];
  transferable: boolean;
  type: "lockup-tranched";
}

// Union type for all contract info
export type SablierMerkleContractInfo =
  | SablierMerkleInstantInfo
  | SablierMerkleLLInfo
  | SablierMerkleLTInfo;

// Contract interaction results
export interface ClaimResult {
  hash: Hash;
  streamId?: bigint; // Only for LL and LT contracts
}

export interface ClawbackResult {
  hash: Hash;
}

export interface FeeCollectionResult {
  feeAmount: bigint;
  hash: Hash;
}

// Error types specific to Sablier contracts
export interface SablierContractError {
  code: string;
  message: string;
  type:
    | "CAMPAIGN_EXPIRED"
    | "ALREADY_CLAIMED"
    | "INVALID_PROOF"
    | "INSUFFICIENT_FEE"
    | "ACCESS_DENIED"
    | "UNKNOWN";
}

// Gas estimation types
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface ClaimGasEstimate extends GasEstimate {
  totalCost: bigint; // Including fees
}

// Contract method parameters
export interface ClawbackParams {
  amount: bigint;
  to: Address;
}

export interface TransferAdminParams {
  newAdmin: Address;
}

export interface CollectFeesParams {
  factoryAdmin: Address;
}

// Event types
export interface ClaimEvent {
  amount: bigint;
  index: bigint;
  recipient: Address;
  streamId?: bigint; // Only for LL and LT
}

export interface ClawbackEvent {
  admin: Address;
  amount: bigint;
  to: Address;
}

export interface TransferAdminEvent {
  newAdmin: Address;
  oldAdmin: Address;
}

// Hook return types
export interface UseClaimReturn {
  claim: (params: ClaimParams) => Promise<ClaimResult>;
  error: SablierContractError | null;
  isLoading: boolean;
  reset: () => void;
}

export interface UseEligibilityReturn {
  amount: bigint | null;
  error: Error | null;
  hasClaimed: boolean;
  index: bigint | null;
  isEligible: boolean;
  isLoading: boolean;
  proof: Hash[] | null;
}

export interface UseContractInfoReturn<T extends SablierMerkleContractInfo> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}
