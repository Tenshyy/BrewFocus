import { STORAGE_KEYS, APP_VERSION } from "./constants";

export interface BackupData {
  version: string;
  exportedAt: string;
  stores: Record<string, unknown>;
}

const BACKUP_KEY = "brewfocus-backup-auto";
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

let lastAutoBackup = 0;

/**
 * Exporte toutes les donnees persistees dans localStorage.
 */
export function exportAllData(): BackupData {
  const stores: Record<string, unknown> = {};

  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        stores[name] = JSON.parse(raw);
      }
    } catch {
      // Skip corrupted entries
    }
  }

  return {
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    stores,
  };
}

/**
 * Importe des donnees depuis un fichier backup.
 * - "replace" : ecrase tout
 * - "merge" : concatene tasks/sessions, remplace le reste
 */
export function importData(
  data: BackupData,
  mode: "merge" | "replace"
): { success: boolean; message: string } {
  if (!data || !data.stores || typeof data.stores !== "object" || Array.isArray(data.stores)) {
    return { success: false, message: "Format de fichier invalide." };
  }

  // Only allow known store keys
  const validKeys = new Set(Object.keys(STORAGE_KEYS));
  for (const key of Object.keys(data.stores)) {
    if (!validKeys.has(key)) {
      return { success: false, message: `Cle inconnue dans le backup: ${key}` };
    }
  }

  try {
    if (mode === "replace") {
      // Write each store directly
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        if (data.stores[name] !== undefined) {
          const value = data.stores[name];
          if (typeof value !== "object" || value === null) continue;
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } else {
      // Merge: concatenate arrays for tasks and sessions, replace rest
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        if (data.stores[name] === undefined) continue;

        if (name === "tasks" || name === "sessions") {
          const existing = parseStoreData(key);
          const incoming = data.stores[name] as { state?: { tasks?: unknown[]; sessions?: unknown[] } };

          if (existing?.state && incoming?.state) {
            const arrayKey = name === "tasks" ? "tasks" : "sessions";
            const existingItems = (existing.state as Record<string, unknown[]>)[arrayKey] || [];
            const incomingItems = (incoming.state as Record<string, unknown[]>)[arrayKey] || [];

            // Deduplicate by id
            const existingIds = new Set(
              existingItems.map((item: unknown) => (item as { id: string }).id)
            );
            const newItems = incomingItems.filter(
              (item: unknown) => !existingIds.has((item as { id: string }).id)
            );

            existing.state = {
              ...existing.state,
              [arrayKey]: [...existingItems, ...newItems],
            };
            localStorage.setItem(key, JSON.stringify(existing));
          }
        } else {
          localStorage.setItem(key, JSON.stringify(data.stores[name]));
        }
      }
    }

    return {
      success: true,
      message:
        mode === "replace"
          ? "Donnees restaurees. Rechargement..."
          : "Donnees fusionnees. Rechargement...",
    };
  } catch (err) {
    return {
      success: false,
      message: `Erreur d'import: ${err instanceof Error ? err.message : "inconnue"}`,
    };
  }
}

/**
 * Telecharge les donnees en fichier JSON.
 */
export function downloadBackup(): void {
  const data = exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `brewfocus-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sauvegarde automatique throttled (max 1x / 5 min).
 */
export function autoBackup(): void {
  const now = Date.now();
  if (now - lastAutoBackup < THROTTLE_MS) return;
  lastAutoBackup = now;

  try {
    const data = exportAllData();
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
    localStorage.setItem("brewfocus-backup-timestamp", new Date().toISOString());
  } catch {
    // Silently ignore if localStorage is full
  }
}

/**
 * Retourne le timestamp de la derniere sauvegarde auto.
 */
export function getLastBackupTimestamp(): string | null {
  return localStorage.getItem("brewfocus-backup-timestamp");
}

// ── Internal helpers ─────────────────────────────────

function parseStoreData(key: string): { state?: Record<string, unknown> } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
