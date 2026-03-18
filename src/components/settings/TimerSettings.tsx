"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSettingsStore } from "@/stores/settingsStore";
import { TIMER_PRESETS } from "@/lib/constants";
import { requestNotificationPermission, isNotificationSupported } from "@/lib/notify";
import Button from "@/components/ui/Button";

export default function TimerSettings() {
  const t = useTranslations("timer");
  const timerConfig = useSettingsStore((s) => s.timerConfig);
  const setTimerConfig = useSettingsStore((s) => s.setTimerConfig);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const cafeOpacity = useSettingsStore((s) => s.cafeOpacity);
  const setCafeOpacity = useSettingsStore((s) => s.setCafeOpacity);
  const ambianceTrack = useSettingsStore((s) => s.ambianceTrack);
  const setAmbianceTrack = useSettingsStore((s) => s.setAmbianceTrack);
  const ambianceVolume = useSettingsStore((s) => s.ambianceVolume);
  const setAmbianceVolume = useSettingsStore((s) => s.setAmbianceVolume);
  const ambianceAutoplay = useSettingsStore((s) => s.ambianceAutoplay);
  const setAmbianceAutoplay = useSettingsStore((s) => s.setAmbianceAutoplay);

  const [notifSupported, setNotifSupported] = useState(false);
  const [notifDenied, setNotifDenied] = useState(false);

  useEffect(() => {
    setNotifSupported(isNotificationSupported());
    if (isNotificationSupported()) {
      setNotifDenied(Notification.permission === "denied");
    }
  }, []);

  const focusMin = Math.round(timerConfig.focusDuration / 60);
  const breakMin = Math.round(timerConfig.breakDuration / 60);

  async function handleNotifToggle(checked: boolean) {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
      } else {
        setNotifDenied(true);
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-2">
          {t("presets")}
        </label>
        <div className="flex gap-2">
          {Object.values(TIMER_PRESETS).map((preset) => (
            <Button
              key={preset.label}
              variant={
                timerConfig.focusDuration === preset.focusDuration
                  ? "primary"
                  : "secondary"
              }
              size="sm"
              onClick={() =>
                setTimerConfig({
                  focusDuration: preset.focusDuration,
                  breakDuration: preset.breakDuration,
                })
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
            {t("focusMin")}
          </label>
          <input
            type="number"
            min={1}
            max={120}
            value={focusMin}
            onChange={(e) =>
              setTimerConfig({
                ...timerConfig,
                focusDuration: Number(e.target.value) * 60,
              })
            }
            className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
            {t("pauseMin")}
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={breakMin}
            onChange={(e) =>
              setTimerConfig({
                ...timerConfig,
                breakDuration: Number(e.target.value) * 60,
              })
            }
            className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
          />
        </div>
      </div>

      {/* Sound toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
          className="accent-brew-orange"
        />
        <span className="text-[12px] text-brew-cream">{t("soundEnd")}</span>
      </label>

      {/* Cafe ambiance opacity */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-2">
          {t("cafeAmbiance", { opacity: cafeOpacity })}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={cafeOpacity}
          onChange={(e) => setCafeOpacity(Number(e.target.value))}
          className="w-full accent-brew-orange"
        />
        <div className="flex justify-between text-[9px] text-brew-gray mt-1">
          <span>{t("invisible")}</span>
          <span>{t("discreet")}</span>
          <span>{t("visible")}</span>
        </div>
      </div>

      {/* Ambiance audio */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-2">
          {t("ambianceTrack")}
        </label>
        <select
          value={ambianceTrack}
          onChange={(e) => setAmbianceTrack(e.target.value as typeof ambianceTrack)}
          className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
        >
          <option value="none">{t("trackNone")}</option>
          <option value="cafe-murmurs">{t("trackCafe")}</option>
          <option value="coffee-machine">{t("trackCoffee")}</option>
          <option value="rain">{t("trackRain")}</option>
          <option value="keyboard-typing">{t("trackKeyboard")}</option>
        </select>
      </div>

      {ambianceTrack !== "none" && (
        <>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-2">
              {t("ambianceVolume")} — {ambianceVolume}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={ambianceVolume}
              onChange={(e) => setAmbianceVolume(Number(e.target.value))}
              className="w-full accent-brew-orange"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ambianceAutoplay}
              onChange={(e) => setAmbianceAutoplay(e.target.checked)}
              className="accent-brew-orange"
            />
            <span className="text-[12px] text-brew-cream">{t("ambianceAutoplay")}</span>
          </label>
        </>
      )}

      {/* Notifications toggle */}
      {notifSupported && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => handleNotifToggle(e.target.checked)}
              disabled={notifDenied}
              className="accent-brew-orange"
            />
            <span className="text-[12px] text-brew-cream">
              {t("notifications")}
            </span>
          </label>
          {notifDenied && (
            <p className="text-[9px] text-red-400 mt-1 ml-5">
              {t("notifBlocked")}
            </p>
          )}
          {notificationsEnabled && !notifDenied && (
            <p className="text-[9px] text-brew-gray mt-1 ml-5">
              {t("notifInfo")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
