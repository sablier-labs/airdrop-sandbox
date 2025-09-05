import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "./index";

/**
 * Button component variants based on configuration
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2",
        icon: "h-9 w-9",
        lg: "h-10 rounded-md px-8",
        sm: "h-8 rounded-md px-3 text-xs",
      },
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      },
    },
  },
);

/**
 * Card component variants based on configuration
 */
export const cardVariants = cva("rounded-xl border text-card-foreground", {
  defaultVariants: {
    padding: "default",
    variant: "default",
  },
  variants: {
    padding: {
      default: "p-6",
      lg: "p-8",
      none: "",
      sm: "p-4",
    },
    variant: {
      default: "bg-card shadow",
      elevated: "bg-card shadow-lg",
      outline: "bg-card border-2",
      subtle: "bg-card/50 backdrop-blur-sm",
    },
  },
});

/**
 * Input component variants based on configuration
 */
export const inputVariants = cva(
  "flex w-full rounded-md text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9",
        lg: "h-10",
        sm: "h-8",
      },
      variant: {
        default:
          "border border-input bg-background px-3 py-1 focus-visible:ring-1 focus-visible:ring-ring",
        ghost: "border-0 bg-transparent px-3 py-1 focus-visible:bg-accent",
        underline:
          "border-0 border-b border-input bg-transparent px-0 py-1 rounded-none focus-visible:border-primary",
      },
    },
  },
);

/**
 * Badge component variants
 */
export const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
  },
);

/**
 * Alert component variants
 */
export const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        info: "border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-600",
        success: "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600",
        warning:
          "border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600",
      },
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type AlertVariants = VariantProps<typeof alertVariants>;

/**
 * Apply component variants based on configuration
 */
export function getComponentVariants(componentType: string, configVariant?: string) {
  switch (componentType) {
    case "button":
      return { variant: (configVariant as ButtonVariants["variant"]) || "default" };
    case "card":
      return { variant: (configVariant as CardVariants["variant"]) || "default" };
    case "input":
      return { variant: (configVariant as InputVariants["variant"]) || "default" };
    case "badge":
      return { variant: (configVariant as BadgeVariants["variant"]) || "default" };
    case "alert":
      return { variant: (configVariant as AlertVariants["variant"]) || "default" };
    default:
      return {};
  }
}

/**
 * Theme-aware class name builder
 */
export function themeAwareClasses(
  baseClasses: string,
  themeClasses?: Record<string, string>,
  currentTheme?: string,
) {
  if (!themeClasses || !currentTheme) {
    return baseClasses;
  }

  const additionalClasses = themeClasses[currentTheme] || "";
  return cn(baseClasses, additionalClasses);
}
