import type { LlmProvider } from "@/types/settings";

export interface LlmCallOptions {
  systemPrompt: string;
  userMessage: string;
  provider: LlmProvider;
  apiKey: string;
  model?: string;
  ollamaUrl?: string;
  /** Messages precedents (pour le mode conversationnel) */
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
}

// Cached SDK imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _AnthropicSDK: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _OpenAISDK: any;

async function getAnthropicSDK() {
  if (!_AnthropicSDK) _AnthropicSDK = (await import("@anthropic-ai/sdk")).default;
  return _AnthropicSDK;
}

async function getOpenAISDK() {
  if (!_OpenAISDK) _OpenAISDK = (await import("openai")).default;
  return _OpenAISDK;
}

/**
 * Appelle le LLM via le provider configure.
 * Fonction generique utilisee par toutes les routes AI.
 */
export async function callLlm(options: LlmCallOptions): Promise<string> {
  const { provider, systemPrompt, userMessage, apiKey, model, ollamaUrl, history, maxTokens = 1500 } = options;

  switch (provider) {
    case "anthropic":
      return callAnthropic(systemPrompt, userMessage, apiKey, model, history, maxTokens);
    case "openai":
      return callOpenAI(systemPrompt, userMessage, apiKey, model, history, maxTokens);
    case "groq":
      return callGroq(systemPrompt, userMessage, apiKey, model, history, maxTokens);
    case "ollama":
      return callOllama(systemPrompt, userMessage, model, ollamaUrl, history, maxTokens);
    default:
      throw new Error(`Provider inconnu: ${provider}`);
  }
}

async function callAnthropic(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model?: string,
  history?: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens = 1500
): Promise<string> {
  const Anthropic = await getAnthropicSDK();
  const client = new Anthropic({ apiKey });

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  if (history?.length) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: userMessage });

  const response = await client.messages.create({
    model: model || "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  if (block.type === "text") return block.text;
  throw new Error("Reponse Anthropic invalide");
}

async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model?: string,
  history?: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens = 1500
): Promise<string> {
  const OpenAI = await getOpenAISDK();
  const client = new OpenAI({ apiKey });

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  if (history?.length) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: userMessage });

  const response = await client.chat.completions.create({
    model: model || "gpt-4o-mini",
    messages,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || "";
}

async function callGroq(
  systemPrompt: string,
  userMessage: string,
  apiKey: string,
  model?: string,
  history?: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens = 1500
): Promise<string> {
  // Groq uses OpenAI-compatible API with a different base URL
  const OpenAI = await getOpenAISDK();
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  if (history?.length) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: userMessage });

  const response = await client.chat.completions.create({
    model: model || "llama-3.3-70b-versatile",
    messages,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || "";
}

async function callOllama(
  systemPrompt: string,
  userMessage: string,
  model?: string,
  ollamaUrl?: string,
  history?: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens = 1500
): Promise<string> {
  const url = ollamaUrl || "http://localhost:11434";

  // Ollama chat API pour supporter l'historique
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];
  if (history?.length) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: userMessage });

  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || "llama3",
      messages,
      stream: false,
      options: { num_predict: maxTokens },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama erreur: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || data.response || "";
}

/**
 * Parse une reponse JSON du LLM (gere les blocs markdown)
 */
export function parseJsonResponse<T = Record<string, unknown>>(text: string): T {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error("Impossible de parser la reponse du LLM en JSON.");
  }
}
