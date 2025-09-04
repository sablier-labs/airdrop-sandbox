import { AlertCircle, Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export type InputState = "default" | "success" | "error";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  state?: InputState;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      helperText,
      state = "default",
      fullWidth = false,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "flex h-10 rounded-lg border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

    const stateClasses = {
      default: "border-border focus-visible:ring-ring",
      error: "border-destructive focus-visible:ring-destructive",
      success: "border-green-500 focus-visible:ring-green-500",
    };

    const widthClass = fullWidth ? "w-full" : "";
    const classes = `${baseClasses} ${stateClasses[state]} ${widthClass} ${className}`;

    const getStateIcon = () => {
      switch (state) {
        case "success":
          return <Check className="h-4 w-4 text-green-500" />;
        case "error":
          return <AlertCircle className="h-4 w-4 text-destructive" />;
        default:
          return null;
      }
    };

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input ref={ref} type={type} className={classes} {...props} />
          {(state === "success" || state === "error") && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {getStateIcon()}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={`mt-2 text-xs ${
              state === "error"
                ? "text-destructive"
                : state === "success"
                  ? "text-green-500"
                  : "text-muted-foreground"
            }`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
