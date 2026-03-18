"use client";

import { useAiStore } from "@/stores/aiStore";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import AiModeSelector from "./AiModeSelector";
import AiChatView from "./AiChatView";
import AiActionView from "./AiActionView";

export default function AiSidebar() {
  const sidebarOpen = useAiStore((s) => s.sidebarOpen);
  const activeMode = useAiStore((s) => s.activeMode);
  const closeSidebar = useAiStore((s) => s.closeSidebar);
  const setActiveMode = useAiStore((s) => s.setActiveMode);
  const t = useTranslations("ai");

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Overlay mobile */}
          <motion.div
            key="ai-overlay"
            className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <motion.div
            key="ai-sidebar"
            className="fixed top-0 right-0 h-full z-50 bg-brew-panel border-l border-brew-border shadow-[-8px_0_40px_rgba(0,0,0,0.4)] flex flex-col"
            style={{ width: "min(380px, 90vw)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brew-border">
              <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-brew-orange">
                <span aria-hidden="true">▪ </span>{t("title")}<span aria-hidden="true"> ▪</span>
              </h2>
              <button
                onClick={closeSidebar}
                className="text-brew-gray hover:text-brew-cream transition-colors text-lg leading-none cursor-pointer"
                aria-label={t("closeSidebar")}
              >
                &times;
              </button>
            </div>

            {/* Mode selector */}
            <div className="border-b border-brew-border">
              <AiModeSelector
                activeMode={activeMode}
                onSelect={setActiveMode}
              />
            </div>

            {/* Content area */}
            <div className="flex-1 min-h-0 flex flex-col">
              {activeMode === "chat" ? (
                <AiChatView />
              ) : (
                <AiActionView />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
