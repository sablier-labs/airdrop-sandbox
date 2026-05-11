import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";
import { cn } from "@/lib/variants";
import { cardVariants } from "./Card.variants";

export type CardVariants = VariantProps<typeof cardVariants>;

type CardProps = CardVariants & {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function Card({
  children,
  className,
  interactive,
  onClick,
  shadow,
  size,
  variant,
}: CardProps) {
  const styles = cardVariants({
    interactive: interactive || Boolean(onClick),
    shadow,
    size,
    variant,
  });
  const rootClassName = cn(styles.root(), className);

  if (!onClick) {
    return <div className={rootClassName}>{children}</div>;
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: Card is a complex container component
    <div
      className={rootClassName}
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

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  const styles = cardVariants();
  return <div className={cn(styles.header(), className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  const styles = cardVariants();
  return <h3 className={cn(styles.title(), className)}>{children}</h3>;
}

export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const styles = cardVariants();
  return <p className={cn(styles.description(), className)}>{children}</p>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  const styles = cardVariants();
  return <div className={cn(styles.body(), className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  const styles = cardVariants();
  return <div className={cn(styles.footer(), className)}>{children}</div>;
}
