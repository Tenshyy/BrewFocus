import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "brewfocus.json");

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    // File doesn't exist or is invalid — return empty
    return NextResponse.json({});
  }
}

const ALLOWED_TOP_KEYS = new Set([
  "tasks", "sessions", "settings", "projects", "features",
  "theme", "ai", "lastModified", "version",
]);

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body structure
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Body must be a JSON object" },
        { status: 400 }
      );
    }

    // Reject unknown top-level keys
    for (const key of Object.keys(body)) {
      if (!ALLOWED_TOP_KEYS.has(key)) {
        return NextResponse.json(
          { error: `Unknown key: ${key}` },
          { status: 400 }
        );
      }
    }

    body.lastModified = new Date().toISOString();
    await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur ecriture";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
