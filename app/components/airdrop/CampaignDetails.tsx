import { Clock, TrendingUp, Users, Zap } from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";

export interface CampaignStats {
  totalAmount: string;
  totalRecipients: number;
  claimedAmount: string;
  claimedRecipients: number;
  distributionType: "merkle" | "stream" | "cliff";
  startDate: Date;
  endDate?: Date;
  tokenSymbol: string;
}

export interface CampaignDetailsProps {
  stats: CampaignStats;
}

export default function CampaignDetails({ stats }: CampaignDetailsProps) {
  const claimProgress =
    (parseInt(stats.claimedAmount.replace(/,/g, ""), 10) /
      parseInt(stats.totalAmount.replace(/,/g, ""), 10)) *
    100;
  const recipientProgress = (stats.claimedRecipients / stats.totalRecipients) * 100;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDistributionTypeLabel = (type: string) => {
    switch (type) {
      case "merkle":
        return "Merkle Drop";
      case "stream":
        return "Stream";
      case "cliff":
        return "Cliff Vesting";
      default:
        return "Unknown";
    }
  };

  const isActive = stats.endDate ? new Date() < stats.endDate : true;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Amount */}
      <Card hover glow className="bg-gradient-to-br from-primary/10 to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Total Amount</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">{stats.totalAmount}</p>
            <p className="text-sm text-muted-foreground">{stats.tokenSymbol}</p>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Claimed</span>
                <span>{claimProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${claimProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card hover className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span>Recipients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">
              {stats.totalRecipients.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Eligible addresses</p>
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Claimed</span>
                <span>{recipientProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-400 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${recipientProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Type */}
      <Card hover className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Zap className="h-4 w-4 text-green-400" />
            <span>Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">
              {getDistributionTypeLabel(stats.distributionType)}
            </p>
            <p className="text-sm text-muted-foreground">
              {stats.distributionType === "merkle" && "Instant claim"}
              {stats.distributionType === "stream" && "Real-time streaming"}
              {stats.distributionType === "cliff" && "Time-locked release"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card hover className="bg-gradient-to-br from-orange-500/10 to-red-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <span>Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
              ></div>
              <p className="text-sm font-medium">{isActive ? "Active" : "Ended"}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Started: {formatDate(stats.startDate)}</p>
              {stats.endDate && <p>Ends: {formatDate(stats.endDate)}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
