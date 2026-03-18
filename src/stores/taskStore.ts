import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task, TaskCategory, TaskPriority, TaskSource, TaskRecurrence } from "@/types/task";
import { STORAGE_KEYS } from "@/lib/constants";

interface NewTaskInput {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: string;
  parentId?: string;
  description?: string;
  estimatedPomodoros?: number;
  source?: TaskSource;
  projectId?: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: NewTaskInput) => string;
  addTasks: (tasks: NewTaskInput[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  getSubtasks: (parentId: string) => Task[];
  reorderTasks: (orderedIds: string[]) => void;
  setRecurrence: (id: string, recurrence: TaskRecurrence | undefined) => void;
}

const getMaxOrder = (tasks: Task[]) =>
  tasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        const id = crypto.randomUUID();
        set((state) => {
          return {
            tasks: [
              ...state.tasks,
              {
                ...task,
                id,
                status: "todo",
                createdAt: new Date().toISOString(),
                order: getMaxOrder(state.tasks) + 1,
              },
            ],
          };
        });
        return id;
      },

      addTasks: (tasks) =>
        set((state) => {
          let nextOrder = getMaxOrder(state.tasks) + 1;
          return {
            tasks: [
              ...state.tasks,
              ...tasks.map((t) => ({
                ...t,
                id: crypto.randomUUID(),
                status: "todo" as const,
                createdAt: new Date().toISOString(),
                order: nextOrder++,
              })),
            ],
          };
        }),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      toggleTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const isCompleting = task.status === "todo";
          const updatedTasks = state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: (isCompleting ? "done" : "todo") as Task["status"],
                  completedAt: isCompleting ? new Date().toISOString() : undefined,
                }
              : t
          );

          // Auto-clone recurring task when completing
          if (isCompleting && task.recurrence) {
            const maxOrder = getMaxOrder(updatedTasks);
            updatedTasks.push({
              id: crypto.randomUUID(),
              title: task.title,
              category: task.category,
              priority: task.priority,
              status: "todo",
              createdAt: new Date().toISOString(),
              estimatedPomodoros: task.estimatedPomodoros,
              source: task.source,
              projectId: task.projectId,
              recurrence: task.recurrence,
              order: maxOrder + 1,
            });
          }

          return { tasks: updatedTasks };
        }),

      getSubtasks: (parentId) =>
        get().tasks.filter((t) => t.parentId === parentId),

      reorderTasks: (orderedIds) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            const idx = orderedIds.indexOf(t.id);
            return idx >= 0 ? { ...t, order: idx } : t;
          }),
        })),

      setRecurrence: (id, recurrence) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, recurrence } : t
          ),
        })),
    }),
    {
      name: STORAGE_KEYS.tasks,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persisted as any;
        if (version === 0 && state?.tasks) {
          // Assign order to existing tasks that don't have one
          state.tasks = state.tasks.map((t: Task, i: number) => ({
            ...t,
            order: t.order ?? i,
          }));
        }
        return state;
      },
    }
  )
);
