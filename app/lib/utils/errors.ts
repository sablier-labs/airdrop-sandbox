import type { BaseError, ContractFunctionRevertedError } from "viem";

/** Known Sablier Airdrops v3.0 revert error messages */
const REVERT_MESSAGES: Record<string, string> = {
  SablierMerkleBase_CampaignExpired: "This campaign has expired.",
  SablierMerkleBase_CampaignNotStarted: "This campaign has not started yet.",
  SablierMerkleBase_IndexClaimed: "You have already claimed this airdrop",
  SablierMerkleBase_InsufficientFeePayment:
    "Insufficient claim fee. Please ensure you have enough ETH.",
  SablierMerkleBase_InvalidProof: "Invalid claim proof. Please contact support.",
  SablierMerkleBase_UnsupportedClaimType: "This claim method is not supported for this campaign.",
};

/** Top-level error name to user-facing message */
const ERROR_MESSAGES: Record<string, string> = {
  HttpRequestError: "Network error. Please try again.",
  InsufficientFundsError: "Insufficient funds to pay gas fees",
  UserRejectedRequestError: "Transaction rejected by user",
};

/**
 * Decodes and formats contract errors into user-friendly messages
 */
export function handleContractError(error: BaseError): string {
  if (error.name === "ContractFunctionRevertedError") {
    const revertError = error as ContractFunctionRevertedError;
    const errorName = revertError.data?.errorName;
    if (errorName && errorName in REVERT_MESSAGES) {
      return REVERT_MESSAGES[errorName];
    }
    return revertError.shortMessage || "Transaction reverted";
  }

  return (
    ERROR_MESSAGES[error.name] ?? error.shortMessage ?? error.message ?? "An unknown error occurred"
  );
}

/**
 * Sanitizes Merkle proof array from unknown source
 */
export function sanitizeProof(proof: unknown): `0x${string}`[] {
  if (!Array.isArray(proof)) {
    throw new Error("Proof must be an array");
  }

  return proof.map((p, index) => {
    if (typeof p !== "string" || !/^0x[a-fA-F0-9]{64}$/.test(p)) {
      throw new Error(`Invalid proof element at index ${index}`);
    }
    return p as `0x${string}`;
  });
}
