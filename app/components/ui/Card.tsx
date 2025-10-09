import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

// CUSTOMIZE: Sablier card variants with brand colors
const cardVariants = tv({
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "border-sablier-bg-light bg-sablier-bg-dark text-sablier-text-primary",
      ghost: "border-transparent bg-transparent shadow-none",
      outline: "border-sablier-bg-light bg-transparent text-sablier-text-primary",
    },
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
  title?: string;
}

export function Card({ children, className, variant, title, ...props }: CardProps) {
  return (
    <div className={clsx(cardVariants({ variant }), className)} {...props}>
      {title && (
        <div className="border-b border-sablier-bg-light px-6 py-4">
          <h3 className="text-lg font-semibold text-sablier-text-primary">{title}</h3>
        </div>
      )}
      <div className={clsx("p-6", title && "pt-6")}>{children}</div>
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-sm text-sablier-text-muted", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex items-center p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
