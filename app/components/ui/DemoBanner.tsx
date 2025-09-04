import { AlertCircle, Info, TestTube } from "lucide-react";

export interface DemoBannerProps {
  message: string;
  details?: string;
  type?: "info" | "warning";
  onDismiss?: () => void;
}

/**
 * Demo mode banner component to inform users about demo/test mode
 */
export function DemoBanner({ message, details, type = "info", onDismiss }: DemoBannerProps) {
  const bgColor = type === "warning" ? "bg-amber-500/10" : "bg-blue-500/10";
  const borderColor = type === "warning" ? "border-amber-500/20" : "border-blue-500/20";
  const textColor = type === "warning" ? "text-amber-400" : "text-blue-400";
  const icon = type === "warning" ? AlertCircle : Info;
  const Icon = icon;

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 mb-6 animate-fade-in-up`}>
      <div className="flex items-start space-x-3">
        <div className="shrink-0">
          <TestTube className={`h-5 w-5 ${textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Icon className={`h-4 w-4 ${textColor}`} />
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          {details && <p className="text-sm text-muted-foreground mt-1">{details}</p>}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={`shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
          >
            <span className="sr-only">Dismiss</span>
            <Icon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
