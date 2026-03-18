import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AiMessage, AiMode, AiConversation } from "@/types/ai";
import { STORAGE_KEYS } from "@/lib/constants";

interface AiState {
  /** Sidebar ouverte/fermee */
  sidebarOpen: boolean;
  /** Mode actif dans le sidebar */
  activeMode: AiMode;
  /** Conversation en cours (rubber duck chat) */
  conversation: AiConversation | null;
  /** Historique des conversations */
  conversationHistory: AiConversation[];
  /** Etat de chargement global */
  isLoading: boolean;
  /** Erreur */
  error: string | null;
  /** Dernier bilan genere */
  lastBilan: Record<string, unknown> | null;
  /** Dernier plan genere */
  lastPlan: Record<string, unknown> | null;
  /** Dernier resultat coach */
  lastCoach: Record<string, unknown> | null;
  /** Focus brief actif */
  activeBrief: { brief: string; firstAction: string } | null;
  /** Derniere revue hebdomadaire */
  lastWeeklyReview: Record<string, unknown> | null;

  // Actions
  toggleSidebar: () => void;
  openSidebar: (mode?: AiMode) => void;
  closeSidebar: () => void;
  setActiveMode: (mode: AiMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Conversation
  startConversation: (title: string) => void;
  addMessage: (message: Omit<AiMessage, "id" | "createdAt">) => void;
  clearConversation: () => void;

  // Results
  setBilan: (bilan: Record<string, unknown>) => void;
  setPlan: (plan: Record<string, unknown>) => void;
  setCoach: (coach: Record<string, unknown>) => void;
  setBrief: (brief: { brief: string; firstAction: string } | null) => void;
  setWeeklyReview: (review: Record<string, unknown>) => void;
}

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeMode: "chat",
      conversation: null,
      conversationHistory: [],
      isLoading: false,
      error: null,
      lastBilan: null,
      lastPlan: null,
      lastCoach: null,
      activeBrief: null,
      lastWeeklyReview: null,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openSidebar: (mode) =>
        set({ sidebarOpen: true, ...(mode ? { activeMode: mode } : {}) }),
      closeSidebar: () => set({ sidebarOpen: false }),
      setActiveMode: (mode) => set({ activeMode: mode, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      startConversation: (title) =>
        set({
          conversation: {
            id: crypto.randomUUID(),
            title,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          error: null,
        }),

      addMessage: (msg) =>
        set((s) => {
          if (!s.conversation) return s;
          const newMsg: AiMessage = {
            ...msg,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };
          return {
            conversation: {
              ...s.conversation,
              messages: [...s.conversation.messages, newMsg],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      clearConversation: () =>
        set((s) => ({
          conversation: null,
          // Sauvegarder dans l'historique si > 2 messages
          conversationHistory:
            s.conversation && s.conversation.messages.length > 2
              ? [s.conversation, ...s.conversationHistory].slice(0, 20)
              : s.conversationHistory,
        })),

      setBilan: (bilan) => set({ lastBilan: bilan }),
      setPlan: (plan) => set({ lastPlan: plan }),
      setCoach: (coach) => set({ lastCoach: coach }),
      setBrief: (brief) => set({ activeBrief: brief }),
      setWeeklyReview: (review) => set({ lastWeeklyReview: review }),
    }),
    {
      name: STORAGE_KEYS.ai,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversationHistory: state.conversationHistory,
        lastBilan: state.lastBilan,
        lastPlan: state.lastPlan,
        lastCoach: state.lastCoach,
        lastWeeklyReview: state.lastWeeklyReview,
      }),
    }
  )
);
