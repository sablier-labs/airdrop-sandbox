import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

// CUSTOMIZE: Spinner with Sablier orange color
const spinnerVariants = tv({
  base: "inline-block animate-spin rounded-full border-2 border-solid border-sablier-orange-start border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "h-12 w-12 border-3",
      md: "h-8 w-8 border-2",
      sm: "h-4 w-4 border-2",
    },
  },
});

export interface LoadingSpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function LoadingSpinner({
  className,
  size,
  label = "Loading...",
  ...props
}: LoadingSpinnerProps) {
  return (
    <div className={clsx("flex items-center justify-center", className)} {...props}>
      {/* biome-ignore lint/a11y/useSemanticElements: role="status" is appropriate for loading indicators */}
      <div className={spinnerVariants({ size })} role="status" aria-busy="true">
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

export function LoadingSpinnerWithText({
  className,
  size,
  label = "Loading...",
  text,
  ...props
}: LoadingSpinnerProps & { text?: string }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-3", className)} {...props}>
      {/* biome-ignore lint/a11y/useSemanticElements: role="status" is appropriate for loading indicators */}
      <div className={spinnerVariants({ size })} role="status" aria-busy="true">
        <span className="sr-only">{label}</span>
      </div>
      {text && <p className="text-sm text-sablier-text-muted">{text}</p>}
    </div>
  );
}
