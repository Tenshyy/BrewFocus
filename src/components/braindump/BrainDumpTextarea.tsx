"use client";

import { useTranslations } from "next-intl";
import { useBrainDumpStore } from "@/stores/brainDumpStore";

export default function BrainDumpTextarea() {
  const currentText = useBrainDumpStore((s) => s.currentText);
  const setText = useBrainDumpStore((s) => s.setText);
  const t = useTranslations("braindump");

  return (
    <textarea
      value={currentText}
      onChange={(e) => setText(e.target.value)}
      placeholder={t("placeholder")}
      className="w-full min-h-[100px] resize-y bg-brew-bg border border-brew-border rounded-md p-3 text-[13px] leading-[1.6] text-brew-cream placeholder:text-brew-gray focus:outline-2 focus:outline-brew-orange focus:outline-offset-1 font-mono"
    />
  );
}
