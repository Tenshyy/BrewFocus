import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project } from "@/types/task";
import { STORAGE_KEYS, PROJECT_COLORS } from "@/lib/constants";

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  setActiveProject: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      addProject: (name) =>
        set((state) => {
          const color =
            PROJECT_COLORS[state.projects.length % PROJECT_COLORS.length];
          return {
            projects: [
              ...state.projects,
              {
                id: crypto.randomUUID(),
                name,
                color,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
        })),

      renameProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    {
      name: STORAGE_KEYS.projects,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
