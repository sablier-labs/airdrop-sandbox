/**
 * Centralized exports for all custom hooks
 */

// Proof hooks
export { useAirdropProof, useAirdropProofForAddress } from "./useAirdropProof";
// Claim transaction hooks
export { useClaimAirdrop } from "./useClaimAirdrop";
// Utility hooks
export { useClaimableAmount } from "./useClaimableAmount";

// Eligibility and status hooks
export { useClaimFee } from "./useClaimFee";
export { useClaimStatus } from "./useClaimStatus";
export { useClaimWithFee } from "./useClaimWithFee";
export { useSimulateClaim } from "./useSimulateClaim";
