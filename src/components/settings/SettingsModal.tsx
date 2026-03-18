"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import TimerSettings from "./TimerSettings";
import LlmSettings from "./LlmSettings";
import DataSettings from "./DataSettings";
import AboutSection from "./AboutSection";
import LanguageSettings from "./LanguageSettings";
import ThemeSettings from "./ThemeSettings";
import FeaturesSettings from "./FeaturesSettings";

type Tab = "features" | "timer" | "llm" | "data" | "about" | "language" | "theme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>("features");
  const t = useTranslations("settings");

  const tabs: { id: Tab; label: string }[] = [
    { id: "features", label: t("tabFeatures") },
    { id: "timer", label: t("tabTimer") },
    { id: "llm", label: t("tabLlm") },
    { id: "theme", label: t("tabTheme") },
    { id: "data", label: t("tabData") },
    { id: "language", label: t("tabLanguage") },
    { id: "about", label: t("tabAbout") },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")}>
      {/* Tab bar */}
      <div role="tablist" className="flex gap-1 mb-4 border-b border-brew-border pb-2 overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={`text-[10px] font-bold uppercase tracking-[2px] px-3 py-1 rounded transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brew-orange ${
              tab === tb.id
                ? "text-brew-orange bg-brew-orange/10"
                : "text-brew-gray hover:text-brew-cream"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel" className="max-h-[400px] overflow-y-auto pr-1">
        {tab === "features" && <FeaturesSettings />}
        {tab === "timer" && <TimerSettings />}
        {tab === "llm" && <LlmSettings />}
        {tab === "theme" && <ThemeSettings />}
        {tab === "data" && <DataSettings />}
        {tab === "language" && <LanguageSettings />}
        {tab === "about" && <AboutSection />}
      </div>
    </Modal>
  );
}
