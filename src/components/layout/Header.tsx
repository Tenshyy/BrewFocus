"use client";

import { useTranslations } from "next-intl";
import IconButton from "@/components/ui/IconButton";

interface HeaderProps {
  onSettingsClick: () => void;
  onAiClick: () => void;
  showAiButton?: boolean;
}

export default function Header({ onSettingsClick, onAiClick, showAiButton = true }: HeaderProps) {
  const t = useTranslations("common");
  const th = useTranslations("header");
  return (
    <header className="text-center py-6 relative z-10">
      <h1 className="text-[28px] font-bold uppercase tracking-[6px] text-brew-orange drop-shadow-[0_0_30px_rgba(224,122,58,0.27)]">
        BREWFOCUS
      </h1>
      <p className="text-[11px] uppercase tracking-[3px] text-brew-gray mt-1">
        {t("tagline")}
      </p>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {showAiButton && (
          <IconButton
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 2L11 7H16L12 10.5L13.5 16L9 12.5L4.5 16L6 10.5L2 7H7L9 2Z" />
              </svg>
            }
            onClick={onAiClick}
            ariaLabel={th("openAi")}
          />
        )}
        <IconButton
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="9" r="3" />
              <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" />
            </svg>
          }
          onClick={onSettingsClick}
          ariaLabel={th("openSettings")}
        />
      </div>
    </header>
  );
}
