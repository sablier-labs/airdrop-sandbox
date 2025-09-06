import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm font-medium ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground/60 placeholder:font-normal",
        "transition-smooth focus-glow",
        "focus:border-primary focus:bg-primary/5",
        "hover:border-primary/40 hover:bg-primary/2",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
