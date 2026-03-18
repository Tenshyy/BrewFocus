import { useSettingsStore } from "@/stores/settingsStore";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { buildCalibrationData } from "@/lib/ai/calibration";

/**
 * Fire-and-forget: estimate pomodoros for a task via AI, then update it.
 * Non-blocking: returns immediately, updates the store when the response arrives.
 * Fails silently on errors — estimation is a nice-to-have, not critical.
 */
export async function autoEstimateTask(taskId: string): Promise<void> {
  const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
  if (!task) return;

  // Skip if already estimated
  if (task.estimatedPomodoros && task.estimatedPomodoros > 0) return;

  const { llmConfig } = useSettingsStore.getState();
  if (llmConfig.provider !== "ollama" && !llmConfig.apiKey) return;

  const { tasks } = useTaskStore.getState();
  const { sessions } = useSessionStore.getState();
  // Detect locale from URL path (e.g., /fr/... or /en/...)
  const locale = typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "fr";
  const calibration = buildCalibrationData(tasks, sessions, locale);

  const isFr = locale === "fr";
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "estimate",
        locale,
        content: isFr
          ? `Tache: "${task.title}" (categorie: ${task.category}, priorite: ${task.priority}${task.description ? `, description: ${task.description}` : ""})`
          : `Task: "${task.title}" (category: ${task.category}, priority: ${task.priority}${task.description ? `, description: ${task.description}` : ""})`,
        context: calibration.promptContext,
        provider: llmConfig.provider,
        apiKey: llmConfig.apiKey,
        model: llmConfig.model,
        ollamaUrl: llmConfig.ollamaUrl,
      }),
    });

    if (!res.ok) return;
    const data = await res.json();

    if (
      data.estimatedPomodoros &&
      typeof data.estimatedPomodoros === "number" &&
      data.estimatedPomodoros > 0
    ) {
      useTaskStore.getState().updateTask(taskId, {
        estimatedPomodoros: Math.min(data.estimatedPomodoros, 8),
      });
    }
  } catch {
    // Silent fail: estimation is non-blocking
  }
}
