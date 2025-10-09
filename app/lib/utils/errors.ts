import type { BaseError, ContractFunctionRevertedError } from "viem";

/**
 * Decodes and formats contract errors into user-friendly messages
 */
export function handleContractError(error: BaseError): string {
  // Handle contract revert errors
  if (error.name === "ContractFunctionRevertedError") {
    const revertError = error as ContractFunctionRevertedError;

    // Handle known Sablier errors
    if (revertError.data?.errorName === "AlreadyClaimed") {
      return "You have already claimed this airdrop";
    }
    if (revertError.data?.errorName === "InvalidProof") {
      return "Invalid claim proof. Please contact support.";
    }
    if (revertError.data?.errorName === "InsufficientClaimFee") {
      return "Insufficient claim fee. Please ensure you have enough ETH.";
    }

    return revertError.shortMessage || "Transaction reverted";
  }

  // Handle user rejection
  if (error.name === "UserRejectedRequestError") {
    return "Transaction rejected by user";
  }

  // Handle insufficient funds
  if (error.name === "InsufficientFundsError") {
    return "Insufficient funds to pay gas fees";
  }

  // Handle RPC errors
  if (error.name === "HttpRequestError") {
    return "Network error. Please try again.";
  }

  // Default error message
  return error.shortMessage || error.message || "An unknown error occurred";
}

/**
 * Sanitizes Merkle proof array from unknown source
 */
export function sanitizeProof(proof: unknown): `0x${string}`[] {
  if (!Array.isArray(proof)) {
    throw new Error("Proof must be an array");
  }

  return proof.map((p, index) => {
    if (typeof p !== "string" || !p.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new Error(`Invalid proof element at index ${index}`);
    }
    return p as `0x${string}`;
  });
}
