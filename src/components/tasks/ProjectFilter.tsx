"use client";

import { useState, useRef } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useTranslations } from "next-intl";

export default function ProjectFilter() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const addProject = useProjectStore((s) => s.addProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const renameProject = useProjectStore((s) => s.renameProject);
  const t = useTranslations("tasks");

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    if (newName.trim()) {
      addProject(newName.trim());
      setNewName("");
      setAdding(false);
    }
  }

  function handleRename(id: string) {
    if (editName.trim()) {
      renameProject(id, editName.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
      {/* All filter */}
      <button
        onClick={() => setActiveProject(null)}
        className={`text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
          activeProjectId === null
            ? "bg-brew-orange text-[#0D0B09] font-bold"
            : "bg-brew-bg text-brew-gray hover:text-brew-cream border border-brew-border"
        }`}
      >
        {t("all")}
      </button>

      {/* Project pills */}
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => setActiveProject(p.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            setEditingId(p.id);
            setEditName(p.name);
          }}
          className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[1px] px-2 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            activeProjectId === p.id
              ? "font-bold border-2"
              : "bg-brew-bg border border-brew-border text-brew-gray hover:text-brew-cream"
          }`}
          style={
            activeProjectId === p.id
              ? {
                  backgroundColor: `${p.color}21`,
                  borderColor: p.color,
                  color: p.color,
                }
              : undefined
          }
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          {editingId === p.id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(p.id);
                if (e.key === "Escape") setEditingId(null);
                if (e.key === "Delete" || e.key === "Backspace") {
                  if (editName === "") {
                    e.preventDefault();
                    deleteProject(p.id);
                    setEditingId(null);
                  }
                }
              }}
              autoFocus
              className="bg-transparent border-none outline-none text-[10px] uppercase tracking-[1px] w-[60px] text-brew-cream"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            p.name
          )}
        </button>
      ))}

      {/* Add button */}
      {adding ? (
        <input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={() => {
            handleAdd();
            if (!newName.trim()) setAdding(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") {
              setNewName("");
              setAdding(false);
            }
          }}
          autoFocus
          placeholder={t("projectName")}
          className="text-[10px] bg-brew-bg border border-brew-border rounded-full px-2 py-1 outline-none text-brew-cream placeholder:text-brew-gray w-[80px]"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-[10px] text-brew-gray hover:text-brew-orange bg-brew-bg border border-brew-border rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          aria-label={t("addProject")}
        >
          +
        </button>
      )}
    </div>
  );
}
