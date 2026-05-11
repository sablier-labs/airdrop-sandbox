import { tv } from "tailwind-variants";

export const connectWalletVariants = tv({
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
  slots: {
    address: "font-mono text-sm",
    balance: "text-sm opacity-80",
    button:
      "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    chainButton:
      "cursor-pointer flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
    chainIcon: "h-4 w-4",
    chainName: "text-sm",
    connected: "flex items-center gap-2",
  },
  variants: {
    size: {
      lg: "h-12 px-6 text-base",
      md: "h-10 px-4 text-sm sm:text-base sm:h-12 sm:px-5",
      sm: "h-9 px-3 text-sm",
    },
    variant: {
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
      primary: "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]",
      secondary:
        "border border-solid border-black/[.08] dark:border-white/[.145] hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent",
    },
  },
});
