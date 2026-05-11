import { tv } from "tailwind-variants";

export const claimCardVariants = tv({
  slots: {
    amount: "mb-6 text-center",
    amountLabel: "mt-2 text-sm text-gray-500",
    amountValue: "text-4xl font-bold text-blue-600 dark:text-blue-400",
    button:
      "w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50",
    card: "rounded-xl border bg-white p-6 shadow-lg dark:bg-gray-900",
    description: "mb-6 text-gray-600 dark:text-gray-400",
    error:
      "rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    fee: "text-center text-xs text-gray-500 dark:text-gray-400",
    footer:
      "mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-400 dark:border-gray-800",
    info: "rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
    status: "mb-4 rounded-lg border p-4",
    success:
      "rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
    title: "mb-4 text-2xl font-bold",
    warning:
      "rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  },
});
