"use client";

import dayjs from "dayjs";
import { tv } from "tailwind-variants";
import { formatUnits } from "viem";
import { useCampaignInfo } from "../../hooks/useCampaignInfo";
import { useTokenInfo } from "../../hooks/useTokenInfo";
import { MOCK_RECIPIENTS } from "../../lib/merkle/data";

const campaignInfoVariants = tv({
  slots: {
    badge: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
    campaignName: "text-2xl font-bold text-gray-900 dark:text-gray-100",
    card: "p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm",
    container: "w-full max-w-4xl mx-auto",
    errorContainer:
      "p-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
    errorMessage: "text-sm text-red-600 dark:text-red-400",
    errorTitle: "font-semibold text-red-900 dark:text-red-100 mb-2",
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    header: "flex items-start justify-between mb-6",
    infoCard: "p-4 rounded-lg bg-gray-50 dark:bg-gray-800",
    infoLabel: "text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1",
    infoSubtext: "text-xs text-gray-600 dark:text-gray-400 mt-1",
    infoValue: "text-lg font-semibold text-gray-900 dark:text-gray-100",
    loadingContainer: "flex items-center justify-center py-12",
    loadingSpinner:
      "inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent",
    logoPlaceholder:
      "h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg",
    titleGroup: "space-y-1",
    titleSection: "flex items-center gap-3",
    tokenSymbol: "text-sm text-gray-600 dark:text-gray-400",
  },
  variants: {
    distributionType: {
      instant: {
        badge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      },
      linear: {
        badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
      },
      tranched: {
        badge: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
      },
    },
  },
});

const styles = campaignInfoVariants();

/**
 * Get the first letter(s) of token symbol for logo placeholder
 */
function getTokenInitials(symbol: string): string {
  return symbol.slice(0, 2).toUpperCase();
}

/**
 * CampaignInfo Component
 *
 * Displays comprehensive information about the airdrop campaign.
 * Features:
 * - Campaign name and token symbol
 * - Token logo placeholder
 * - Total amount allocated
 * - Distribution type badge
 * - Claim fee (formatted)
 * - Expiration date (formatted with dayjs)
 * - Recipients count (from merkle tree)
 * - Card layout with Tailwind
 * - Loading and error states
 * - Responsive design
 *
 * @example
 * ```tsx
 * <CampaignInfo />
 * ```
 */
export function CampaignInfo() {
  const campaignInfo = useCampaignInfo();
  const tokenInfo = useTokenInfo(campaignInfo.tokenAddress);

  // Loading state
  if (campaignInfo.isLoading || tokenInfo.isLoading) {
    return (
      <div className={styles.container()}>
        <div className={styles.card()}>
          <div className={styles.loadingContainer()}>
            <span className={styles.loadingSpinner()} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (campaignInfo.error) {
    return (
      <div className={styles.container()}>
        <div className={styles.errorContainer()}>
          <h3 className={styles.errorTitle()}>Failed to Load Campaign Info</h3>
          <p className={styles.errorMessage()}>
            {campaignInfo.error.message || "An error occurred while loading campaign information."}
          </p>
          <button
            type="button"
            onClick={() => campaignInfo.refetch()}
            className="mt-3 text-sm font-medium text-red-700 dark:text-red-300 hover:underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tokenInfo.error) {
    return (
      <div className={styles.container()}>
        <div className={styles.errorContainer()}>
          <h3 className={styles.errorTitle()}>Failed to Load Token Info</h3>
          <p className={styles.errorMessage()}>
            {tokenInfo.error.message || "An error occurred while loading token information."}
          </p>
          <button
            type="button"
            onClick={() => tokenInfo.refetch()}
            className="mt-3 text-sm font-medium text-red-700 dark:text-red-300 hover:underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format data for display
  const symbol = tokenInfo.symbol || campaignInfo.campaignName;
  const decimals = tokenInfo.decimals ?? 18;
  const recipientsCount = MOCK_RECIPIENTS.length;
  const totalAmount = MOCK_RECIPIENTS.reduce((sum: bigint, r) => sum + r.amount, 0n);
  const formattedTotalAmount = formatUnits(totalAmount, decimals);
  const expiresAt = dayjs.unix(campaignInfo.expiresAt);
  const isExpired = campaignInfo.hasExpired ?? false;
  const daysUntilExpiry = expiresAt.diff(dayjs(), "day");

  return (
    <div className={styles.container()}>
      <div className={styles.card()}>
        {/* Header */}
        <div className={styles.header()}>
          <div className={styles.titleSection()}>
            <div className={styles.logoPlaceholder()}>{getTokenInitials(symbol)}</div>
            <div className={styles.titleGroup()}>
              <h2 className={styles.campaignName()}>{campaignInfo.campaignName}</h2>
              <p className={styles.tokenSymbol()}>
                {tokenInfo.name || symbol} ({symbol})
              </p>
            </div>
          </div>
          <span
            className={styles.badge({
              distributionType: campaignInfo.distributionType,
            })}
          >
            {campaignInfo.distributionType.charAt(0).toUpperCase() +
              campaignInfo.distributionType.slice(1)}
          </span>
        </div>

        {/* Info Grid */}
        <div className={styles.grid()}>
          {/* Total Allocation */}
          <div className={styles.infoCard()}>
            <div className={styles.infoLabel()}>Total Allocation</div>
            <div className={styles.infoValue()}>
              {Number(formattedTotalAmount).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              {symbol}
            </div>
            <div className={styles.infoSubtext()}>
              Split among {recipientsCount} recipient{recipientsCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Recipients Count */}
          <div className={styles.infoCard()}>
            <div className={styles.infoLabel()}>Recipients</div>
            <div className={styles.infoValue()}>{recipientsCount.toLocaleString()}</div>
            <div className={styles.infoSubtext()}>
              Avg:{" "}
              {Number(formatUnits(totalAmount / BigInt(recipientsCount), decimals)).toLocaleString(
                undefined,
                { maximumFractionDigits: 2 },
              )}{" "}
              {symbol}
            </div>
          </div>

          {/* Claim Fee */}
          <div className={styles.infoCard()}>
            <div className={styles.infoLabel()}>Claim Fee</div>
            <div className={styles.infoValue()}>
              {campaignInfo.claimFee !== undefined
                ? campaignInfo.claimFee === 0n
                  ? "Free"
                  : `${formatUnits(campaignInfo.claimFee, 18)} ETH`
                : "Loading..."}
            </div>
            <div className={styles.infoSubtext()}>
              {campaignInfo.claimFee === 0n ? "No fee required" : "Per claim transaction"}
            </div>
          </div>

          {/* Expiration */}
          <div className={styles.infoCard()}>
            <div className={styles.infoLabel()}>{isExpired ? "Expired" : "Expires"}</div>
            <div className={styles.infoValue()}>{expiresAt.format("MMM D, YYYY")}</div>
            <div className={styles.infoSubtext()}>
              {isExpired ? (
                <span className="text-red-600 dark:text-red-400">Campaign has ended</span>
              ) : daysUntilExpiry <= 7 && daysUntilExpiry > 0 ? (
                <span className="text-orange-600 dark:text-orange-400">
                  {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} remaining
                </span>
              ) : (
                <span>{expiresAt.fromNow()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <div className="mt-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-900 dark:text-red-100 font-medium">
              This campaign has expired. Claims are no longer available.
            </p>
          </div>
        )}

        {/* Expiring Soon Warning */}
        {!isExpired && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-900 dark:text-orange-100 font-medium">
              Claim soon! This campaign expires in {daysUntilExpiry} day
              {daysUntilExpiry !== 1 ? "s" : ""}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
