export type TaskCategory = "admin" | "perso" | "travail" | "idée";
export type TaskPriority = "haute" | "moyenne" | "basse";
export type TaskStatus = "todo" | "done";

export type TaskSource =
  | "braindump"
  | "manual"
  | "decompose"
  | "planner"
  | "inbox"
  | "anticipator";

export interface TaskRecurrence {
  type: "daily" | "weekly" | "custom";
  /** Custom: every N days */
  interval?: number;
  /** Weekly: 0=Dim..6=Sam */
  daysOfWeek?: number[];
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  /** ID de la tache parente (pour sous-taches) */
  parentId?: string;
  /** Description detaillee / notes / brouillon IA */
  description?: string;
  /** Estimation en nombre de pomodoros */
  estimatedPomodoros?: number;
  /** Origine de la tache */
  source?: TaskSource;
  /** ID du projet associe */
  projectId?: string;
  /** Ordre d'affichage pour le drag & drop */
  order?: number;
  /** Configuration de recurrence */
  recurrence?: TaskRecurrence;
  /** Marque la tache comme urgente (pour matrice Eisenhower) */
  isUrgent?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ParkingItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface BrainDump {
  id: string;
  rawText: string;
  createdAt: string;
  taskIds: string[];
  parkingItems: ParkingItem[];
}
