import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import type { VariantProps } from "tailwind-variants";
import { cn } from "@/lib/variants";
import { buttonVariants } from "./Button.variants";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ size, variant }), className);

  if (asChild && typeof children === "object" && children !== null) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ...props,
      className: cn(child.props.className, classes),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
