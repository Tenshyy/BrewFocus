"use client";

import { useTranslations } from "next-intl";
import type { DayData } from "@/lib/stats";

interface WeeklyChartProps {
  data: DayData[];
}

const MAX_BLOCKS = 8;

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const displayMax = Math.min(maxCount, MAX_BLOCKS);
  const t = useTranslations("stats");

  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray mb-3">
        {t("thisWeek")}
      </h3>
      <div className="flex items-end justify-between gap-1.5">
        {data.map((day) => {
          const blocks = Math.min(day.count, MAX_BLOCKS);
          const overflow = day.count > MAX_BLOCKS ? day.count - MAX_BLOCKS : 0;

          return (
            <div key={day.dateKey} className="flex flex-col items-center gap-1">
              {/* Overflow indicator */}
              {overflow > 0 && (
                <span className="text-[8px] text-brew-gray">+{overflow}</span>
              )}
              {/* Bar */}
              <div
                className="flex flex-col-reverse gap-px"
                style={{ minHeight: `${displayMax * 8 + (displayMax - 1)}px` }}
              >
                {Array.from({ length: blocks }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-[7px] rounded-[1px]"
                    style={{
                      backgroundColor: day.isToday
                        ? "#F09A5A"
                        : "#E07A3A",
                      opacity: day.isToday ? 1 : 0.75,
                      animation: `slideIn 0.3s ease ${i * 0.05}s both`,
                    }}
                  />
                ))}
                {blocks === 0 && (
                  <div className="w-5 h-[7px] rounded-[1px] bg-brew-border" />
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[9px] font-bold ${
                  day.isToday ? "text-brew-cream" : "text-brew-gray"
                }`}
              >
                {day.dayName}
              </span>
              {/* Count */}
              <span className="text-[9px] text-brew-gray">
                {day.count > 0 ? day.count : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
