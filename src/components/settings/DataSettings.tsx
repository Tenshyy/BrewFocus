"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import {
  downloadBackup,
  importData,
  getLastBackupTimestamp,
  type BackupData,
} from "@/lib/backup";

export default function DataSettings() {
  const t = useTranslations("settings");
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLastBackup(getLastBackupTimestamp());
  }, []);

  function handleExport() {
    downloadBackup();
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);
      const result = importData(data, "replace");

      if (result.success) {
        setImportStatus({ type: "success", message: result.message });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus({ type: "error", message: result.message });
      }
    } catch {
      setImportStatus({
        type: "error",
        message: t("invalidJson"),
      });
    }

    e.target.value = "";
  }

  // eslint-disable-next-line react-hooks/purity -- Date.now() needed for relative time display
  const now = Date.now();
  function formatTimestamp(iso: string | null): string {
    if (!iso) return t("never");
    const d = new Date(iso);
    const mins = Math.round((now - d.getTime()) / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return t("minutesAgo", { mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("hoursAgo", { hours });
    return d.toLocaleDateString();
  }

  return (
    <div className="space-y-5">
      {/* Export */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-2">
          {t("exportLabel")}
        </label>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          {t("downloadData")}
        </Button>
        <p className="text-[9px] text-brew-gray mt-1">
          {t("exportHelp")}
        </p>
      </div>

      {/* Import */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-2">
          {t("importLabel")}
        </label>
        <Button variant="secondary" size="sm" onClick={handleImportClick}>
          {t("restoreFile")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-[9px] text-brew-gray mt-1">
          {t("importHelp")}
        </p>
        {importStatus.type !== "idle" && (
          <p
            className={`text-[10px] mt-2 ${
              importStatus.type === "success"
                ? "text-cat-perso"
                : "text-red-400"
            }`}
          >
            {importStatus.message}
          </p>
        )}
      </div>

      {/* Auto-backup info */}
      <div className="pt-3 border-t border-brew-border">
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray block mb-1">
          {t("autoBackup")}
        </label>
        <p className="text-[11px] text-brew-cream">
          {t("lastBackup")}{formatTimestamp(lastBackup)}
        </p>
        <p className="text-[9px] text-brew-gray mt-1">
          {t("backupHelp")}
        </p>
      </div>
    </div>
  );
}
