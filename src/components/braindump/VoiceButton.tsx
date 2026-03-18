"use client";

import { useTranslations } from "next-intl";

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
}

export default function VoiceButton({ isListening, onClick }: VoiceButtonProps) {
  const t = useTranslations("braindump");
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-[1px] transition-all duration-200 cursor-pointer ${
        isListening
          ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
          : "text-brew-gray hover:text-brew-cream border border-transparent hover:border-brew-border"
      }`}
      aria-label={isListening ? t("stopRecording") : t("dictate")}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill={isListening ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isListening ? (
          <>
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        ) : (
          <>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
      {isListening ? t("stop") : t("voice")}
    </button>
  );
}
