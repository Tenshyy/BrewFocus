"use client";

import { useTranslations } from "next-intl";
import type { PersonalBest } from "@/lib/stats";
import LucideIcon from "@/components/ui/LucideIcon";

interface PersonalBestsProps {
  bests: PersonalBest[];
}

const ICON_NAMES = ["coffee", "flame", "check-circle"];

export default function PersonalBests({ bests }: PersonalBestsProps) {
  const t = useTranslations("stats");

  if (bests.length === 0) {
    return (
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray mb-3">
          {t("personalBests")}
        </h3>
        <p className="text-[11px] text-brew-gray">
          {t("personalBestsEmpty")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray mb-3">
        {t("personalBests")}
      </h3>
      <div className="space-y-2">
        {bests.map((best, i) => (
          <div key={best.label} className="flex items-center gap-2">
            <span className="text-sm"><LucideIcon name={ICON_NAMES[i] || "star"} size={14} /></span>
            <span className="text-[12px] font-bold text-brew-orange">
              {best.value}
            </span>
            <span className="text-[11px] text-brew-gray">
              {best.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
