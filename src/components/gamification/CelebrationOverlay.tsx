"use client";

import { useEffect } from "react";

const PARTICLE_COUNT = 40;
const DURATION = 3000;

const COLORS = ["#E07A3A", "#F5D5A0", "#C4A24E", "#6BA368", "#5B8EC9", "#B55B8E", "#8B6BC9"];

interface CelebrationOverlayProps {
  onDone: () => void;
}

export default function CelebrationOverlay({ onDone }: CelebrationOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const size = 6 + Math.random() * 8;
        const color = COLORS[i % COLORS.length];
        const drift = (Math.random() - 0.5) * 120;
        const rotation = Math.random() * 720;

        return (
          <div
            key={i}
            className="absolute animate-confetti-fall"
            style={{
              left: `${left}%`,
              top: "-10px",
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: color,
              borderRadius: "2px",
              animationDelay: `${delay}s`,
              animationDuration: `${1.8 + Math.random() * 1.2}s`,
              // @ts-expect-error CSS custom properties for animation
              "--drift": `${drift}px`,
              "--rotation": `${rotation}deg`,
            }}
          />
        );
      })}

    </div>
  );
}
