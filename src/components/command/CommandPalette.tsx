"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Command } from "@/lib/commands";
import { filterByFuzzy } from "@/lib/fuzzySearch";
import LucideIcon from "@/components/ui/LucideIcon";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

const CATEGORY_ORDER = ["timer", "tasks", "ai", "navigation", "settings"] as const;

const CATEGORY_ICONS: Record<string, string> = {
  timer: "clock",
  tasks: "check-square",
  ai: "sparkles",
  navigation: "compass",
  settings: "settings",
};

export default function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const t = useTranslations("command");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Filter commands by fuzzy search
  const filtered = useMemo(() => filterByFuzzy(commands, query), [commands, query]);

  // Group filtered commands by category, preserving a stable flat index
  const { grouped, flatList } = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    const sortedGroups: { category: string; commands: Command[] }[] = [];
    const flat: Command[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (groups[cat]) {
        sortedGroups.push({ category: cat, commands: groups[cat] });
        flat.push(...groups[cat]);
      }
    }
    return { grouped: sortedGroups, flatList: flat };
  }, [filtered]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Clamp selectedIndex when list changes
  useEffect(() => {
    if (selectedIndex >= flatList.length) {
      setSelectedIndex(Math.max(0, flatList.length - 1));
    }
  }, [flatList.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (cmd: Command) => {
      onClose();
      requestAnimationFrame(() => cmd.action());
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, flatList.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + flatList.length) % Math.max(1, flatList.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatList[selectedIndex]) executeCommand(flatList[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatList, selectedIndex, executeCommand, onClose]
  );

  if (!open) return null;

  // Pre-compute flat index offset for each category group
  const groupOffsets = useMemo(() => {
    const offsets: number[] = [];
    let sum = 0;
    for (const group of grouped) {
      offsets.push(sum);
      sum += group.commands.length;
    }
    return offsets;
  }, [grouped]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("placeholder")}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 bg-brew-panel border border-brew-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-brew-border">
          <span className="text-brew-gray"><LucideIcon name="search" size={18} /></span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="flex-1 bg-transparent text-brew-cream placeholder:text-brew-gray/50 outline-none text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-block text-[10px] text-brew-gray bg-brew-bg border border-brew-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <p className="text-center text-brew-gray/60 py-8 text-sm">
              {t("noResults")}
            </p>
          ) : (
            grouped.map((group, groupIdx) => (
              <div key={group.category}>
                {/* Category header */}
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brew-gray/50">
                  <LucideIcon name={CATEGORY_ICONS[group.category]} size={10} className="inline-block mr-1" />{" "}
                  {t(`category${group.category.charAt(0).toUpperCase()}${group.category.slice(1)}`)}
                </div>
                {/* Commands */}
                {group.commands.map((cmd, cmdIdx) => {
                  const idx = groupOffsets[groupIdx] + cmdIdx;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(idx, el);
                        else itemRefs.current.delete(idx);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-brew-orange/15 text-brew-cream"
                          : "text-brew-cream/80 hover:bg-brew-orange/10"
                      }`}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="w-6 text-center flex-shrink-0"><LucideIcon name={cmd.icon} size={16} /></span>
                      <span className="flex-1 truncate">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-brew-border text-[10px] text-brew-gray/40">
          <span>{"↑↓"} {t("navigate")}</span>
          <span>{"↵"} {t("execute")}</span>
          <span>ESC {t("closeHint")}</span>
        </div>
      </div>
    </div>
  );
}
