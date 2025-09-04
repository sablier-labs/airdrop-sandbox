import toast from "react-hot-toast";

/**
 * Toast notification utilities using react-hot-toast
 */

export const showToast = {
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  error: (message: string, options?: { duration?: number }) => {
    return toast.error(message, {
      duration: options?.duration ?? 5000,
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff",
      },
      position: "bottom-right",
      style: {
        backdropFilter: "blur(12px)",
        background: "rgba(26, 26, 26, 0.95)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "12px",
        color: "#ededed",
      },
    });
  },

  info: (message: string, options?: { duration?: number }) => {
    return toast(message, {
      duration: options?.duration ?? 4000,
      icon: "ℹ️",
      position: "bottom-right",
      style: {
        backdropFilter: "blur(12px)",
        background: "rgba(26, 26, 26, 0.95)",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: "12px",
        color: "#ededed",
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "bottom-right",
      style: {
        backdropFilter: "blur(12px)",
        background: "rgba(26, 26, 26, 0.95)",
        border: "1px solid rgba(124, 58, 237, 0.3)",
        borderRadius: "12px",
        color: "#ededed",
      },
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: { duration?: number },
  ) => {
    return toast.promise(promise, messages, {
      error: {
        duration: options?.duration ?? 5000,
        iconTheme: {
          primary: "#ef4444",
          secondary: "#ffffff",
        },
        style: {
          backdropFilter: "blur(12px)",
          background: "rgba(26, 26, 26, 0.95)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px",
          color: "#ededed",
        },
      },
      loading: {
        style: {
          backdropFilter: "blur(12px)",
          background: "rgba(26, 26, 26, 0.95)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          borderRadius: "12px",
          color: "#ededed",
        },
      },
      position: "bottom-right",
      success: {
        duration: options?.duration ?? 4000,
        iconTheme: {
          primary: "#22c55e",
          secondary: "#ffffff",
        },
        style: {
          backdropFilter: "blur(12px)",
          background: "rgba(26, 26, 26, 0.95)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          borderRadius: "12px",
          color: "#ededed",
        },
      },
    });
  },
  success: (message: string, options?: { duration?: number }) => {
    return toast.success(message, {
      duration: options?.duration ?? 4000,
      iconTheme: {
        primary: "#22c55e",
        secondary: "#ffffff",
      },
      position: "bottom-right",
      style: {
        backdropFilter: "blur(12px)",
        background: "rgba(26, 26, 26, 0.95)",
        border: "1px solid rgba(124, 58, 237, 0.3)",
        borderRadius: "12px",
        color: "#ededed",
      },
    });
  },
};

/**
 * Wallet connection toast messages
 */
export const walletToasts = {
  connected: (address: string) =>
    showToast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`),
  connecting: () => showToast.loading("Connecting wallet..."),
  connectionError: (error?: string) => showToast.error(error ?? "Failed to connect wallet"),
  disconnected: () => showToast.info("Wallet disconnected"),
  networkSwitched: (networkName: string) => showToast.success(`Switched to ${networkName}`),
  switchNetwork: (networkName: string) => showToast.loading(`Switching to ${networkName}...`),
};

/**
 * Claim process toast messages
 */
export const claimToasts = {
  checkingEligibility: () => showToast.loading("Checking eligibility..."),
  claimError: (error?: string) => showToast.error(error ?? "Failed to claim tokens"),
  claimed: (txHash: string) =>
    showToast.success(`Tokens claimed successfully! TX: ${txHash.slice(0, 10)}...`),
  claiming: () => showToast.loading("Claiming tokens..."),
  copiedAddress: () => showToast.success("Address copied to clipboard!"),
  copiedLink: () => showToast.success("Link copied to clipboard!"),
  eligible: (amount: string, symbol: string) =>
    showToast.success(`You're eligible for ${amount} ${symbol}!`),
  notEligible: () => showToast.error("This address is not eligible for the airdrop"),
};
