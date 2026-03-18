"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AiMode } from "@/types/ai";
import LucideIcon from "@/components/ui/LucideIcon";

interface AiModeConfig {
  mode: AiMode;
  icon: string;
  labelKey: string;
  descKey: string;
}

const FAVORITE_MODES: AiModeConfig[] = [
  { mode: "chat", icon: "bird", labelKey: "rubberDuck", descKey: "rubberDuckDesc" },
  { mode: "planner", icon: "clipboard-list", labelKey: "planner", descKey: "plannerDesc" },
  { mode: "decompose", icon: "puzzle", labelKey: "decompose", descKey: "decomposeDesc" },
  { mode: "coach", icon: "target", labelKey: "coach", descKey: "coachDesc" },
];

const EXTRA_MODES: AiModeConfig[] = [
  { mode: "bilan", icon: "bar-chart", labelKey: "bilan", descKey: "bilanDesc" },
  { mode: "draft", icon: "pen-line", labelKey: "draft", descKey: "draftDesc" },
  { mode: "inbox", icon: "mail-open", labelKey: "inbox", descKey: "inboxDesc" },
  { mode: "overload", icon: "scale", labelKey: "overload", descKey: "overloadDesc" },
  { mode: "focusBrief", icon: "flower", labelKey: "focusBrief", descKey: "focusBriefDesc" },
  { mode: "weeklyReview", icon: "calendar", labelKey: "weeklyReview", descKey: "weeklyReviewDesc" },
];

interface AiModeSelectorProps {
  activeMode: AiMode;
  onSelect: (mode: AiMode) => void;
}

export default function AiModeSelector({ activeMode, onSelect }: AiModeSelectorProps) {
  const t = useTranslations("ai");
  const [expanded, setExpanded] = useState(false);

  // If the active mode is in extras, auto-expand
  const isExtraActive = EXTRA_MODES.some((m) => m.mode === activeMode);
  const showExtras = expanded || isExtraActive;

  function ModeButton({ m }: { m: AiModeConfig }) {
    const isActive = m.mode === activeMode;
    return (
      <button
        key={m.mode}
        onClick={() => onSelect(m.mode)}
        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-brew-orange/15 border border-brew-orange/40"
            : "hover:bg-brew-bg border border-transparent"
        }`}
        title={t(m.descKey)}
      >
        <LucideIcon name={m.icon} size={16} />
        <span
          className={`text-[8px] font-bold uppercase tracking-[1px] ${
            isActive ? "text-brew-orange" : "text-brew-gray"
          }`}
        >
          {t(m.labelKey)}
        </span>
      </button>
    );
  }

  return (
    <div className="p-2">
      {/* Favorites — always visible */}
      <div className="grid grid-cols-4 gap-1.5">
        {FAVORITE_MODES.map((m) => (
          <ModeButton key={m.mode} m={m} />
        ))}
      </div>

      {/* Extras — togglable */}
      {showExtras && (
        <div className="grid grid-cols-3 gap-1.5 mt-1.5" style={{ animation: "fadeIn 0.2s ease" }}>
          {EXTRA_MODES.map((m) => (
            <ModeButton key={m.mode} m={m} />
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((o) => !o)}
        className="w-full mt-1 py-1 text-[9px] text-brew-gray hover:text-brew-cream transition-colors cursor-pointer"
      >
        {showExtras ? `▴ ${t("lessTools")}` : `▾ ${t("moreTools")}`}
      </button>
    </div>
  );
}

