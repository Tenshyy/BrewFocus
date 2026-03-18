"use client";

import { useEffect, useState } from "react";

const PARTICLE_COUNT = 40;
const DURATION = 3000;

const COLORS = ["#E07A3A", "#F5D5A0", "#C4A24E", "#6BA368", "#5B8EC9", "#B55B8E", "#8B6BC9"];

// Seeded pseudo-random to keep render pure
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const s = i + 1;
    return {
      left: seededRandom(s * 1) * 100,
      delay: seededRandom(s * 2) * 0.8,
      size: 6 + seededRandom(s * 3) * 8,
      color: COLORS[i % COLORS.length],
      drift: (seededRandom(s * 4) - 0.5) * 120,
      rotation: seededRandom(s * 5) * 720,
      duration: 1.8 + seededRandom(s * 6) * 1.2,
    };
  });
}

interface CelebrationOverlayProps {
  onDone: () => void;
}

export default function CelebrationOverlay({ onDone }: CelebrationOverlayProps) {
  const [particles] = useState(generateParticles);

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            borderRadius: "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // @ts-expect-error CSS custom properties for animation
            "--drift": `${p.drift}px`,
            "--rotation": `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
