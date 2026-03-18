"use client";

import { useState } from "react";
import { useAiStore } from "@/stores/aiStore";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useAiAction } from "@/hooks/useAiAction";
import { useTranslations, useLocale } from "next-intl";
import { computeStreak, computeTotalFocus, computeTaskStats } from "@/lib/stats";
import { buildCalibrationData } from "@/lib/ai/calibration";
import Button from "@/components/ui/Button";
import LucideIcon from "@/components/ui/LucideIcon";
import type { AiMode } from "@/types/ai";
import type { Task, TaskCategory, TaskPriority } from "@/types/task";

const contextLabels = {
  fr: {
    currentTasks: "Taches en cours",
    created: "cree",
    recentlyDone: "Taches completees recemment",
    completed: "completee",
    stats: "Stats",
    streakDays: "jours de streak",
    pomodorosTotal: "pomodoros total",
    focusHours: "h de focus",
    tasksDone: "taches faites",
    calibrationHeader: "--- Calibration estimation ---",
  },
  en: {
    currentTasks: "Current tasks",
    created: "created",
    recentlyDone: "Recently completed tasks",
    completed: "completed",
    stats: "Stats",
    streakDays: "day streak",
    pomodorosTotal: "total pomodoros",
    focusHours: "h focus",
    tasksDone: "tasks done",
    calibrationHeader: "--- Estimation calibration ---",
  },
} as const;

/** Genere le contexte des taches et sessions pour les modes qui en ont besoin */
function buildTaskContext(locale: string): string {
  const l = contextLabels[locale as keyof typeof contextLabels] || contextLabels.en;
  const { tasks } = useTaskStore.getState();
  const { sessions } = useSessionStore.getState();

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const streak = computeStreak(sessions);
  const focus = computeTotalFocus(sessions);
  const taskStats = computeTaskStats(tasks);

  let ctx = `${l.currentTasks} (${todoTasks.length}):\n`;
  todoTasks.forEach((t) => {
    ctx += `- [${t.id}] "${t.title}" (${t.category}, ${t.priority}${t.deadline ? `, deadline: ${t.deadline}` : ""}, ${l.created}: ${t.createdAt.split("T")[0]})\n`;
  });

  ctx += `\n${l.recentlyDone} (${Math.min(doneTasks.length, 10)}):\n`;
  doneTasks.slice(0, 10).forEach((t) => {
    ctx += `- "${t.title}" (${t.category}, ${l.completed}: ${t.completedAt?.split("T")[0] || "?"})\n`;
  });

  ctx += `\n${l.stats}: ${streak} ${l.streakDays}, ${focus.totalSessions} ${l.pomodorosTotal}, ${focus.totalHours}${l.focusHours}, ${taskStats.done}/${taskStats.total} ${l.tasksDone} (${taskStats.rate}%)`;

  // Inject calibration context for estimation accuracy
  const calibration = buildCalibrationData(tasks, sessions, locale);
  if (calibration.sampleSize > 0) {
    ctx += `\n\n${l.calibrationHeader}\n${calibration.promptContext}`;
  }

  return ctx;
}

interface ModeConfig {
  icon: string;
  titleKey: string;
  placeholderKey: string;
  buttonKey: string;
  needsInput: boolean;
  needsContext: boolean;
}

const MODE_CONFIGS: Partial<Record<AiMode, ModeConfig>> = {
  decompose: {
    icon: "puzzle",
    titleKey: "decomposeTitle",
    placeholderKey: "decomposePlaceholder",
    buttonKey: "decomposeButton",
    needsInput: true,
    needsContext: false,
  },
  planner: {
    icon: "clipboard-list",
    titleKey: "plannerTitle",
    placeholderKey: "plannerPlaceholder",
    buttonKey: "plannerButton",
    needsInput: false,
    needsContext: true,
  },
  bilan: {
    icon: "bar-chart",
    titleKey: "bilanTitle",
    placeholderKey: "bilanPlaceholder",
    buttonKey: "bilanButton",
    needsInput: false,
    needsContext: true,
  },
  coach: {
    icon: "target",
    titleKey: "coachTitle",
    placeholderKey: "coachPlaceholder",
    buttonKey: "coachButton",
    needsInput: false,
    needsContext: true,
  },
  draft: {
    icon: "pen-line",
    titleKey: "draftTitle",
    placeholderKey: "draftPlaceholder",
    buttonKey: "draftButton",
    needsInput: true,
    needsContext: false,
  },
  inbox: {
    icon: "mail-open",
    titleKey: "inboxTitle",
    placeholderKey: "inboxPlaceholder",
    buttonKey: "inboxButton",
    needsInput: true,
    needsContext: false,
  },
  overload: {
    icon: "scale",
    titleKey: "overloadTitle",
    placeholderKey: "overloadPlaceholder",
    buttonKey: "overloadButton",
    needsInput: false,
    needsContext: true,
  },
  focusBrief: {
    icon: "flower",
    titleKey: "focusBriefTitle",
    placeholderKey: "focusBriefPlaceholder",
    buttonKey: "focusBriefButton",
    needsInput: true,
    needsContext: false,
  },
  weeklyReview: {
    icon: "calendar",
    titleKey: "weeklyReviewTitle",
    placeholderKey: "weeklyReviewPlaceholder",
    buttonKey: "weeklyReviewButton",
    needsInput: false,
    needsContext: true,
  },
};

export default function AiActionView() {
  const activeMode = useAiStore((s) => s.activeMode);
  const isLoading = useAiStore((s) => s.isLoading);
  const error = useAiStore((s) => s.error);
  const { callAi } = useAiAction();
  const t = useTranslations("ai");
  const locale = useLocale();

  const [input, setInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const config = MODE_CONFIGS[activeMode];
  if (!config) return null;

  async function handleAction() {
    if (config!.needsInput && !input.trim()) return;

    const context = config!.needsContext ? buildTaskContext(locale) : undefined;
    const content = input.trim() || (config!.needsContext ? (locale === "fr" ? "Analyse mes donnees." : "Analyze my data.") : "");

    const data = await callAi({
      mode: activeMode,
      content,
      context,
    });

    if (data) {
      setResult(data);

      if (activeMode === "bilan") {
        useAiStore.getState().setBilan(data as Record<string, unknown>);
      } else if (activeMode === "planner") {
        useAiStore.getState().setPlan(data as Record<string, unknown>);
      } else if (activeMode === "coach") {
        useAiStore.getState().setCoach(data as Record<string, unknown>);
      } else if (activeMode === "focusBrief" && (data as Record<string, unknown>).brief) {
        useAiStore.getState().setBrief(data as { brief: string; firstAction: string });
      } else if (activeMode === "weeklyReview") {
        useAiStore.getState().setWeeklyReview(data as Record<string, unknown>);
      }
    }
  }

  function handleAddTasks(tasks: Array<{ title: string; category?: string; priority?: string; deadline?: string; estimatedPomodoros?: number }>, parentId?: string) {
    const { addTasks } = useTaskStore.getState();
    addTasks(
      tasks.map((tk) => ({
        title: tk.title,
        category: (tk.category as TaskCategory) || "travail",
        priority: (tk.priority as TaskPriority) || "moyenne",
        deadline: tk.deadline || undefined,
        estimatedPomodoros: tk.estimatedPomodoros,
        parentId,
        source: activeMode as Task["source"],
      }))
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-brew-border">
        <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-orange">
          <LucideIcon name={config.icon} size={12} className="inline-block mr-1" />{t(config.titleKey)}
        </h3>
      </div>

      {/* Input */}
      <div className="px-3 py-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(config.placeholderKey)}
          rows={config.needsInput ? 4 : 2}
          className="w-full bg-brew-bg border border-brew-border rounded-md px-2.5 py-2 text-[11px] text-brew-cream placeholder:text-brew-gray/50 outline-none focus:border-brew-orange/50 resize-none font-mono"
        />
        <Button
          onClick={handleAction}
          disabled={isLoading || (config.needsInput && !input.trim())}
          className="w-full mt-2"
          size="sm"
        >
          {isLoading ? t("loading") : t(config.buttonKey)}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3">
          <p className="text-[10px] text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
          <ResultDisplay mode={activeMode} data={result} onAddTasks={handleAddTasks} />
        </div>
      )}
    </div>
  );
}

/** Affiche le resultat selon le mode */
function ResultDisplay({
  mode,
  data,
  onAddTasks,
}: {
  mode: AiMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onAddTasks: (tasks: Array<{ title: string; category?: string; priority?: string; deadline?: string; estimatedPomodoros?: number }>, parentId?: string) => void;
}) {
  const t = useTranslations("ai");

  if (mode === "decompose" && data.subtasks) {
    return (
      <div className="space-y-2">
        {data.tip && (
          <p className="text-[10px] text-brew-orange italic">{data.tip}</p>
        )}
        {data.subtasks.map((st: { title: string; estimatedPomodoros?: number; order: number }, i: number) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-brew-bg border border-brew-border rounded-md px-2 py-1.5"
            style={{ animation: `slideIn 0.3s ease ${i * 0.05}s both` }}
          >
            <span className="text-[9px] text-brew-gray w-4">{st.order || i + 1}.</span>
            <span className="flex-1 text-[11px] text-brew-cream">{st.title}</span>
            {st.estimatedPomodoros && (
              <span className="text-[9px] text-brew-orange">{st.estimatedPomodoros}p.</span>
            )}
          </div>
        ))}
        <Button size="sm" onClick={() => onAddTasks(data.subtasks)} className="w-full">
          {t("addAsTasks")}
        </Button>
      </div>
    );
  }

  if (mode === "planner" && data.plan) {
    return (
      <div className="space-y-2">
        {data.motivation && (
          <p className="text-[10px] text-brew-orange italic">{data.motivation}</p>
        )}
        {data.plan.map((item: { title: string; suggestedPomodoros: number; reason?: string; order: number }, i: number) => (
          <div
            key={i}
            className="bg-brew-bg border border-brew-border rounded-md px-2 py-1.5"
            style={{ animation: `slideIn 0.3s ease ${i * 0.05}s both` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-brew-orange font-bold">{item.order || i + 1}</span>
              <span className="flex-1 text-[11px] text-brew-cream">{item.title}</span>
              <span className="text-[9px] text-brew-orange">{item.suggestedPomodoros}p.</span>
            </div>
            {item.reason && (
              <p className="text-[9px] text-brew-gray mt-0.5 ml-5">{item.reason}</p>
            )}
          </div>
        ))}
        {data.totalPomodoros && (
          <p className="text-[9px] text-brew-gray text-center">{t("totalPomodoros", { count: data.totalPomodoros })}</p>
        )}
      </div>
    );
  }

  if (mode === "bilan") {
    return (
      <div className="space-y-3">
        {data.summary && (
          <p className="text-[11px] text-brew-cream leading-relaxed">{data.summary}</p>
        )}
        {data.highlights?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-orange uppercase tracking-[1px] mb-1">{t("strengths")}</p>
            {data.highlights.map((h: string, i: number) => (
              <p key={i} className="text-[10px] text-brew-cream">✦ {h}</p>
            ))}
          </div>
        )}
        {data.insight && (
          <p className="text-[10px] text-brew-gray italic">{data.insight}</p>
        )}
        {data.encouragement && (
          <p className="text-[10px] text-brew-orange">{data.encouragement}</p>
        )}
        {data.exportText && (
          <div className="mt-2">
            <button
              onClick={() => navigator.clipboard.writeText(data.exportText)}
              className="text-[9px] text-brew-gray hover:text-brew-cream underline cursor-pointer"
            >
              {t("copyBilan")}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (mode === "coach") {
    return (
      <div className="space-y-3">
        {data.celebration && (
          <p className="text-[10px] text-brew-orange">{data.celebration}</p>
        )}
        {data.observations?.map((o: string, i: number) => (
          <p key={i} className="text-[10px] text-brew-cream">· {o}</p>
        ))}
        {data.tips?.map((tip: { title: string; detail: string }, i: number) => (
          <div key={i} className="bg-brew-bg border border-brew-border rounded-md px-2 py-1.5">
            <p className="text-[10px] font-bold text-brew-cream">{tip.title}</p>
            <p className="text-[9px] text-brew-gray">{tip.detail}</p>
          </div>
        ))}
      </div>
    );
  }

  if (mode === "draft") {
    return (
      <div className="space-y-2">
        {data.subject && (
          <p className="text-[9px] text-brew-gray">{t("subject")} <span className="text-brew-cream">{data.subject}</span></p>
        )}
        <div className="bg-brew-bg border border-brew-border rounded-md px-3 py-2">
          <pre className="text-[10px] text-brew-cream whitespace-pre-wrap font-mono leading-relaxed">
            {data.draft}
          </pre>
        </div>
        {data.notes && (
          <p className="text-[9px] text-brew-gray italic">{data.notes}</p>
        )}
        <button
          onClick={() => navigator.clipboard.writeText(data.draft)}
          className="text-[9px] text-brew-orange hover:text-brew-orange-glow underline cursor-pointer"
        >
          {t("copyDraft")}
        </button>
      </div>
    );
  }

  if (mode === "inbox" && data.actions) {
    return (
      <div className="space-y-3">
        {data.summary && (
          <p className="text-[10px] text-brew-gray italic">{data.summary}</p>
        )}
        {data.actions.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-orange uppercase tracking-[1px] mb-1">
              {t("actions", { count: data.actions.length })}
            </p>
            {data.actions.map((a: { title: string; category?: string; priority?: string; source?: string }, i: number) => (
              <div key={i} className="text-[10px] text-brew-cream py-0.5">
                ▸ {a.title} <span className="text-brew-gray">({a.category})</span>
              </div>
            ))}
            <Button size="sm" onClick={() => onAddTasks(data.actions)} className="w-full mt-2">
              {t("addActions")}
            </Button>
          </div>
        )}
        {data.info?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-gray uppercase tracking-[1px] mb-1">
              {t("infos", { count: data.info.length })}
            </p>
            {data.info.map((info: string, i: number) => (
              <p key={i} className="text-[9px] text-brew-gray">{info}</p>
            ))}
          </div>
        )}
        {data.ignored > 0 && (
          <p className="text-[9px] text-brew-gray">{t("ignored", { count: data.ignored })}</p>
        )}
      </div>
    );
  }

  if (mode === "overload") {
    return (
      <div className="space-y-3">
        {data.message && (
          <p className="text-[10px] text-brew-cream leading-relaxed">{data.message}</p>
        )}
        {data.keepNow?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-orange uppercase tracking-[1px] mb-1">
              {t("keepNow", { count: data.keepNow.length })}
            </p>
            {data.keepNow.map((k: { taskId: string; reason: string }, i: number) => (
              <p key={i} className="text-[10px] text-brew-cream py-0.5">▸ {k.reason}</p>
            ))}
          </div>
        )}
        {data.deferSuggestions?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-gray uppercase tracking-[1px] mb-1">
              {t("canWait", { count: data.deferSuggestions.length })}
            </p>
            {data.deferSuggestions.map((d: { taskId: string; reason: string }, i: number) => (
              <p key={i} className="text-[9px] text-brew-gray py-0.5">· {d.reason}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mode === "focusBrief") {
    return (
      <div className="space-y-2">
        {data.brief && (
          <div className="bg-brew-orange/10 border border-brew-orange/30 rounded-md px-3 py-2">
            <pre className="text-[11px] text-brew-cream whitespace-pre-wrap font-mono leading-relaxed">
              {data.brief}
            </pre>
          </div>
        )}
        {data.firstAction && (
          <p className="text-[10px] text-brew-orange">
            ▸ {t("firstAction")} {data.firstAction}
          </p>
        )}
      </div>
    );
  }

  if (mode === "weeklyReview") {
    return (
      <div className="space-y-3">
        {/* Summary */}
        {data.summary && (
          <div className="bg-brew-bg border border-brew-border rounded-md px-3 py-2">
            <p className="text-[11px] text-brew-cream leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Wins */}
        {data.wins?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-orange uppercase tracking-[1px] mb-1">
              {t("weeklyWins")}
            </p>
            {data.wins.map((w: string, i: number) => (
              <p key={i} className="text-[10px] text-brew-cream py-0.5">✦ {w}</p>
            ))}
          </div>
        )}

        {/* Challenges */}
        {data.challenges?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-[1px] mb-1">
              {t("weeklyChallenges")}
            </p>
            {data.challenges.map((c: string, i: number) => (
              <p key={i} className="text-[10px] text-brew-cream py-0.5">· {c}</p>
            ))}
          </div>
        )}

        {/* Insights */}
        {data.insights?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-gray uppercase tracking-[1px] mb-1">
              {t("weeklyInsights")}
            </p>
            {data.insights.map((ins: string, i: number) => (
              <p key={i} className="text-[10px] text-brew-gray py-0.5">· {ins}</p>
            ))}
          </div>
        )}

        {/* Next week focus */}
        {data.nextWeekFocus?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-cream uppercase tracking-[1px] mb-1">
              {t("weeklyNextWeek")}
            </p>
            {data.nextWeekFocus.map((f: string, i: number) => (
              <p key={i} className="text-[10px] text-brew-cream py-0.5">▸ {f}</p>
            ))}
          </div>
        )}

        {/* Action items */}
        {data.actionItems?.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-brew-orange uppercase tracking-[1px] mb-1">
              {t("weeklyActions")}
            </p>
            {data.actionItems.map((a: { title: string; category?: string; priority?: string }, i: number) => (
              <div key={i} className="text-[10px] text-brew-cream py-0.5">
                ▸ {a.title} <span className="text-brew-gray">({a.category})</span>
              </div>
            ))}
            <Button size="sm" onClick={() => onAddTasks(data.actionItems)} className="w-full mt-2">
              {t("addWeeklyActions")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Fallback: texte brut
  if (data.text) {
    return (
      <div className="bg-brew-bg border border-brew-border rounded-md px-3 py-2">
        <p className="text-[11px] text-brew-cream whitespace-pre-wrap leading-relaxed">{data.text}</p>
      </div>
    );
  }

  return null;
}
