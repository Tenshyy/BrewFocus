"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAiStore } from "@/stores/aiStore";
import { useTranslations, useLocale } from "next-intl";
import type { AiMode } from "@/types/ai";

interface AiActionOptions {
  content: string;
  context?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  mode: AiMode;
}

/**
 * Hook pour appeler l'API AI de maniere uniforme.
 * Gere le loading, les erreurs et la config LLM automatiquement.
 */
export function useAiAction() {
  const { setLoading, setError } = useAiStore.getState();
  const te = useTranslations("errors");
  const locale = useLocale();

  const callAi = useCallback(async <T = Record<string, unknown>>(
    options: AiActionOptions
  ): Promise<T | null> => {
    const { llmConfig } = useSettingsStore.getState();

    if (llmConfig.provider !== "ollama" && llmConfig.provider !== "demo" && !llmConfig.apiKey) {
      useAiStore.getState().setError(te("apiKeyMissing"));
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: options.mode,
          content: options.content,
          context: options.context,
          messages: options.messages,
          locale,
          provider: llmConfig.provider,
          apiKey: llmConfig.apiKey,
          model: llmConfig.model,
          ollamaUrl: llmConfig.ollamaUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || te("serverError", { status: res.status }));
      }

      const data = await res.json();
      return data as T;
    } catch (err) {
      const msg = err instanceof Error ? err.message : te("unknown");
      useAiStore.getState().setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, te, locale]);

  return { callAi };
}
