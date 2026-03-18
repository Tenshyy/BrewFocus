"use client";

import { motion } from "motion/react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export default function Card({ children, className = "", animated = false }: CardProps) {
  const baseClass = `bg-brew-panel border border-brew-border rounded-xl p-7 shadow-[0_4px_24px_rgba(13,11,9,0.53)] ${className}`;

  if (animated) {
    return (
      <motion.div
        className={baseClass}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass}>
      {children}
    </div>
  );
}
