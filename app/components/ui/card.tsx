import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

/**
 * Card component variants
 *
 * CUSTOMIZATION POINT: Modify card styles to match your brand
 */
const card = tv({
  defaultVariants: {
    interactive: false,
    shadow: "md",
    size: "md",
    variant: "default",
  },
  slots: {
    body: "px-6 py-4",
    description: "mt-1 text-sm text-gray-600 dark:text-gray-400",
    footer: "border-t px-6 py-4",
    header: "border-b px-6 py-4",
    root: "rounded-xl border bg-white transition-colors dark:bg-gray-900",
    title: "text-xl font-bold",
  },
  variants: {
    interactive: {
      true: {
        root: "cursor-pointer hover:border-gray-300 hover:shadow-lg dark:hover:border-gray-700",
      },
    },
    shadow: {
      lg: {
        root: "shadow-lg",
      },
      md: {
        root: "shadow-md",
      },
      none: {
        root: "shadow-none",
      },
      sm: {
        root: "shadow-sm",
      },
    },
    size: {
      lg: {
        body: "px-8 py-6",
        footer: "px-8 py-6",
        header: "px-8 py-6",
        root: "p-8",
        title: "text-2xl",
      },
      md: {
        // Default sizes (defined in base slots)
      },
      sm: {
        body: "px-4 py-3",
        footer: "px-4 py-3",
        header: "px-4 py-3",
        root: "p-4",
        title: "text-lg",
      },
    },
    variant: {
      default: {
        root: "border-gray-200 dark:border-gray-800",
      },
      error: {
        root: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
        title: "text-red-900 dark:text-red-100",
      },
      info: {
        root: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
        title: "text-blue-900 dark:text-blue-100",
      },
      success: {
        root: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
        title: "text-green-900 dark:text-green-100",
      },
      warning: {
        root: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
        title: "text-yellow-900 dark:text-yellow-100",
      },
    },
  },
});

export type CardVariants = VariantProps<typeof card>;

type CardProps = CardVariants & {
  /** Additional CSS classes */
  className?: string;
  /** Card content */
  children: ReactNode;
  /** Click handler (sets interactive to true) */
  onClick?: () => void;
};

/**
 * Card root component
 *
 * @example
 * ```tsx
 * <Card variant="success" shadow="lg">
 *   <CardHeader>
 *     <CardTitle>Success</CardTitle>
 *     <CardDescription>Your operation completed successfully</CardDescription>
 *   </CardHeader>
 *   <CardBody>
 *     Content goes here
 *   </CardBody>
 * </Card>
 * ```
 */
export function Card({
  children,
  className,
  interactive,
  onClick,
  shadow,
  size,
  variant,
}: CardProps) {
  const styles = card({
    interactive: interactive || Boolean(onClick),
    shadow,
    size,
    variant,
  });

  if (onClick) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: Card is a complex container component
      <div
        className={`${styles.root()} ${className || ""}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }

  return <div className={`${styles.root()} ${className || ""}`}>{children}</div>;
}

/**
 * Card header component
 */
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  const styles = card();
  return <div className={`${styles.header()} ${className || ""}`}>{children}</div>;
}

/**
 * Card title component
 */
export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  const styles = card();
  return <h3 className={`${styles.title()} ${className || ""}`}>{children}</h3>;
}

/**
 * Card description component
 */
export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const styles = card();
  return <p className={`${styles.description()} ${className || ""}`}>{children}</p>;
}

/**
 * Card body component
 */
export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  const styles = card();
  return <div className={`${styles.body()} ${className || ""}`}>{children}</div>;
}

/**
 * Card footer component
 */
export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  const styles = card();
  return <div className={`${styles.footer()} ${className || ""}`}>{children}</div>;
}
