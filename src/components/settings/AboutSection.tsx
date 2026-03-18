"use client";

import { useTranslations } from "next-intl";
import { APP_VERSION } from "@/lib/constants";

export default function AboutSection() {
  const t = useTranslations("settings");
  return (
    <div className="space-y-3 text-[12px] text-brew-gray">
      <p>
        <span className="text-brew-cream font-bold">BREWFOCUS</span> v
        {APP_VERSION}
      </p>
      <p>{t("aboutDescription")}</p>
      <p>{t("aboutStack")}</p>
      <p className="text-[10px] text-brew-gray/60">
        {t("aboutMadeWith")}
      </p>
    </div>
  );
}
