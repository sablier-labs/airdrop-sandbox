import { X } from "lucide-react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect } from "react";
import Button from "./Button";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className = "", open, onClose, size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      lg: "max-w-2xl",
      md: "max-w-lg",
      sm: "max-w-md",
      xl: "max-w-4xl",
    };

    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      if (open) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={ref}
          className={`relative bg-card border border-border rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto glow-purple ${className}`}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);

Modal.displayName = "Modal";

export const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  ),
);

ModalHeader.displayName = "ModalHeader";

export const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h2 ref={ref} className={`text-xl font-semibold text-foreground ${className}`} {...props} />
  ),
);

ModalTitle.displayName = "ModalTitle";

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-sm text-muted-foreground mt-2 ${className}`} {...props} />
));

ModalDescription.displayName = "ModalDescription";

export const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`px-6 pb-4 ${className}`} {...props} />
  ),
);

ModalContent.displayName = "ModalContent";

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-end space-x-2 p-6 pt-4 border-t border-border ${className}`}
      {...props}
    />
  ),
);

ModalFooter.displayName = "ModalFooter";

export const ModalCloseButton = forwardRef<HTMLButtonElement, { onClose: () => void }>(
  ({ onClose }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="absolute top-4 right-4 h-8 w-8 p-0"
      aria-label="Close modal"
    >
      <X className="h-4 w-4" />
    </Button>
  ),
);

ModalCloseButton.displayName = "ModalCloseButton";

export default Modal;
