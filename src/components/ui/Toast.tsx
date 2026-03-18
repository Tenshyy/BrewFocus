"use client";

import type { ToastItem } from "@/stores/toastStore";
import { useToastStore } from "@/stores/toastStore";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

interface ToastProps {
  toast: ToastItem;
}

export default function Toast({ toast }: ToastProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const tc = useTranslations("common");

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 8000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      layout
      className="flex items-center gap-2.5 bg-brew-panel border border-brew-border rounded-lg px-3.5 py-2.5 shadow-lg max-w-[300px]"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
    >
      <span className="text-base flex-shrink-0">{toast.icon}</span>
      <p className="text-[11px] text-brew-cream leading-snug flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-brew-gray text-xs hover:text-brew-cream transition-colors cursor-pointer flex-shrink-0"
        aria-label={tc("close")}
      >
        &times;
      </button>
    </motion.div>
  );
}
