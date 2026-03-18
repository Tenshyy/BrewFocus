"use client";

import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function TimerControls() {
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);
  const focusDuration = useSettingsStore((s) => s.timerConfig.focusDuration);
  const t = useTranslations("timer");

  return (
    <div className="mt-5">
      <div className="flex justify-center gap-2.5">
        {status === "running" ? (
          <Button variant="secondary" onClick={pause}>
            {t("pause")}
          </Button>
        ) : (
          <Button variant="primary" onClick={start}>
            {t("start")}
          </Button>
        )}
        <Button variant="secondary" onClick={() => reset(focusDuration)}>
          {t("reset")}
        </Button>
      </div>
      <div className="flex justify-center gap-3 mt-3 text-[10px] text-brew-gray">
        <span>
          <kbd className="px-1.5 py-0.5 border border-brew-border rounded text-[9px]">
            {t("space")}
          </kbd>{" "}
          {t("startPause")}
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 border border-brew-border rounded text-[9px]">
            R
          </kbd>{" "}
          {t("reset")}
        </span>
      </div>
    </div>
  );
}
