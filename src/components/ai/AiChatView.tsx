"use client";

import { useState, useRef, useEffect } from "react";
import { useAiStore } from "@/stores/aiStore";
import { useAiAction } from "@/hooks/useAiAction";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import LucideIcon from "@/components/ui/LucideIcon";

export default function AiChatView() {
  const conversation = useAiStore((s) => s.conversation);
  const isLoading = useAiStore((s) => s.isLoading);
  const addMessage = useAiStore((s) => s.addMessage);
  const startConversation = useAiStore((s) => s.startConversation);
  const clearConversation = useAiStore((s) => s.clearConversation);
  const { callAi } = useAiAction();
  const t = useTranslations("ai");

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages.length]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    if (!conversation) {
      startConversation(text.slice(0, 50));
    }

    addMessage({ role: "user", content: text, mode: "chat" });
    setInput("");

    const currentConv = useAiStore.getState().conversation;
    const history = (currentConv?.messages || [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const result = await callAi<{ text?: string }>({
      mode: "chat",
      content: text,
      messages: history.slice(-10),
    });

    if (result?.text) {
      addMessage({ role: "assistant", content: result.text, mode: "chat" });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
        {!conversation?.messages.length && (
          <div className="text-center py-8">
            <LucideIcon name="bird" size={28} />
            <p className="text-[11px] text-brew-gray mt-2">
              {t("chatIntro")}<br />
              {t("chatIntro2")}
            </p>
          </div>
        )}
        {conversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-brew-orange/15 text-brew-cream"
                  : "bg-brew-bg border border-brew-border text-brew-cream"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-brew-bg border border-brew-border rounded-lg px-3 py-2 text-[11px] text-brew-gray animate-pulse">
              {t("thinking")}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-brew-border p-2">
        {conversation && conversation.messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="text-[11px] text-brew-gray hover:text-brew-cream mb-1.5 cursor-pointer"
          >
            {t("newConversation")}
          </button>
        )}
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("inputPlaceholder")}
            disabled={isLoading}
            className="flex-1 bg-brew-bg border border-brew-border rounded-md px-2.5 py-1.5 text-[11px] text-brew-cream placeholder:text-brew-gray/50 outline-none focus:border-brew-orange/50 font-mono"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            ▸
          </Button>
        </div>
      </div>
    </div>
  );
}
