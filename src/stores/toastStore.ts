import { create } from "zustand";

export interface ToastItem {
  id: string;
  message: string;
  icon: string;
  createdAt: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, icon: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  addToast: (message, icon) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id, message, icon, createdAt: Date.now() },
      ],
    }));
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}));
