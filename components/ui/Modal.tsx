"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Hide the default close button (e.g. for the entry onboarding modal). */
  hideClose?: boolean;
}

/** Centered overlay dialog with backdrop blur, ESC-to-close, and entrance motion. */
export function Modal({ open, onClose, children, className, hideClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0e0f1c]/95 shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(139,92,246,0.08)] backdrop-blur-2xl animate-pop",
          className
        )}
      >
        {/* top accent glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        {!hideClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 z-10 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
