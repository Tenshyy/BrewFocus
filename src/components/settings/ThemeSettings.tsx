"use client";

import { useTranslations } from "next-intl";
import { useThemeStore } from "@/stores/themeStore";
import { CAFE_THEMES } from "@/lib/themes";
import type { CafeTheme } from "@/types/theme";

const THEME_IDS: CafeTheme[] = ["parisien", "japonais", "nordique", "urbain"];

export default function ThemeSettings() {
  const t = useTranslations("settings");
  const selectedTheme = useThemeStore((s) => s.selectedTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {THEME_IDS.map((id) => {
          const theme = CAFE_THEMES[id];
          const isActive = id === selectedTheme;
          const c = theme.colors;

          return (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-brew-orange bg-brew-orange/10"
                  : "border-brew-border hover:border-brew-gray"
              }`}
            >
              {/* Color preview: 5 swatches */}
              <div className="flex gap-1">
                {[c.bg, c.panel, c.orange, c.cream, c.coffeeMid].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-sm border border-black/20"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>

              {/* Theme name */}
              <span
                className={`text-[10px] font-bold uppercase tracking-[2px] ${
                  isActive ? "text-brew-orange" : "text-brew-gray"
                }`}
              >
                {t(theme.labelKey)}
              </span>

              {/* Radio indicator */}
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isActive
                    ? "border-brew-orange bg-brew-orange"
                    : "border-brew-gray"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
