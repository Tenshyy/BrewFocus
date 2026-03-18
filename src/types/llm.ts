import type { TaskCategory, TaskPriority } from "./task";
import type { LlmProvider } from "./settings";

export interface LlmTaskOutput {
  tasks: Array<{
    title: string;
    category: TaskCategory;
    priority: TaskPriority;
    deadline?: string;
  }>;
  parkingLot: string[];
}

export interface LlmRequest {
  rawText: string;
  provider: LlmProvider;
  apiKey: string;
  model?: string;
  ollamaUrl?: string;
}
