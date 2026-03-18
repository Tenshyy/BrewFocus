import { NextResponse } from "next/server";

/** Sanitize locale to supported values */
export function sanitizeLocale(locale: string | undefined): "en" | "fr" {
  return locale === "en" ? "en" : "fr";
}

/** Return localized error string */
export function localizedError(l: "en" | "fr", fr: string, en: string): string {
  return l === "fr" ? fr : en;
}

/** Validate API key — returns error response if missing, null if OK */
export function validateApiKey(
  provider: string,
  apiKey: string | undefined,
  l: "en" | "fr"
): NextResponse | null {
  if (provider !== "ollama" && !apiKey) {
    return NextResponse.json(
      {
        error: localizedError(
          l,
          "Cle API manquante. Configurez-la dans les parametres.",
          "API key missing. Configure it in settings."
        ),
      },
      { status: 400 }
    );
  }
  return null;
}

/** Detect error HTTP status from error message */
export function detectErrorStatus(message: string): number {
  return message.includes("401") || message.includes("auth") ? 401 : 500;
}
