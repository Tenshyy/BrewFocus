"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useBrainDumpStore } from "@/stores/brainDumpStore";

interface TransformButtonProps {
  onClick: () => void;
}

export default function TransformButton({ onClick }: TransformButtonProps) {
  const currentText = useBrainDumpStore((s) => s.currentText);
  const isLoading = useBrainDumpStore((s) => s.isLoading);
  const t = useTranslations("braindump");

  return (
    <Button
      variant="primary"
      disabled={!currentText.trim() || isLoading}
      onClick={onClick}
      className="w-full mt-2.5"
    >
      {isLoading ? (
        <span style={{ animation: "pulse 1s ease infinite" }}>
          {t("analyzing")}
        </span>
      ) : (
        t("transform")
      )}
    </Button>
  );
}
