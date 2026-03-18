"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTaskStore } from "@/stores/taskStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useThemeStore } from "@/stores/themeStore";
import { CAFE_THEMES } from "@/lib/themes";
import LucideIcon from "@/components/ui/LucideIcon";
import { useTranslations } from "next-intl";

import type { BaristaState, BaristaColors, BaristaScene } from "./baristaTypes";
import { W, H, FPS } from "./baristaTypes";
import { createInitialScene, updateBaristaScene } from "./baristaState";
import { updateClients } from "./baristaNpc";
import { renderScene } from "./baristaRenderer";

export default function BaristaBuddy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const lastTimeRef = useRef(0);
  const sceneRef = useRef<BaristaScene>(createInitialScene());
  const colorsRef = useRef<BaristaColors>({ ...CAFE_THEMES.parisien.baristaColors });
  const [celebratingUntil, setCelebratingUntil] = useState(0);
  const prevTaskCountRef = useRef(-1);
  const cafeOpacity = useSettingsStore((s) => s.cafeOpacity);
  const tb = useTranslations("barista");
  const hidden = cafeOpacity === 0;

  // Sync palette with active theme
  const selectedTheme = useThemeStore((s) => s.selectedTheme);
  useEffect(() => {
    const def = CAFE_THEMES[selectedTheme];
    if (def) Object.assign(colorsRef.current, def.baristaColors);
  }, [selectedTheme]);

  // Celebrate on task completion
  useEffect(() => {
    const unsub = useTaskStore.subscribe((state) => {
      const doneCount = state.tasks.filter((t) => t.status === "done").length;
      if (prevTaskCountRef.current >= 0 && doneCount > prevTaskCountRef.current) {
        setCelebratingUntil(Date.now() + 2500);
      }
      prevTaskCountRef.current = doneCount;
    });
    return unsub;
  }, []);

  const getState = useCallback((): BaristaState => {
    if (Date.now() < celebratingUntil) return "celebrating";
    const timer = useTimerStore.getState();
    if (timer.status === "running") {
      return timer.sessionType === "focus" ? "brewing" : "serving";
    }
    if (timer.status === "paused") return "paused";
    return "idle";
  }, [celebratingUntil]);

  // Main render loop
  useEffect(() => {
    if (hidden) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    function draw(time: number) {
      if (!ctx) return;
      const elapsed = time - lastTimeRef.current;
      if (elapsed > 1000 / FPS) {
        lastTimeRef.current = time;

        // Update scene
        let scene = updateBaristaScene(sceneRef.current, getState);
        scene = updateClients(scene, colorsRef.current);
        sceneRef.current = scene;

        // Render
        renderScene(ctx, scene, colorsRef.current);
      }
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [getState, hidden]);

  const setCafeOpacity = useSettingsStore((s) => s.setCafeOpacity);

  if (hidden) return null;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-0 pointer-events-none flex justify-center overflow-hidden"
        style={{ opacity: cafeOpacity / 100 }}
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            width: "100%",
            maxWidth: 960,
            height: "auto",
            imageRendering: "pixelated",
            aspectRatio: `${W} / ${H}`,
          }}
        />
      </div>

      {/* Floating opacity control */}
      <div className="fixed bottom-4 right-3 z-10 flex flex-col items-center gap-1 group">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-brew-bg/90 border border-brew-border rounded-lg px-2 py-3 flex flex-col items-center gap-2 shadow-lg">
          <span className="text-[8px] font-bold uppercase tracking-[1px] text-brew-gray select-none">
            {cafeOpacity}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={cafeOpacity}
            onChange={(e) => setCafeOpacity(Number(e.target.value))}
            className="accent-brew-orange"
            style={{
              writingMode: "vertical-lr",
              direction: "rtl",
              width: 20,
              height: 80,
            }}
          />
          <LucideIcon name="coffee" size={10} className="text-brew-gray" />
        </div>
        <button
          className="w-7 h-7 rounded-full bg-brew-bg/80 border border-brew-border text-brew-gray hover:text-brew-cream hover:border-brew-orange transition-colors flex items-center justify-center text-[11px] shadow-md"
          title={tb("cafeAmbiance")}
          onClick={() => setCafeOpacity(cafeOpacity > 0 ? 0 : 40)}
        >
          <LucideIcon name="coffee" size={12} />
        </button>
      </div>
    </>
  );
}
