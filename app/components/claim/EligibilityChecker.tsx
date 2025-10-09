"use client";

import { useId, useState } from "react";
import { tv } from "tailwind-variants";
import type { Address } from "viem";
import { formatUnits, isAddress } from "viem";
import { useEligibility } from "../../hooks/useEligibility";
import { defaultCampaignConfig } from "../../lib/config/campaign";
import { Button } from "../ui/button";

const eligibilityVariants = tv({
  slots: {
    container: "w-full max-w-2xl mx-auto space-y-6",
    errorMessage: "text-sm text-red-600 dark:text-red-400",
    input:
      "flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    inputContainer: "flex gap-2",
    inputWrapper: "space-y-2",
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
    loadingSpinner:
      "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
    resultCard: "p-6 rounded-lg border",
    resultDetails: "space-y-3",
    resultLabel: "text-sm text-gray-600 dark:text-gray-400",
    resultRow: "flex justify-between items-center",
    resultTitle: "text-lg font-semibold mb-4",
    resultValue: "text-sm font-medium text-gray-900 dark:text-gray-100",
  },
  variants: {
    eligible: {
      false: {
        resultCard: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
        resultTitle: "text-red-900 dark:text-red-100",
      },
      true: {
        resultCard: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
        resultTitle: "text-green-900 dark:text-green-100",
      },
    },
  },
});

const styles = eligibilityVariants();

/**
 * EligibilityChecker Component
 *
 * Allows users to check if an address is eligible for the airdrop campaign.
 * Features:
 * - Address input with validation
 * - Real-time eligibility checking
 * - Display of allocation amount and index
 * - Error handling for invalid addresses
 * - Responsive design
 *
 * @example
 * ```tsx
 * <EligibilityChecker />
 * ```
 */
export function EligibilityChecker() {
  const inputId = useId();
  const [inputAddress, setInputAddress] = useState<string>("");
  const [addressToCheck, setAddressToCheck] = useState<Address | undefined>(undefined);

  const eligibility = useEligibility(addressToCheck);

  const handleCheck = () => {
    // Validate address before checking
    if (!inputAddress) {
      return;
    }

    if (!isAddress(inputAddress)) {
      return;
    }

    setAddressToCheck(inputAddress as Address);
  };

  const handleInputChange = (value: string) => {
    setInputAddress(value);
    // Clear previous check result when input changes
    if (addressToCheck) {
      setAddressToCheck(undefined);
    }
  };

  const isValidAddress = inputAddress ? isAddress(inputAddress) : true;
  const hasChecked = addressToCheck !== undefined;

  return (
    <div className={styles.container()}>
      <div className={styles.inputWrapper()}>
        <label htmlFor={inputId} className={styles.label()}>
          Enter Address to Check Eligibility
        </label>
        <div className={styles.inputContainer()}>
          <input
            id={inputId}
            type="text"
            placeholder="0x..."
            value={inputAddress}
            onChange={(e) => handleInputChange(e.target.value)}
            className={styles.input()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValidAddress && inputAddress) {
                handleCheck();
              }
            }}
          />
          <Button
            onClick={handleCheck}
            disabled={!inputAddress || !isValidAddress || eligibility.isLoading}
            variant="primary"
            size="md"
          >
            {eligibility.isLoading ? (
              <span className={styles.loadingSpinner()} />
            ) : (
              "Check Eligibility"
            )}
          </Button>
        </div>
        {!isValidAddress && inputAddress && (
          <p className={styles.errorMessage()}>Please enter a valid Ethereum address</p>
        )}
      </div>

      {/* Loading State */}
      {eligibility.isLoading && hasChecked && (
        <div className={styles.resultCard({ eligible: false })}>
          <div className="flex items-center justify-center gap-3 py-4">
            <span className={styles.loadingSpinner()} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Checking eligibility...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {eligibility.error && hasChecked && !eligibility.isLoading && (
        <div className={styles.resultCard({ eligible: false })}>
          <h3 className={styles.resultTitle()}>Error</h3>
          <p className="text-sm text-red-600 dark:text-red-400">{eligibility.error}</p>
        </div>
      )}

      {/* Eligible State */}
      {eligibility.data?.eligible && hasChecked && !eligibility.isLoading && (
        <div className={styles.resultCard({ eligible: true })}>
          <h3 className={styles.resultTitle()}>Eligible for Airdrop! 🎉</h3>
          <div className={styles.resultDetails()}>
            <div className={styles.resultRow()}>
              <span className={styles.resultLabel()}>Address</span>
              <span className={styles.resultValue()}>
                {addressToCheck?.slice(0, 6)}...{addressToCheck?.slice(-4)}
              </span>
            </div>
            <div className={styles.resultRow()}>
              <span className={styles.resultLabel()}>Allocation</span>
              <span className={styles.resultValue()}>
                {eligibility.data.amount
                  ? `${formatUnits(eligibility.data.amount, defaultCampaignConfig.tokenDecimals)} ${defaultCampaignConfig.tokenSymbol}`
                  : "Unknown"}
              </span>
            </div>
            <div className={styles.resultRow()}>
              <span className={styles.resultLabel()}>Index</span>
              <span className={styles.resultValue()}>{eligibility.data.index}</span>
            </div>
            <div className={styles.resultRow()}>
              <span className={styles.resultLabel()}>Proof Length</span>
              <span className={styles.resultValue()}>{eligibility.data.proof?.length} hashes</span>
            </div>
          </div>
        </div>
      )}

      {/* Not Eligible State */}
      {eligibility.data?.eligible === false &&
        hasChecked &&
        !eligibility.isLoading &&
        !eligibility.error && (
          <div className={styles.resultCard({ eligible: false })}>
            <h3 className={styles.resultTitle()}>Not Eligible</h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              This address is not eligible for the {defaultCampaignConfig.campaignName} airdrop.
            </p>
          </div>
        )}
    </div>
  );
}
