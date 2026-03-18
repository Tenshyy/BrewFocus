"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSettingsStore } from "@/stores/settingsStore";
import type { LlmProvider } from "@/types/settings";
import Button from "@/components/ui/Button";

export default function LlmSettings() {
  const t = useTranslations("settings");
  const te = useTranslations("errors");
  const locale = useLocale();
  const llmConfig = useSettingsStore((s) => s.llmConfig);
  const setLlmConfig = useSettingsStore((s) => s.setLlmConfig);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testError, setTestError] = useState("");

  async function handleTest() {
    setTestStatus("testing");
    setTestError("");
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: t("testPrompt"),
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
      setTestStatus("success");
    } catch (err) {
      setTestStatus("error");
      setTestError(err instanceof Error ? err.message : te("connectionError"));
    }
  }

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
          {t("provider")}
        </label>
        <select
          value={llmConfig.provider}
          onChange={(e) =>
            setLlmConfig({ provider: e.target.value as LlmProvider })
          }
          className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
        >
          <option value="demo">{t("demoOption")}</option>
          <option value="groq">{t("groqOption")}</option>
          <option value="anthropic">{t("anthropicOption")}</option>
          <option value="openai">{t("openaiOption")}</option>
          <option value="ollama">{t("ollamaOption")}</option>
        </select>
        {llmConfig.provider === "demo" && (
          <p className="text-[9px] text-brew-gray mt-1">
            {t("demoHelp")}
          </p>
        )}
        {llmConfig.provider === "groq" && (
          <p className="text-[9px] text-brew-gray mt-1">
            {t("groqHelp")}{" "}
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-brew-orange underline">
              console.groq.com/keys
            </a>
          </p>
        )}
      </div>

      {/* API Key */}
      {llmConfig.provider !== "ollama" && llmConfig.provider !== "demo" && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
            {t("apiKey")}
          </label>
          <input
            type="password"
            value={llmConfig.apiKey}
            onChange={(e) => setLlmConfig({ apiKey: e.target.value })}
            placeholder={
              llmConfig.provider === "anthropic"
                ? "sk-ant-..."
                : llmConfig.provider === "groq"
                ? "gsk_..."
                : "sk-..."
            }
            className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
          />
        </div>
      )}

      {/* Model */}
      {llmConfig.provider !== "demo" && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
            {t("modelOptional")}
          </label>
          <input
            type="text"
            value={llmConfig.model || ""}
            onChange={(e) => setLlmConfig({ model: e.target.value || undefined })}
            placeholder={
              llmConfig.provider === "anthropic"
                ? "claude-haiku-4-5-20251001"
                : llmConfig.provider === "openai"
                ? "gpt-4o-mini"
                : llmConfig.provider === "groq"
                ? "llama-3.3-70b-versatile"
                : "llama3"
            }
            className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
          />
        </div>
      )}

      {/* Ollama URL */}
      {llmConfig.provider === "ollama" && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
            {t("ollamaUrl")}
          </label>
          <input
            type="text"
            value={llmConfig.ollamaUrl || ""}
            onChange={(e) =>
              setLlmConfig({ ollamaUrl: e.target.value || undefined })
            }
            placeholder="http://localhost:11434"
            className="w-full bg-brew-bg border border-brew-border rounded-md px-3 py-1.5 text-[13px] text-brew-cream font-mono focus:outline-2 focus:outline-brew-orange"
          />
        </div>
      )}

      {/* Test connection */}
      {llmConfig.provider !== "demo" && (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTest}
            disabled={testStatus === "testing"}
          >
            {testStatus === "testing" ? t("testing") : t("testConnection")}
          </Button>
          {testStatus === "success" && (
            <span className="text-cat-perso text-[11px]">✓ {t("connected")}</span>
          )}
          {testStatus === "error" && (
            <span className="text-red-400 text-[11px]">{testError}</span>
          )}
        </div>
      )}
    </div>
  );
}
