"use client";

import { useTranslations } from "next-intl";

export default function TaskEmptyState() {
  const t = useTranslations("tasks");
  return (
    <div className="text-center py-6">
      <p className="text-brew-gray text-[12px]">
        {t("empty")}
        <br />
        {t("emptyHint")}
      </p>
    </div>
  );
}
