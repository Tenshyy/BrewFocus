"use client";

import { useEffect } from "react";
import Card from "@/components/ui/Card";
import BrainDumpTextarea from "./BrainDumpTextarea";
import TransformButton from "./TransformButton";
import VoiceButton from "./VoiceButton";
import { useTranslations, useLocale } from "next-intl";
import { useBrainDumpStore } from "@/stores/brainDumpStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useFeatureEnabled } from "@/components/ui/FeatureGate";

interface BrainDumpCardProps {
  onTransform: () => void;
}

export default function BrainDumpCard({ onTransform }: BrainDumpCardProps) {
  const error = useBrainDumpStore((s) => s.error);
  const setText = useBrainDumpStore((s) => s.setText);
  const currentText = useBrainDumpStore((s) => s.currentText);
  const isDemo = useSettingsStore((s) => s.llmConfig.provider === "demo");
  const t = useTranslations("braindump");
  const locale = useLocale();
  const voiceEnabled = useFeatureEnabled("voiceInput");
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } =
    useVoiceInput(locale);

  // Quand la transcription change, ajouter au texte existant
  useEffect(() => {
    if (transcript) {
      setText(currentText ? `${currentText} ${transcript}` : transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  function handleVoiceToggle() {
    if (isListening) {
      stopListening();
      resetTranscript();
    } else {
      startListening();
    }
  }

  return (
    <Card animated>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-brew-orange">
          <span aria-hidden="true">▪ </span>{t("title")}<span aria-hidden="true"> ▪</span>
        </h2>
        {isSupported && voiceEnabled && (
          <VoiceButton isListening={isListening} onClick={handleVoiceToggle} />
        )}
      </div>
      {isDemo && (
        <p className="text-[9px] text-brew-orange/80 bg-brew-orange/10 rounded px-2 py-1 mb-2">
          {t("demoBanner")}
        </p>
      )}
      <BrainDumpTextarea />
      <TransformButton onClick={onTransform} />
      {error && (
        <p className="text-[11px] text-red-400 mt-2">{error}</p>
      )}
    </Card>
  );
}
