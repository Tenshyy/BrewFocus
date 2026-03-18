"use client";

import Card from "@/components/ui/Card";
import SteamParticles from "./SteamParticles";
import CoffeeCup from "./CoffeeCup";
import TimerDisplay from "./TimerDisplay";
import TimerProgressBar from "./TimerProgressBar";
import TimerControls from "./TimerControls";
import MiniCups from "./MiniCups";
import ActiveTaskSlot from "./ActiveTaskSlot";
import { useTimer } from "@/hooks/useTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function PomodoroCard() {
  useTimer();
  useKeyboardShortcuts();

  return (
    <Card animated className="flex flex-col items-center py-8 px-8">
      <SteamParticles />
      <CoffeeCup />
      <TimerDisplay />
      <TimerProgressBar />
      <ActiveTaskSlot />
      <TimerControls />
      <MiniCups />
    </Card>
  );
}
