"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useThemeStore } from "@/stores/themeStore";
import { CAFE_THEMES } from "@/lib/themes";
import {
  CUP_OUTLINE,
  LIQUID_FILL_ROWS,
  TOTAL_LIQUID_ROWS,
} from "./cupPixelData";

const GRID_SIZE = 16;
const PIXEL_SIZE = 6;
const PIXEL_SIZE_MOBILE = 4;
const TRANSITION_MS = 700;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

export default function CoffeeCup() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const sessionType = useTimerStore((s) => s.sessionType);
  const selectedTheme = useThemeStore((s) => s.selectedTheme);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPixelsRef = useRef<(string | null)[][]>([]);
  const currentColorsRef = useRef<([number, number, number] | null)[][]>([]);
  const animFrameRef = useRef<number>(0);
  const transitionStartRef = useRef<number>(0);

  const themeColors = CAFE_THEMES[selectedTheme].colors;
  const COFFEE_DARK = themeColors.coffeeDark;
  const COFFEE_MID = themeColors.coffeeMid;
  const COFFEE_LIGHT = themeColors.coffeeLight;
  const ORANGE = themeColors.orange;
  const ORANGE_DIM = themeColors.orangeDim;

  const fillPercent = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const isBreak = sessionType === "break";

  const pixels = useMemo(() => {
    const filledRows = Math.round(fillPercent * TOTAL_LIQUID_ROWS);
    const grid: (string | null)[][] = CUP_OUTLINE.map((row) => [...row]);

    for (let i = 0; i < TOTAL_LIQUID_ROWS; i++) {
      const fillInfo = LIQUID_FILL_ROWS[TOTAL_LIQUID_ROWS - 1 - i];
      const isFilled = i < filledRows;

      if (isFilled) {
        const isTopRow = i === filledRows - 1;
        for (let col = fillInfo.colStart; col <= fillInfo.colEnd; col++) {
          if (grid[fillInfo.row][col] === null) {
            if (isBreak) {
              grid[fillInfo.row][col] = isTopRow ? ORANGE : ORANGE_DIM;
            } else {
              grid[fillInfo.row][col] = isTopRow ? COFFEE_LIGHT : COFFEE_MID;
            }
          }
        }
        if (!isTopRow && i < 2) {
          for (let col = fillInfo.colStart; col <= fillInfo.colEnd; col++) {
            if (
              grid[fillInfo.row][col] === COFFEE_MID ||
              grid[fillInfo.row][col] === ORANGE_DIM
            ) {
              grid[fillInfo.row][col] = isBreak ? ORANGE_DIM : COFFEE_DARK;
            }
          }
        }
      }
    }

    return grid;
  }, [fillPercent, isBreak, COFFEE_DARK, COFFEE_MID, COFFEE_LIGHT, ORANGE, ORANGE_DIM]);

  // Get pixel size based on viewport
  const getPixelSize = () =>
    typeof window !== "undefined" && window.innerWidth <= 640
      ? PIXEL_SIZE_MOBILE
      : PIXEL_SIZE;

  // Draw a single frame
  const drawCanvas = useCallback((colors: ([number, number, number] | null)[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ps = getPixelSize();
    const size = GRID_SIZE * ps;
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const c = colors[row]?.[col];
        if (c) {
          ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
          ctx.fillRect(col * ps, row * ps, ps, ps);
        }
      }
    }
  }, []);

  useEffect(() => {
    const prev = prevPixelsRef.current;
    const targetColors: ([number, number, number] | null)[][] = pixels.map((row) =>
      row.map((hex) => (hex ? hexToRgb(hex) : null))
    );

    // If no previous state, draw immediately
    if (prev.length === 0) {
      currentColorsRef.current = targetColors;
      prevPixelsRef.current = pixels;
      drawCanvas(targetColors);
      return;
    }

    // Compute start colors from previous pixels
    const startColors: ([number, number, number] | null)[][] = prev.map((row) =>
      row.map((hex) => (hex ? hexToRgb(hex) : null))
    );

    prevPixelsRef.current = pixels;
    transitionStartRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - transitionStartRef.current;
      const t = Math.min(elapsed / TRANSITION_MS, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // ease-in-out

      const interpolated: ([number, number, number] | null)[][] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        const rowColors: ([number, number, number] | null)[] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
          const from = startColors[row]?.[col];
          const to = targetColors[row]?.[col];
          if (!from && !to) {
            rowColors.push(null);
          } else if (!from && to) {
            rowColors.push(lerpColor([0, 0, 0], to, eased));
          } else if (from && !to) {
            rowColors.push(eased >= 1 ? null : lerpColor(from, [0, 0, 0], eased));
          } else {
            rowColors.push(lerpColor(from!, to!, eased));
          }
        }
        interpolated.push(rowColors);
      }

      currentColorsRef.current = interpolated;
      drawCanvas(interpolated);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentColorsRef.current = targetColors;
      }
    };

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [pixels, drawCanvas]);

  // Handle resize
  useEffect(() => {
    const onResize = () => {
      if (currentColorsRef.current.length > 0) {
        drawCanvas(currentColorsRef.current);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawCanvas]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Tasse de cafe ${Math.round(fillPercent * 100)}% pleine`}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
