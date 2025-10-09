import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

// CUSTOMIZE: Sablier button variants with brand gradients
const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sablier-orange-start focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
  variants: {
    size: {
      lg: "h-12 px-6 text-base",
      md: "h-10 px-4 text-sm sm:text-base sm:h-12 sm:px-5",
      sm: "h-9 px-3 text-sm",
    },
    variant: {
      ghost: "hover:bg-sablier-bg-medium text-sablier-text-primary",
      primary:
        "sablier-gradient-orange text-white hover:opacity-90 hover:shadow-lg hover:shadow-sablier-orange-start/25",
      secondary:
        "border border-solid border-sablier-bg-light bg-sablier-bg-dark text-sablier-text-primary hover:bg-sablier-bg-medium hover:border-sablier-bg-light",
    },
  },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = clsx(buttonVariants({ size, variant }), className);

  if (asChild && typeof children === "object" && children !== null) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...props,
      className: clsx(child.props.className, classes),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
