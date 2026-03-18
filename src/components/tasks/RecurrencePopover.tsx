"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { TaskRecurrence } from "@/types/task";

interface RecurrencePopoverProps {
  recurrence?: TaskRecurrence;
  onSave: (recurrence: TaskRecurrence | undefined) => void;
  onClose: () => void;
}

export default function RecurrencePopover({
  recurrence,
  onSave,
  onClose,
}: RecurrencePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("tasks");
  const tc = useTranslations("common");
  const [type, setType] = useState<"none" | "daily" | "weekly" | "custom">(
    recurrence?.type ?? "none"
  );
  const [interval, setInterval] = useState(recurrence?.interval ?? 2);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    recurrence?.daysOfWeek ?? [1, 3, 5]
  );

  const DAY_LABELS = [
    t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"),
    t("days.thu"), t("days.fri"), t("days.sat"),
  ];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleSave() {
    if (type === "none") {
      onSave(undefined);
      return;
    }
    const rec: TaskRecurrence = { type };
    if (type === "weekly") rec.daysOfWeek = daysOfWeek;
    if (type === "custom") rec.interval = interval;
    onSave(rec);
  }

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    none: t("none"),
    daily: t("daily"),
    weekly: t("weekly"),
    custom: t("custom"),
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 bg-brew-coffee-dark border border-brew-border rounded-lg p-3 shadow-xl min-w-[200px]"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-brew-orange mb-2">
        {t("recurrence")}
      </p>

      {/* Type selection */}
      <div className="flex flex-wrap gap-1 mb-2">
        {(["none", "daily", "weekly", "custom"] as const).map((tp) => (
          <button
            key={tp}
            onClick={() => setType(tp)}
            className={`px-2 py-1 text-[10px] rounded border transition-colors cursor-pointer ${
              type === tp
                ? "bg-brew-orange text-brew-espresso border-brew-orange font-bold"
                : "border-brew-border text-brew-gray hover:text-brew-cream hover:border-brew-gray"
            }`}
          >
            {TYPE_LABELS[tp]}
          </button>
        ))}
      </div>

      {/* Weekly: day picker */}
      {type === "weekly" && (
        <div className="flex gap-0.5 mb-2">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`w-7 h-7 text-[9px] rounded transition-colors cursor-pointer ${
                daysOfWeek.includes(i)
                  ? "bg-brew-orange text-brew-espresso font-bold"
                  : "bg-brew-bg text-brew-gray hover:text-brew-cream border border-brew-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Custom: interval input */}
      {type === "custom" && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-brew-gray">{t("every")}</span>
          <input
            type="number"
            min={1}
            max={365}
            value={interval}
            onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 bg-brew-bg border border-brew-border rounded text-[11px] text-brew-cream text-center outline-none focus:border-brew-orange font-mono py-0.5"
          />
          <span className="text-[10px] text-brew-gray">{t("daysUnit")}</span>
        </div>
      )}

      {/* Actions */}
      <button
        onClick={handleSave}
        className="w-full py-1.5 bg-brew-orange text-brew-espresso text-[10px] font-bold uppercase tracking-wider rounded hover:bg-brew-orange/90 transition-colors cursor-pointer"
      >
        {tc("save")}
      </button>
    </div>
  );
}
