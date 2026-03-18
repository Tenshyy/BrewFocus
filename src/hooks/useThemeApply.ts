"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { CAFE_THEMES } from "@/lib/themes";

/**
 * Applies the selected cafe theme by setting CSS custom properties
 * on the document root element. This drives all Tailwind `brew-*`
 * color tokens in real time.
 */
export function useThemeApply() {
  const theme = useThemeStore((s) => s.selectedTheme);

  useEffect(() => {
    const def = CAFE_THEMES[theme];
    if (!def) return;

    const root = document.documentElement.style;
    const c = def.colors;

    root.setProperty("--color-brew-bg", c.bg);
    root.setProperty("--color-brew-panel", c.panel);
    root.setProperty("--color-brew-border", c.border);
    root.setProperty("--color-brew-orange", c.orange);
    root.setProperty("--color-brew-orange-glow", c.orangeGlow);
    root.setProperty("--color-brew-orange-dim", c.orangeDim);
    root.setProperty("--color-brew-cream", c.cream);
    root.setProperty("--color-brew-cream-dim", c.creamDim);
    root.setProperty("--color-brew-gray", c.gray);
    root.setProperty("--color-brew-coffee-dark", c.coffeeDark);
    root.setProperty("--color-brew-coffee-mid", c.coffeeMid);
    root.setProperty("--color-brew-coffee-light", c.coffeeLight);
  }, [theme]);
}
