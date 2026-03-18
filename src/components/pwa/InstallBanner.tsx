"use client";

import { useTranslations } from "next-intl";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import LucideIcon from "@/components/ui/LucideIcon";

export default function InstallBanner() {
  const { canInstall, install, dismiss } = useInstallPrompt();
  const t = useTranslations("pwa");
  const tc = useTranslations("common");

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-brew-coffee-dark border border-brew-coffee-medium rounded-lg px-4 py-3 shadow-lg max-w-sm">
        <span aria-hidden="true"><LucideIcon name="download" size={20} /></span>
        <p className="text-brew-cream text-sm flex-1">
          {t("installPrompt")}
        </p>
        <button
          onClick={install}
          className="px-3 py-1.5 bg-brew-orange text-brew-espresso text-xs font-bold rounded hover:bg-brew-orange/90 transition-colors"
        >
          {t("install")}
        </button>
        <button
          onClick={dismiss}
          className="text-brew-gray hover:text-brew-cream transition-colors"
          aria-label={tc("close")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
