"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRitualStore } from "@/stores/ritualStore";

import Button from "@/components/ui/Button";
import LucideIcon from "@/components/ui/LucideIcon";

const STEP_KEYS = ["welcome", "timer", "braindump", "customize"] as const;
const STEP_ICON_NAMES = ["coffee", "clock", "brain", "palette"];

export default function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const completeOnboarding = useRitualStore((s) => s.completeOnboarding);
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");

  function handleNext() {
    if (step < STEP_KEYS.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  }

  function handleSkip() {
    completeOnboarding();
  }

  const key = STEP_KEYS[step];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(13, 11, 9, 0.97)",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div
        className="bg-brew-panel border border-brew-border rounded-xl p-8 max-w-[420px] w-[90vw] text-center"
        style={{
          animation: "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center" style={{ animation: "fadeIn 0.6s ease 0.2s both" }}>
          <LucideIcon name={STEP_ICON_NAMES[step]} size={48} className="text-brew-orange" />
        </div>

        {/* Title */}
        <h2 className="text-[15px] font-bold text-brew-cream mb-3 tracking-wide">
          {t(key)}
        </h2>

        {/* Description */}
        <p className="text-[12px] text-brew-gray leading-relaxed mb-6">
          {t(`${key}Desc`)}
        </p>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEP_KEYS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "bg-brew-orange w-4"
                  : i < step
                  ? "bg-brew-orange/50"
                  : "bg-brew-border"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-[10px] text-brew-gray hover:text-brew-cream transition-colors"
          >
            {t("skip")}
          </button>
          <Button variant="primary" size="sm" onClick={handleNext}>
            {step < STEP_KEYS.length - 1 ? tc("next") : t("begin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
