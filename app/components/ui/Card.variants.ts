import { tv } from "tailwind-variants";

export const cardVariants = tv({
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
      lg: { root: "shadow-lg" },
      md: { root: "shadow-md" },
      none: { root: "shadow-none" },
      sm: { root: "shadow-sm" },
    },
    size: {
      md: {},
      lg: {
        body: "px-8 py-6",
        footer: "px-8 py-6",
        header: "px-8 py-6",
        root: "p-8",
        title: "text-2xl",
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
