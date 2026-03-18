"use client";

import type { TaskCategory } from "@/types/task";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";

interface CategoryBadgeProps {
  category: TaskCategory;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <span
      className="text-[9px] font-bold uppercase tracking-[1px] px-1.5 py-0.5 rounded"
      style={{
        backgroundColor: `${color}21`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
