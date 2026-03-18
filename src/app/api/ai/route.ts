import { NextRequest, NextResponse } from "next/server";
import { callLlm, parseJsonResponse } from "@/lib/ai/providers";
import { AI_PROMPTS } from "@/lib/ai/prompts";
import { generateDemoAiResponse } from "@/lib/ai/demoResponses";
import { sanitizeLocale, localizedError, validateApiKey, detectErrorStatus } from "@/lib/api/helpers";
import type { AiMode } from "@/types/ai";

const JSON_MODES: AiMode[] = [
  "braindump", "decompose", "planner", "bilan", "coach",
  "draft", "focusBrief", "inbox", "overload", "categorize", "estimate",
  "weeklyReview", "chooseForMe",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode,
      content,
      context,
      messages: history,
      locale = "fr",
      provider,
      apiKey,
      model,
      ollamaUrl,
    } = body;

    const l = sanitizeLocale(locale);

    // Validation du mode
    if (!mode || !AI_PROMPTS[mode as AiMode]) {
      return NextResponse.json(
        { error: localizedError(l, `Mode IA inconnu: ${mode}`, `Unknown AI mode: ${mode}`) },
        { status: 400 }
      );
    }

    // Validation du contenu
    if (!content?.trim() && !history?.length) {
      return NextResponse.json(
        { error: localizedError(l, "Contenu vide.", "Empty content.") },
        { status: 400 }
      );
    }

    // Demo mode — return mock responses without API key
    if (provider === "demo") {
      const demo = generateDemoAiResponse(mode, content || "", l);
      return NextResponse.json(demo);
    }

    // Validation API key
    const apiKeyError = validateApiKey(provider, apiKey, l);
    if (apiKeyError) return apiKeyError;

    const systemPrompt = AI_PROMPTS[mode as AiMode](l);

    // Construire le message utilisateur avec contexte optionnel
    let userMessage = content || "";
    if (context) {
      userMessage = `${l === "fr" ? "Contexte" : "Context"}:\n${context}\n\n---\n\n${userMessage}`;
    }

    const responseText = await callLlm({
      systemPrompt,
      userMessage,
      provider,
      apiKey,
      model,
      ollamaUrl,
      history,
      maxTokens: mode === "estimate" ? 300 : mode === "chooseForMe" ? 400 : mode === "chat" ? 800 : mode === "bilan" ? 2000 : mode === "weeklyReview" ? 2500 : 1500,
    });

    // Pour le chat, retourner du texte brut
    if (mode === "chat") {
      return NextResponse.json({
        mode,
        text: responseText,
      });
    }

    // Pour les autres modes, parser le JSON
    if (JSON_MODES.includes(mode as AiMode)) {
      try {
        const parsed = parseJsonResponse(responseText);
        return NextResponse.json({
          mode,
          ...parsed,
        });
      } catch {
        // Si le JSON parse echoue, retourner le texte brut quand meme
        return NextResponse.json({
          mode,
          text: responseText,
        });
      }
    }

    return NextResponse.json({ mode, text: responseText });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: detectErrorStatus(message) });
  }
}
