import type { LlmProvider } from "./settings";

/** Tous les modes d'actions IA disponibles */
export type AiMode =
  | "braindump"     // Brain dump → taches (existant)
  | "decompose"     // Decomposer une tache complexe
  | "planner"       // Planifier la journee
  | "bilan"         // Bilan quotidien/hebdo
  | "coach"         // Conseils personnalises
  | "draft"         // Rediger un brouillon
  | "categorize"    // Auto-categoriser une tache
  | "focusBrief"    // Mini-brief pour un pomodoro
  | "inbox"         // Traiter un dump inbox/emails
  | "overload"      // Detecter la surcharge
  | "chat"          // Rubber duck / conversation libre
  | "estimate"      // Auto-estimation pomodoros
  | "weeklyReview"  // Revue hebdomadaire
  | "chooseForMe";  // Choix anti-paralysie TDAH

/** Message dans une conversation IA */
export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** Mode qui a genere ce message */
  mode?: AiMode;
}

/** Conversation IA complete */
export interface AiConversation {
  id: string;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

/** Requete unifiee vers /api/ai */
export interface AiRequest {
  mode: AiMode;
  /** Texte principal (input utilisateur ou contexte) */
  content: string;
  /** Contexte supplementaire (taches, sessions, etc.) */
  context?: string;
  /** Historique de conversation (pour chat/rubber duck) */
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
  /** Config LLM */
  provider: LlmProvider;
  apiKey: string;
  model?: string;
  ollamaUrl?: string;
}

/** Reponse structuree de /api/ai */
export interface AiResponse {
  mode: AiMode;
  /** Texte brut de la reponse (pour chat, bilan, coach, draft) */
  text?: string;
  /** Taches generees (pour braindump, decompose, planner, inbox) */
  tasks?: Array<{
    title: string;
    category: string;
    priority: string;
    deadline?: string;
    description?: string;
    estimatedPomodoros?: number;
  }>;
  /** Items parking lot */
  parkingLot?: string[];
  /** Categorie auto-detectee (pour categorize) */
  detectedCategory?: string;
  detectedPriority?: string;
  /** Brief de focus */
  brief?: string;
  /** Plan de journee */
  plan?: Array<{
    taskId?: string;
    title: string;
    suggestedPomodoros: number;
    order: number;
    reason?: string;
  }>;
}
