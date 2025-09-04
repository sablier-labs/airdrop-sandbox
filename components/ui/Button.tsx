import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  /** Add accessibility label for screen readers */
  "aria-label"?: string;
  /** Add loading text for screen readers */
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg focus-ring button-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none relative overflow-hidden";

    const variantClasses = {
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive glow-red hover:glow-red",
      ghost: "text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-accent backdrop-blur-sm",
      outline:
        "border border-border text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 focus:ring-accent glass",
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-lg hover:shadow-xl glow-purple animate-shimmer",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary glass-card",
    };

    const sizeClasses = {
      lg: "px-6 py-3.5 text-base min-h-[48px]",
      md: "px-4 py-2.5 text-sm min-h-[40px]",
      sm: "px-3 py-2 text-sm min-h-[32px]",
    };

    const widthClass = fullWidth ? "w-full" : "";
    const loadingClass = loading ? "cursor-wait" : "";

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${loadingClass} ${className}`;

    return (
      <button 
        ref={ref} 
        className={classes} 
        disabled={disabled || loading} 
        {...props}
        aria-busy={loading}
        aria-disabled={disabled || loading}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-current/10 backdrop-blur-sm">
            <Loader2 className="h-4 w-4 animate-spin text-current" />
          </div>
        )}
        <div className={`flex items-center justify-center space-x-2 ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}>
          {children}
        </div>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
