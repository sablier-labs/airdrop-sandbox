import { tv } from "tailwind-variants";

export const transactionStatusVariants = tv({
  base: "rounded-lg border p-4",
  defaultVariants: {
    status: "idle",
  },
  variants: {
    status: {
      confirmed: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
      confirming: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
      error: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950",
      idle: "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
      writing: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
    },
  },
});
