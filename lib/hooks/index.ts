/**
 * @fileoverview Comprehensive React hooks for Web3 airdrop contract interactions
 *
 * This module provides hooks for:
 * - Campaign details and contract state management
 * - Merkle proof generation and validation
 * - User eligibility checking and verification
 * - Transaction execution for claims
 * - Token information and amount formatting
 *
 * All hooks use wagmi + viem for Web3 operations and TanStack Query for caching.
 */

// Main airdrop contract interaction
export {
  type CampaignDetails,
  type UseAirdropReturn,
  useAirdrop,
} from "./useAirdrop";
// Claim execution
export {
  type ClaimTransaction,
  type ClaimTransactionState,
  type UseClaimReturn,
  useBatchClaim,
  useClaim,
} from "./useClaim";

// User eligibility checking
export {
  type EligibilityInfo,
  type EligibilityStatus,
  type UseEligibilityReturn,
  useEligibility,
} from "./useEligibility";
// Merkle root management
export {
  type UseMerkleRootReturn,
  useMerkleRoot,
  validateMerkleRoot,
} from "./useMerkleRoot";

// Token information
export {
  type TokenInfo,
  type UseTokenInfoReturn,
  useTokenCalculations,
  useTokenInfo,
} from "./useTokenInfo";
