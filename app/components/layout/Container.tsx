import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export function Container({ children, className, size = "lg", ...props }: ContainerProps) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        {
          "max-w-3xl": size === "sm",
          "max-w-5xl": size === "md",
          "max-w-7xl": size === "lg",
          "max-w-full": size === "full",
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
