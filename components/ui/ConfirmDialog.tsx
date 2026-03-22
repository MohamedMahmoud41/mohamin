"use client";

// CLIENT COMPONENT — uses onClick handlers and conditional rendering based on state prop
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "حذف",
  cancelText = "إلغاء",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        dir="rtl"
        className="bg-surface w-full max-w-md rounded-xl shadow-lg border border-border p-6 relative flex flex-col gap-4"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label="إغلاق"
          className="absolute left-4 top-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon + Text */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-background" />
          </div>

          <h3
            id="confirm-dialog-title"
            className="text-xl font-bold text-text-primary"
          >
            {title}
          </h3>

          <p className="text-text-secondary text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-md font-semibold border border-border text-text-primary hover:bg-beige transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-md font-semibold bg-primary text-background hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
