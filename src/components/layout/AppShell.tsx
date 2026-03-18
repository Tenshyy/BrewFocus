"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "@/components/ui/LucideIcon";

interface AppShellProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function AppShell({ left, right }: AppShellProps) {
  const [tab, setTab] = useState<"timer" | "tasks">("timer");
  const t = useTranslations("common");
  const hasLeft = left !== null && left !== undefined;

  // Single-column layout when left (timer) is disabled
  if (!hasLeft) {
    return (
      <div className="max-w-[860px] mx-auto px-4">
        <div className="flex flex-col gap-4">{right}</div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile tab bar */}
      <div className="sm:hidden flex border-b border-brew-border mb-4 max-w-[860px] mx-auto px-4">
        <button
          onClick={() => setTab("timer")}
          className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[2px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brew-orange ${
            tab === "timer"
              ? "text-brew-orange border-b-2 border-brew-orange"
              : "text-brew-gray hover:text-brew-cream"
          }`}
        >
          <LucideIcon name="clock" size={12} className="inline-block mr-1" />{t("timer")}
        </button>
        <button
          onClick={() => setTab("tasks")}
          className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[2px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brew-orange ${
            tab === "tasks"
              ? "text-brew-orange border-b-2 border-brew-orange"
              : "text-brew-gray hover:text-brew-cream"
          }`}
        >
          <LucideIcon name="check" size={12} className="inline-block mr-1" />{t("tasks")}
        </button>
      </div>

      {/* Mobile: show active tab with animation */}
      <div className="sm:hidden max-w-[860px] mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === "timer" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === "timer" ? 20 : -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {tab === "timer" ? (
              <div className="flex flex-col">{left}</div>
            ) : (
              <div className="flex flex-col gap-4">{right}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop: side-by-side grid */}
      <div className="hidden sm:grid max-w-[860px] mx-auto px-4 grid-cols-2 gap-7">
        <div className="flex flex-col">{left}</div>
        <div className="flex flex-col gap-4">{right}</div>
      </div>
    </>
  );
}
