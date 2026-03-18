"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MotionConfig } from "motion/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/layout/AppShell";
import PomodoroCard from "@/components/pomodoro/PomodoroCard";
import BrainDumpCard from "@/components/braindump/BrainDumpCard";
import TaskListCard from "@/components/tasks/TaskListCard";
import { useBrainDumpStore } from "@/stores/brainDumpStore";
import { useTaskStore } from "@/stores/taskStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { buildCalibrationData } from "@/lib/ai/calibration";
import { useAiStore } from "@/stores/aiStore";
import { useRitualStore } from "@/stores/ritualStore";
import { useHydration } from "@/hooks/useHydration";
import { useReminders } from "@/hooks/useReminders";
import { useAutoBackup } from "@/hooks/useAutoBackup";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useTranslations, useLocale } from "next-intl";
import { useServerSync } from "@/hooks/useServerSync";
import { useThemeApply } from "@/hooks/useThemeApply";
import { useAmbianceAudio } from "@/hooks/useAmbianceAudio";
import SettingsModal from "@/components/settings/SettingsModal";
import StatsPanel from "@/components/stats/StatsPanel";
import AiSidebar from "@/components/ai/AiSidebar";
import MorningRitual from "@/components/ritual/MorningRitual";
import ToastContainer from "@/components/ui/ToastContainer";
import InstallBanner from "@/components/pwa/InstallBanner";
import BaristaBuddy from "@/components/barista/BaristaBuddy";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import CommandPalette from "@/components/command/CommandPalette";
import DailyProgress from "@/components/gamification/DailyProgress";
import FocusView from "@/components/tasks/FocusView";
import PostPomodoroTransition from "@/components/pomodoro/PostPomodoroTransition";
import { useTimerStore } from "@/stores/timerStore";
import { useFeatureStore } from "@/stores/featureStore";
import { useFeatureEnabled } from "@/components/ui/FeatureGate";
import { buildCommands, type CommandCallbacks } from "@/lib/commands";
import FeatureErrorBoundary from "@/components/ui/FeatureErrorBoundary";
import type { AiMode } from "@/types/ai";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hydrated = useHydration();
  const lastVisit = useRitualStore((s) => s.lastVisit);
  const dismissedDate = useRitualStore((s) => s.dismissedDate);
  const onboardingCompleted = useRitualStore((s) => s.onboardingCompleted);
  const tb = useTranslations("braindump");
  const te = useTranslations("errors");
  const locale = useLocale();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Feature flags
  const timerEnabled = useFeatureEnabled("timer");
  const brainDumpEnabled = useFeatureEnabled("brainDump");
  const aiEnabled = useFeatureEnabled("ai");
  const statsEnabled = useFeatureEnabled("stats");
  const morningRitualEnabled = useFeatureEnabled("morningRitual");
  const commandPaletteEnabled = useFeatureEnabled("commandPalette");
  const baristaEnabled = useFeatureEnabled("barista");
  const gamificationEnabled = useFeatureEnabled("gamification");
  const focusViewEnabled = useFeatureEnabled("focusView");

  // Activate smart reminders, auto-backup, PWA service worker, server sync & theme
  useReminders();
  useAutoBackup();
  useServiceWorker();
  useServerSync();
  useThemeApply();
  useAmbianceAudio();

  // ⌘P / Ctrl+P shortcut to toggle command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        if (!useFeatureStore.getState().features.commandPalette) return;
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Build command palette callbacks (stable because they use .getState())
  const commandCallbacks: CommandCallbacks = useMemo(() => ({
    startTimer: () => {
      const { status, start, pause } = useTimerStore.getState();
      if (status === "running") pause();
      else start();
    },
    pauseTimer: () => useTimerStore.getState().pause(),
    resetTimer: () => {
      const { focusDuration } = useSettingsStore.getState().timerConfig;
      useTimerStore.getState().reset(focusDuration);
    },
    setPreset: (focus: number, brk: number) => {
      useSettingsStore.getState().setTimerConfig({
        focusDuration: focus,
        breakDuration: brk,
      });
      useTimerStore.getState().reset(focus);
    },
    addTask: () => {
      const input = document.querySelector<HTMLInputElement>("[data-task-input]");
      if (input) input.focus();
    },
    setListView: () =>
      window.dispatchEvent(new CustomEvent("brewfocus:setViewMode", { detail: "list" })),
    setMatrixView: () =>
      window.dispatchEvent(new CustomEvent("brewfocus:setViewMode", { detail: "matrix" })),
    openAiMode: (mode: string) =>
      useAiStore.getState().openSidebar(mode as AiMode),
    transformBraindump: () => handleTransform(),
    toggleStats: () => window.dispatchEvent(new Event("brewfocus:toggleStats")),
    scrollToTop: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    scrollToStats: () => {
      const el = document.getElementById("stats-panel");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    openSettings: () => setSettingsOpen(true),
    toggleSound: () => {
      const { soundEnabled, setSoundEnabled } = useSettingsStore.getState();
      setSoundEnabled(!soundEnabled);
    },
    switchLanguage: () => {
      const segments = window.location.pathname.split("/");
      const currentLocale = segments[1];
      const nextLocale = currentLocale === "fr" ? "en" : "fr";
      segments[1] = nextLocale;
      document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
      window.location.pathname = segments.join("/") || `/${nextLocale}`;
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const featureFlags = useFeatureStore((s) => s.features);
  const commands = useMemo(() => {
    const all = buildCommands(commandCallbacks);
    return all.filter((cmd) => !cmd.requiredFeature || featureFlags[cmd.requiredFeature]);
  }, [commandCallbacks, featureFlags]);

  async function handleTransform() {
    const { currentText, setLoading, setError, saveToHistory, addParkingItems, clearCurrent } =
      useBrainDumpStore.getState();
    const { addTasks, tasks: allTasks } = useTaskStore.getState();
    const { sessions } = useSessionStore.getState();
    const { llmConfig } = useSettingsStore.getState();
    const calibration = buildCalibrationData(allTasks, sessions, locale);

    if (!currentText.trim()) return;

    if (llmConfig.provider !== "ollama" && llmConfig.provider !== "demo" && !llmConfig.apiKey) {
      setError(tb("apiKeyMissing"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: currentText,
          locale,
          provider: llmConfig.provider,
          apiKey: llmConfig.apiKey,
          model: llmConfig.model,
          ollamaUrl: llmConfig.ollamaUrl,
          calibrationContext: calibration.promptContext,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || te("serverError", { status: res.status }));
      }

      const data = await res.json();

      // Add tasks with source and estimation from LLM
      if (data.tasks?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addTasks(data.tasks.map((t: any) => ({
          ...t,
          source: "braindump" as const,
        })));
      }

      // Add parking items
      if (data.parkingLot?.length) {
        addParkingItems(
          data.parkingLot.map((text: string) => ({
            id: crypto.randomUUID(),
            text,
            createdAt: new Date().toISOString(),
          }))
        );
      }

      // Save to history
      saveToHistory({
        id: crypto.randomUUID(),
        rawText: currentText,
        createdAt: new Date().toISOString(),
        taskIds: [],
        parkingItems: [],
      });

      clearCurrent();
    } catch (err) {
      setError(err instanceof Error ? err.message : te("unknown"));
    } finally {
      setLoading(false);
    }
  }

  const leftContent = timerEnabled ? (
    <FeatureErrorBoundary featureName="Timer">
      <PomodoroCard />
    </FeatureErrorBoundary>
  ) : null;
  const rightContent = (
    <>
      {brainDumpEnabled && (
        <FeatureErrorBoundary featureName="Brain Dump">
          <BrainDumpCard onTransform={handleTransform} />
        </FeatureErrorBoundary>
      )}
      <FeatureErrorBoundary featureName="Tasks">
        <TaskListCard />
      </FeatureErrorBoundary>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {hydrated && !onboardingCompleted && lastVisit === null && <OnboardingOverlay />}
      {hydrated && morningRitualEnabled && (() => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        return dismissedDate !== todayStr && (lastVisit === null || lastVisit !== todayStr);
      })() && <MorningRitual />}
      <Header
        onSettingsClick={() => setSettingsOpen((o) => !o)}
        onAiClick={() => useAiStore.getState().toggleSidebar()}
        showAiButton={aiEnabled}
      />
      <main id="main-content" className="flex-1 relative z-10">
        <AppShell
          left={leftContent}
          right={rightContent}
        />
        {gamificationEnabled && (
          <FeatureErrorBoundary featureName="Gamification">
            <DailyProgress />
          </FeatureErrorBoundary>
        )}
        {focusViewEnabled && (
          <FeatureErrorBoundary featureName="Focus View">
            <FocusView />
          </FeatureErrorBoundary>
        )}
        {statsEnabled && (
          <FeatureErrorBoundary featureName="Stats">
            <StatsPanel />
          </FeatureErrorBoundary>
        )}
      </main>
      <Footer />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      {aiEnabled && (
        <FeatureErrorBoundary featureName="AI Sidebar">
          <AiSidebar />
        </FeatureErrorBoundary>
      )}
      {timerEnabled && <PostPomodoroTransition />}
      <ToastContainer />
      <InstallBanner />
      {baristaEnabled && (
        <FeatureErrorBoundary featureName="Barista">
          <BaristaBuddy />
        </FeatureErrorBoundary>
      )}
      {commandPaletteEnabled && (
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          commands={commands}
        />
      )}
    </div>
    </MotionConfig>
  );
}
