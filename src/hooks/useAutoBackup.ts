import { useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { autoBackup } from "@/lib/backup";

/**
 * Declenche une sauvegarde automatique throttled
 * quand les taches ou sessions changent.
 */
export function useAutoBackup() {
  useEffect(() => {
    const unsubTasks = useTaskStore.subscribe(() => autoBackup());
    const unsubSessions = useSessionStore.subscribe(() => autoBackup());
    return () => {
      unsubTasks();
      unsubSessions();
    };
  }, []);
}
