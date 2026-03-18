"use client";

import { useEffect, useRef } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useBrainDumpStore } from "@/stores/brainDumpStore";
import { useProjectStore } from "@/stores/projectStore";
import { useRitualStore } from "@/stores/ritualStore";

interface ServerData {
  tasks?: unknown[];
  sessions?: unknown[];
  settings?: Record<string, unknown>;
  braindump?: { history?: unknown[]; parkingItems?: unknown[] };
  projects?: unknown[];
  ritual?: Record<string, unknown>;
  lastModified?: string;
}

function gatherState(): ServerData {
  const { tasks } = useTaskStore.getState();
  const { sessions } = useSessionStore.getState();
  const { timerConfig, llmConfig, soundEnabled, notificationsEnabled, cafeOpacity } =
    useSettingsStore.getState();
  const { history, parkingItems } = useBrainDumpStore.getState();
  const { projects, activeProjectId } = useProjectStore.getState();
  const { lastVisit, dismissedDate, onboardingCompleted } = useRitualStore.getState();

  return {
    tasks,
    sessions,
    settings: { timerConfig, llmConfig, soundEnabled, notificationsEnabled, cafeOpacity },
    braindump: { history, parkingItems },
    projects: projects.map((p) => ({ ...p, activeProjectId })),
    ritual: { lastVisit, dismissedDate, onboardingCompleted },
  };
}

/**
 * Syncs all store data to/from the server JSON file.
 * - On mount: loads server data if it has newer lastModified
 * - On changes: debounced PUT to server (3s delay)
 * - Offline-first: if server is unreachable, localStorage is the fallback
 */
export function useServerSync() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  // Save current state to server (debounced)
  function saveToServer() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const state = gatherState();
        await fetch("/api/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
      } catch {
        // Offline — localStorage is the fallback
      }
    }, 3000);
  }

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // On mount: try to load from server
    (async () => {
      try {
        const res = await fetch("/api/data");
        if (!res.ok) return;
        const data: ServerData = await res.json();

        // If server has data, hydrate stores
        if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          const localTasks = useTaskStore.getState().tasks;
          // Only hydrate from server if local is empty (first visit / cleared storage)
          if (localTasks.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            useTaskStore.setState({ tasks: data.tasks as any });
          }
        }

        if (data.sessions && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const localSessions = useSessionStore.getState().sessions;
          if (localSessions.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            useSessionStore.setState({ sessions: data.sessions as any });
          }
        }

        if (data.braindump) {
          const local = useBrainDumpStore.getState();
          if (local.history.length === 0 && data.braindump.history?.length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            useBrainDumpStore.setState({ history: data.braindump.history as any });
          }
          if (local.parkingItems.length === 0 && data.braindump.parkingItems?.length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            useBrainDumpStore.setState({ parkingItems: data.braindump.parkingItems as any });
          }
        }
      } catch {
        // Server unreachable — use localStorage only
      }
    })();

    // Subscribe to store changes to trigger saves
    const unsubs = [
      useTaskStore.subscribe(saveToServer),
      useSessionStore.subscribe(saveToServer),
      useSettingsStore.subscribe(saveToServer),
      useBrainDumpStore.subscribe(saveToServer),
      useProjectStore.subscribe(saveToServer),
      useRitualStore.subscribe(saveToServer),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
