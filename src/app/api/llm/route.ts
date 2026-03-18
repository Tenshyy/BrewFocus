import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt } from "@/lib/llm/prompt";
import { callLlm, parseJsonResponse } from "@/lib/ai/providers";
import { generateDemoResponse } from "@/lib/ai/demoResponses";
import { sanitizeLocale, localizedError, validateApiKey, detectErrorStatus } from "@/lib/api/helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText, provider, apiKey, model, ollamaUrl, calibrationContext, locale = "fr" } = body;

    const l = sanitizeLocale(locale);

    if (!rawText?.trim()) {
      return NextResponse.json(
        { error: localizedError(l, "Le texte du brain dump est vide.", "Brain dump text is empty.") },
        { status: 400 }
      );
    }

    // Demo mode — return mock responses without API key
    if (provider === "demo") {
      const demo = generateDemoResponse(rawText, l);
      return NextResponse.json(demo);
    }

    const apiKeyError = validateApiKey(provider, apiKey, l);
    if (apiKeyError) return apiKeyError;

    // Inject calibration context into system prompt if available
    let systemPrompt = getSystemPrompt(l);
    if (calibrationContext && typeof calibrationContext === "string") {
      systemPrompt += `\n\n--- CALIBRATION ---\n${calibrationContext}`;
    }

    const responseText = await callLlm({
      systemPrompt,
      userMessage: rawText,
      provider,
      apiKey,
      model,
      ollamaUrl,
      maxTokens: 1024,
    });

    const parsed = parseJsonResponse<{ tasks: unknown[]; parkingLot: string[] }>(responseText);
    return NextResponse.json({
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      parkingLot: Array.isArray(parsed.parkingLot) ? parsed.parkingLot : [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: detectErrorStatus(message) });
  }
}
