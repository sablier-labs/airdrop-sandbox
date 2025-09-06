"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
};

const sizeClasses = {
  lg: "h-8 w-8",
  md: "h-6 w-6",
  sm: "h-4 w-4",
};

export function Loading({ className, size = "md", text }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <Loader2 className={cn(sizeClasses[size], "text-primary")} />
      </motion.div>
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
