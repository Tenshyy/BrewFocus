"use client";

import { useTranslations } from "next-intl";
import type { CategoryStat } from "@/lib/stats";

interface CategoryBreakdownProps {
  categories: CategoryStat[];
}

export default function CategoryBreakdown({
  categories,
}: CategoryBreakdownProps) {
  const t = useTranslations("stats");

  if (categories.length === 0) {
    return (
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray mb-3">
          {t("categories")}
        </h3>
        <p className="text-[11px] text-brew-gray">{t("noTasks")}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray mb-3">
        {t("categories")}
      </h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.category} className="flex items-center gap-2">
            {/* Bar */}
            <div className="flex-1 h-2.5 bg-brew-bg rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(cat.percent, 4)}%`,
                  backgroundColor: cat.color,
                  opacity: 0.8,
                }}
              />
            </div>
            {/* Label + count */}
            <span
              className="text-[9px] font-bold w-[50px]"
              style={{ color: cat.color }}
            >
              {cat.label}
            </span>
            <span className="text-[9px] text-brew-gray w-[28px] text-right">
              {cat.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
