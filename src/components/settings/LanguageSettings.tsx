"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function LanguageSettings() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: string) {
    // Replace current locale segment in path
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/") || `/${newLocale}`;
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.push(newPath);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
          {t("tabLanguage")}
        </label>
        <select
          value={locale}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
        >
          <option value="fr">Francais</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}
