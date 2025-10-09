"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { tv } from "tailwind-variants";
import { useClaimStatus } from "../../hooks/useClaimStatus";
import { defaultCampaignConfig } from "../../lib/config/campaign";

// Extend dayjs with relativeTime plugin for "X days ago" formatting
dayjs.extend(relativeTime);

const claimStatusVariants = tv({
  slots: {
    card: "p-4 rounded-lg border",
    container: "space-y-4",
    description: "text-sm",
    detailLabel: "text-gray-600 dark:text-gray-400",
    detailRow: "flex justify-between items-center text-sm",
    detailsGrid: "grid gap-3 mt-3",
    detailValue: "font-medium text-gray-900 dark:text-gray-100",
    errorMessage: "text-sm text-red-600 dark:text-red-400",
    icon: "h-5 w-5",
    loadingSpinner:
      "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
    statusBadge: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium",
    title: "font-semibold mb-2 flex items-center gap-2",
  },
  variants: {
    status: {
      active: {
        card: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
        statusBadge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
        title: "text-blue-900 dark:text-blue-100",
      },
      claimed: {
        card: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
        statusBadge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
        title: "text-green-900 dark:text-green-100",
      },
      expired: {
        card: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
        statusBadge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
        title: "text-red-900 dark:text-red-100",
      },
    },
  },
});

const styles = claimStatusVariants();

export interface ClaimStatusProps {
  /**
   * Index in the Merkle tree
   */
  index: number;

  /**
   * Whether to show detailed information
   */
  detailed?: boolean;
}

/**
 * ClaimStatus Component
 *
 * Displays the current claim status for a specific index in the campaign.
 * Features:
 * - Already claimed indicator with checkmark
 * - Campaign expiration warning
 * - Stream NFT info (for vesting claims)
 * - Claim timestamp display
 * - Visual indicators (icons, colors)
 * - Responsive design
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ClaimStatus index={0} />
 * ```
 *
 * @example
 * ```tsx
 * // With detailed view
 * <ClaimStatus index={0} detailed />
 * ```
 */
export function ClaimStatus({ index, detailed = false }: ClaimStatusProps) {
  const { data, isLoading, error, refetch } = useClaimStatus(index);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container()}>
        <div className={styles.card({ status: "active" })}>
          <div className="flex items-center justify-center gap-3 py-4">
            <span className={styles.loadingSpinner()} />
            <span className={styles.description()}>Loading claim status...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container()}>
        <div className={styles.card({ status: "expired" })}>
          <h4 className={styles.title()}>
            <svg className={styles.icon()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Error Loading Status
          </h4>
          <p className={styles.errorMessage()}>{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!data) {
    return null;
  }

  // Already claimed
  if (data.hasClaimed) {
    return (
      <div className={styles.container()}>
        <div className={styles.card({ status: "claimed" })}>
          <h4 className={styles.title()}>
            <svg className={styles.icon()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Already Claimed
          </h4>
          <p className={styles.description()}>
            This allocation has already been claimed and tokens have been distributed.
          </p>

          {detailed && (
            <div className={styles.detailsGrid()}>
              {data.claimTimestamp && (
                <div className={styles.detailRow()}>
                  <span className={styles.detailLabel()}>Claimed</span>
                  <span className={styles.detailValue()}>
                    {dayjs.unix(data.claimTimestamp).format("MMM D, YYYY")}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({dayjs.unix(data.claimTimestamp).fromNow()})
                    </span>
                  </span>
                </div>
              )}

              {data.streamId && (
                <div className={styles.detailRow()}>
                  <span className={styles.detailLabel()}>Stream NFT ID</span>
                  <span className={styles.detailValue()}>#{data.streamId.toString()}</span>
                </div>
              )}

              <div className={styles.detailRow()}>
                <span className={styles.detailLabel()}>Index</span>
                <span className={styles.detailValue()}>#{index}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Campaign expired
  if (data.isExpired) {
    return (
      <div className={styles.container()}>
        <div className={styles.card({ status: "expired" })}>
          <h4 className={styles.title()}>
            <svg className={styles.icon()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Campaign Expired
          </h4>
          <p className={styles.description()}>
            This campaign has expired. Claims are no longer available.
          </p>

          {detailed && (
            <div className={styles.detailsGrid()}>
              <div className={styles.detailRow()}>
                <span className={styles.detailLabel()}>Expired on</span>
                <span className={styles.detailValue()}>
                  {dayjs.unix(defaultCampaignConfig.expiresAt).format("MMM D, YYYY")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active - can claim
  const expiresAt = dayjs.unix(defaultCampaignConfig.expiresAt);
  const now = dayjs();
  const daysUntilExpiry = expiresAt.diff(now, "day");

  return (
    <div className={styles.container()}>
      <div className={styles.card({ status: "active" })}>
        <div className="flex items-center justify-between">
          <h4 className={styles.title()}>
            <svg className={styles.icon()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Available to Claim
          </h4>
          <span className={styles.statusBadge({ status: "active" })}>Active</span>
        </div>
        <p className={styles.description()}>This allocation is ready to be claimed.</p>

        {detailed && (
          <div className={styles.detailsGrid()}>
            <div className={styles.detailRow()}>
              <span className={styles.detailLabel()}>Expires</span>
              <span className={styles.detailValue()}>
                {expiresAt.format("MMM D, YYYY")}
                {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                    ({daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""} left)
                  </span>
                )}
                {daysUntilExpiry > 7 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ({expiresAt.fromNow()})
                  </span>
                )}
              </span>
            </div>

            <div className={styles.detailRow()}>
              <span className={styles.detailLabel()}>Distribution Type</span>
              <span className={styles.detailValue()}>
                {defaultCampaignConfig.distributionType.charAt(0).toUpperCase() +
                  defaultCampaignConfig.distributionType.slice(1)}
              </span>
            </div>

            <div className={styles.detailRow()}>
              <span className={styles.detailLabel()}>Index</span>
              <span className={styles.detailValue()}>#{index}</span>
            </div>
          </div>
        )}

        {/* Expiration warning */}
        {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
          <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <p className="text-xs text-orange-900 dark:text-orange-100 font-medium">
              Claim soon! This campaign expires in {daysUntilExpiry} day
              {daysUntilExpiry !== 1 ? "s" : ""}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
