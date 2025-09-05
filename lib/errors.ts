import type { SablierContractError } from "./contracts/types";

/**
 * Error severity levels
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * Type guard for errors with code property
 */
type ErrorWithCode = {
  code: string;
  message?: string;
};

/**
 * Enhanced error interface with user-friendly messages and actions
 */
export interface SablierError extends SablierContractError {
  severity: ErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  suggestedActions: string[];
  retryable: boolean;
  category: "network" | "contract" | "user" | "system";
}

/**
 * Error code mappings with user-friendly information
 */
const ERROR_MAPPINGS: Record<string, Omit<SablierError, "code" | "message">> = {
  ACCESS_DENIED: {
    category: "user",
    retryable: false,
    severity: "critical",
    suggestedActions: [
      "Ensure you're using the correct admin wallet",
      "Contact the contract admin if you believe this is an error",
    ],
    technicalMessage: "Admin privileges required for this operation",
    type: "ACCESS_DENIED",
    userMessage: "Access denied",
  },
  ALREADY_CLAIMED: {
    category: "user",
    retryable: false,
    severity: "medium",
    suggestedActions: [
      "Check your transaction history to see when you claimed",
      "If this is a streaming claim, monitor your stream status",
    ],
    technicalMessage: "Stream has already been claimed for this index",
    type: "ALREADY_CLAIMED",
    userMessage: "You have already claimed this airdrop",
  },
  CAMPAIGN_EXPIRED: {
    category: "contract",
    retryable: false,
    severity: "high",
    suggestedActions: [
      "Contact the project team for information about future campaigns",
      "Check if there are any active campaigns available",
    ],
    technicalMessage: "Campaign expiration time has passed",
    type: "CAMPAIGN_EXPIRED",
    userMessage: "This airdrop campaign has expired",
  },
  CONTRACT_NOT_DEPLOYED: {
    category: "contract",
    retryable: false,
    severity: "critical",
    suggestedActions: [
      "Ensure you're connected to the correct network",
      "Contact support to verify the contract address",
    ],
    technicalMessage: "Contract is not deployed on this network",
    type: "UNKNOWN",
    userMessage: "Contract not found",
  },
  INSUFFICIENT_FEE: {
    category: "user",
    retryable: true,
    severity: "medium",
    suggestedActions: [
      "Add more ETH to your wallet for transaction fees",
      "Check the current gas price and adjust accordingly",
    ],
    technicalMessage: "Transaction fee is below the required amount",
    type: "INSUFFICIENT_FEE",
    userMessage: "Insufficient fee payment",
  },
  INSUFFICIENT_GAS: {
    category: "user",
    retryable: true,
    severity: "medium",
    suggestedActions: ["Add more ETH to your wallet", "Try again when network congestion is lower"],
    technicalMessage: "Not enough ETH for gas fees",
    type: "UNKNOWN",
    userMessage: "Insufficient gas",
  },
  INVALID_PROOF: {
    category: "user",
    retryable: true,
    severity: "high",
    suggestedActions: [
      "Refresh the page and try again",
      "Ensure you're using the correct wallet address",
      "Contact support if the problem persists",
    ],
    technicalMessage: "Merkle proof verification failed",
    type: "INVALID_PROOF",
    userMessage: "Invalid proof provided",
  },
  NETWORK_ERROR: {
    category: "network",
    retryable: true,
    severity: "medium",
    suggestedActions: [
      "Check your internet connection",
      "Try switching to a different RPC endpoint",
      "Refresh the page and try again",
    ],
    technicalMessage: "Failed to connect to blockchain network",
    type: "UNKNOWN",
    userMessage: "Network connection error",
  },
  TRANSACTION_REJECTED: {
    category: "user",
    retryable: true,
    severity: "low",
    suggestedActions: ["Try the transaction again", "Approve the transaction in your wallet"],
    technicalMessage: "User rejected the transaction",
    type: "UNKNOWN",
    userMessage: "Transaction cancelled",
  },
  WALLET_NOT_CONNECTED: {
    category: "user",
    retryable: true,
    severity: "high",
    suggestedActions: [
      "Connect your wallet",
      "Ensure MetaMask or other wallet is installed and unlocked",
    ],
    technicalMessage: "No wallet connection detected",
    type: "UNKNOWN",
    userMessage: "Wallet not connected",
  },
};

/**
 * Enhanced error handling class
 */
// biome-ignore lint/complexity/noStaticOnlyClass: it's fine
export class SablierErrorHandler {
  /**
   * Parse and enhance any error into a SablierError
   */
  static parseError(error: unknown, context?: string): SablierError {
    // If it's already a SablierError, return it
    if (SablierErrorHandler.isSablierError(error)) {
      return error;
    }

    // Handle contract errors
    if (SablierErrorHandler.isContractError(error)) {
      return SablierErrorHandler.enhanceContractError(error, context);
    }

    // Handle wallet/user errors
    if (SablierErrorHandler.isWalletError(error)) {
      return SablierErrorHandler.enhanceWalletError(error, context);
    }

    // Handle network errors
    if (SablierErrorHandler.isNetworkError(error)) {
      return SablierErrorHandler.enhanceNetworkError(error, context);
    }

    // Fallback for unknown errors
    return SablierErrorHandler.createUnknownError(error, context);
  }

  /**
   * Get user-friendly error message with suggested actions
   */
  static getErrorDisplay(error: SablierError): {
    title: string;
    message: string;
    actions: string[];
    severity: ErrorSeverity;
    showTechnical: boolean;
  } {
    return {
      actions: error.suggestedActions,
      message: error.userMessage,
      severity: error.severity,
      showTechnical: error.severity === "critical",
      title: SablierErrorHandler.getErrorTitle(error),
    };
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: unknown): boolean {
    const sablierError = SablierErrorHandler.parseError(error);
    return sablierError.retryable;
  }

  /**
   * Get retry delay based on error type
   */
  static getRetryDelay(error: unknown, attemptNumber: number): number {
    const sablierError = SablierErrorHandler.parseError(error);

    if (!sablierError.retryable) {
      return 0;
    }

    // Exponential backoff with jitter
    const baseDelay = sablierError.category === "network" ? 2000 : 1000;
    const delay = baseDelay * 2 ** (attemptNumber - 1);
    const jitter = Math.random() * 1000;

    return Math.min(delay + jitter, 30000); // Max 30 seconds
  }

  private static isSablierError(error: unknown): error is SablierError {
    return typeof error === "object" && error !== null && "code" in error && "userMessage" in error;
  }

  private static isContractError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;

    return (
      "code" in error &&
      typeof (error as ErrorWithCode).code === "string" &&
      ((error as ErrorWithCode).code.startsWith("Sablier") ||
        [
          "CAMPAIGN_EXPIRED",
          "ALREADY_CLAIMED",
          "INVALID_PROOF",
          "INSUFFICIENT_FEE",
          "ACCESS_DENIED",
        ].includes((error as ErrorWithCode).code))
    );
  }

  private static isWalletError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;

    const message = (error as ErrorWithCode).message?.toLowerCase() || "";
    return (
      message.includes("user rejected") ||
      message.includes("user denied") ||
      message.includes("cancelled") ||
      message.includes("insufficient funds") ||
      message.includes("gas")
    );
  }

  private static isNetworkError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;

    const message = (error as ErrorWithCode).message?.toLowerCase() || "";
    return (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("rpc")
    );
  }

  private static enhanceContractError(error: unknown, context?: string): SablierError {
    const errorWithCode = error as ErrorWithCode;
    const code = errorWithCode.code || "UNKNOWN_CONTRACT_ERROR";
    const mapping = ERROR_MAPPINGS[code] || ERROR_MAPPINGS.CONTRACT_NOT_DEPLOYED;

    return {
      code,
      message: errorWithCode.message || "Contract error occurred",
      ...mapping,
      technicalMessage: context
        ? `${mapping.technicalMessage} (Context: ${context})`
        : mapping.technicalMessage,
    };
  }

  private static enhanceWalletError(error: unknown, context?: string): SablierError {
    const errorWithCode = error as ErrorWithCode;
    const message = errorWithCode.message?.toLowerCase() || "";

    if (message.includes("user rejected") || message.includes("cancelled")) {
      return {
        code: "TRANSACTION_REJECTED",
        message: errorWithCode.message || "Transaction rejected",
        ...ERROR_MAPPINGS.TRANSACTION_REJECTED,
      };
    }

    if (message.includes("insufficient") || message.includes("gas")) {
      return {
        code: "INSUFFICIENT_GAS",
        message: errorWithCode.message || "Insufficient gas",
        ...ERROR_MAPPINGS.INSUFFICIENT_GAS,
      };
    }

    return {
      category: "user",
      code: "WALLET_ERROR",
      message: errorWithCode.message || "Wallet error",
      retryable: true,
      severity: "medium",
      suggestedActions: ["Check your wallet connection", "Try the transaction again"],
      technicalMessage: context ? `Wallet error (Context: ${context})` : "Wallet error",
      type: "UNKNOWN",
      userMessage: "Wallet transaction error",
    };
  }

  private static enhanceNetworkError(error: unknown, context?: string): SablierError {
    const errorWithCode = error as ErrorWithCode;
    return {
      code: "NETWORK_ERROR",
      message: errorWithCode.message || "Network error",
      ...ERROR_MAPPINGS.NETWORK_ERROR,
      technicalMessage: context
        ? `${ERROR_MAPPINGS.NETWORK_ERROR.technicalMessage} (Context: ${context})`
        : ERROR_MAPPINGS.NETWORK_ERROR.technicalMessage,
    };
  }

  private static createUnknownError(error: unknown, context?: string): SablierError {
    const message = error instanceof Error ? error.message : "Unknown error occurred";

    return {
      category: "system",
      code: "UNKNOWN_ERROR",
      message,
      retryable: true,
      severity: "medium",
      suggestedActions: ["Try again", "Contact support if the problem persists"],
      technicalMessage: context ? `${message} (Context: ${context})` : message,
      type: "UNKNOWN",
      userMessage: "An unexpected error occurred",
    };
  }

  private static getErrorTitle(error: SablierError): string {
    switch (error.type) {
      case "CAMPAIGN_EXPIRED":
        return "Campaign Expired";
      case "ALREADY_CLAIMED":
        return "Already Claimed";
      case "INVALID_PROOF":
        return "Invalid Proof";
      case "INSUFFICIENT_FEE":
        return "Insufficient Fee";
      case "ACCESS_DENIED":
        return "Access Denied";
      default:
        return "Error";
    }
  }
}

/**
 * Error boundary hook for React components
 */
export function useSablierErrorHandler() {
  const handleError = (error: unknown, context?: string): SablierError => {
    return SablierErrorHandler.parseError(error, context);
  };

  const isRetryable = (error: unknown): boolean => {
    return SablierErrorHandler.isRetryable(error);
  };

  const getRetryDelay = (error: unknown, attemptNumber: number): number => {
    return SablierErrorHandler.getRetryDelay(error, attemptNumber);
  };

  const getErrorDisplay = (error: SablierError) => {
    return SablierErrorHandler.getErrorDisplay(error);
  };

  return {
    getErrorDisplay,
    getRetryDelay,
    handleError,
    isRetryable,
  };
}
