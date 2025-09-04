import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  overlay?: boolean;
  variant?: "default" | "card" | "inline";
}

/**
 * Loading state component for various UI contexts
 */
export function LoadingState({
  size = "md",
  text,
  overlay = false,
  variant = "default",
}: LoadingStateProps) {
  const sizeClasses = {
    lg: "h-8 w-8",
    md: "h-6 w-6",
    sm: "h-4 w-4",
  };

  const textSizeClasses = {
    lg: "text-lg",
    md: "text-base",
    sm: "text-sm",
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {text && <span className={`${textSizeClasses[size]} text-muted-foreground`}>{text}</span>}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
          <div className="absolute inset-0 animate-ping">
            <Loader2 className={`${sizeClasses[size]} text-primary/30`} />
          </div>
        </div>
        {text && (
          <p className={`${textSizeClasses[size]} text-muted-foreground text-center animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    );
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className="absolute inset-0 animate-ping">
          <Loader2 className={`${sizeClasses[size]} text-primary/30`} />
        </div>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-muted-foreground text-center animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center min-h-[200px]">{content}</div>;
}

/**
 * Skeleton loader for content placeholders
 */
export function SkeletonLoader({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted/30 rounded animate-pulse ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton for loading card layouts
 */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 space-y-4 ${className}`}>
      <div className="h-6 bg-muted/30 rounded w-1/2 animate-pulse" />
      <SkeletonLoader lines={3} />
      <div className="h-10 bg-muted/30 rounded animate-pulse" />
    </div>
  );
}
