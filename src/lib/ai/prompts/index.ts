export { getDecomposePrompt } from "./decompose";
export { getPlannerPrompt } from "./planner";
export { getBilanPrompt } from "./bilan";
export { getCoachPrompt } from "./coach";
export { getDraftPrompt } from "./draft";
export { getFocusBriefPrompt } from "./focusBrief";
export { getInboxPrompt } from "./inbox";
export { getOverloadPrompt } from "./overload";
export { getChatPrompt } from "./chat";
export { getEstimatePrompt } from "./estimate";
export { getWeeklyReviewPrompt } from "./weeklyReview";
export { getChooseForMePrompt } from "./chooseForMe";

// Re-export le prompt existant du brain dump
export { getSystemPrompt as getBraindumpPrompt } from "@/lib/llm/prompt";

import type { AiMode } from "@/types/ai";
import { getSystemPrompt } from "@/lib/llm/prompt";
import { getDecomposePrompt } from "./decompose";
import { getPlannerPrompt } from "./planner";
import { getBilanPrompt } from "./bilan";
import { getCoachPrompt } from "./coach";
import { getDraftPrompt } from "./draft";
import { getFocusBriefPrompt } from "./focusBrief";
import { getInboxPrompt } from "./inbox";
import { getOverloadPrompt } from "./overload";
import { getChatPrompt } from "./chat";
import { getEstimatePrompt } from "./estimate";
import { getWeeklyReviewPrompt } from "./weeklyReview";
import { getChooseForMePrompt } from "./chooseForMe";

/** Map mode → prompt systeme (locale-aware) */
export const AI_PROMPTS: Record<AiMode, (locale: string) => string> = {
  braindump: getSystemPrompt,
  decompose: getDecomposePrompt,
  planner: getPlannerPrompt,
  bilan: getBilanPrompt,
  coach: getCoachPrompt,
  draft: getDraftPrompt,
  focusBrief: getFocusBriefPrompt,
  inbox: getInboxPrompt,
  overload: getOverloadPrompt,
  categorize: getSystemPrompt,
  chat: getChatPrompt,
  estimate: getEstimatePrompt,
  weeklyReview: getWeeklyReviewPrompt,
  chooseForMe: getChooseForMePrompt,
};
