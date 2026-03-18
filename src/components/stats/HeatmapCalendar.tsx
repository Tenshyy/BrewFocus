"use client";

import { useTranslations } from "next-intl";
import type { HeatmapData } from "@/lib/stats";

const INTENSITY_COLORS: Record<number, string> = {
  0: "#2A2622",
  1: "#6B4423",
  2: "#A85A28",
  3: "#E07A3A",
  4: "#F09A5A",
};

interface HeatmapCalendarProps {
  data: HeatmapData;
}

export default function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const t = useTranslations("stats");
  const td = useTranslations("tasks");

  const DAY_LABELS = [
    td("days.mon"), td("days.tue"), td("days.wed"), td("days.thu"),
    td("days.fri"), td("days.sat"), td("days.sun"),
  ];

  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray mb-3">
        {t("activity")}
      </h3>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-[3px] min-w-fit">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-[28px]">
            {data.weeks.map((_, wIdx) => {
              const ml = data.monthLabels.find((m) => m.weekIndex === wIdx);
              return (
                <div key={wIdx} className="w-[11px] text-center">
                  {ml && (
                    <span className="text-[7px] text-brew-gray leading-none">
                      {ml.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((label, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-[3px]">
              <span className="w-[24px] text-[8px] text-brew-gray text-right pr-1">
                {dayIdx % 2 === 0 ? label : ""}
              </span>
              {data.weeks.map((week, wIdx) => {
                const day = week.days[dayIdx];
                if (!day || day.count === -1) {
                  return <div key={wIdx} className="w-[11px] h-[11px]" />;
                }
                return (
                  <div
                    key={wIdx}
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{
                      backgroundColor: INTENSITY_COLORS[day.intensity],
                      animation: `slideIn 0.2s ease ${(wIdx * 7 + dayIdx) * 0.003}s both`,
                    }}
                    title={`${day.dateKey}: ${day.count} pomodoro${day.count !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend + summary */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] text-brew-gray">
          {t("activeDays", { count: data.totalDays })}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-brew-gray">{t("less")}</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[9px] h-[9px] rounded-[1px]"
              style={{ backgroundColor: INTENSITY_COLORS[i] }}
            />
          ))}
          <span className="text-[8px] text-brew-gray">{t("more")}</span>
        </div>
      </div>
    </div>
  );
}
